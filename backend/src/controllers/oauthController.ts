import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { google } from 'googleapis';
import User, { LoginProvider, IUser } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { env } from '../config/env';
import { sendSuccess } from '../utils/response';

const externalProviders: Array<Exclude<LoginProvider, 'password'>> = ['google', 'linkedin', 'facebook'];

interface OAuthProfile {
  provider: Exclude<LoginProvider, 'password'>;
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
}

const getAllowedClientUrl = (): string => (env.clientUrl || 'http://localhost:5173').replace(/\/$/, '');

const getDefaultClientRedirect = (): string => `${getAllowedClientUrl()}/oauth/callback`;

const isAllowedRedirect = (target?: string): target is string => {
  if (!target) return false;
  try {
    const allowed = new URL(getAllowedClientUrl());
    const requested = new URL(target);
    return requested.origin === allowed.origin;
  } catch (error) {
    return false;
  }
};

const resolveClientRedirect = (requested?: string): string => {
  if (requested && isAllowedRedirect(requested)) {
    return requested;
  }
  return getDefaultClientRedirect();
};

const getServerBaseUrl = (req: Request): string => {
  const configured = env.serverBaseUrl?.replace(/\/$/, '');
  if (configured) {
    return configured;
  }
  const protoHeader = (req.headers['x-forwarded-proto'] as string | undefined)?.split(',')[0]?.trim();
  const hostHeader = (req.headers['x-forwarded-host'] as string | undefined)?.split(',')[0]?.trim();
  const protocol = protoHeader || req.protocol;
  const host = hostHeader || req.get('host') || 'localhost:4000';
  return `${protocol}://${host}`.replace(/\/$/, '');
};

const buildCallbackUrl = (req: Request, provider: Exclude<LoginProvider, 'password'>): string => {
  return `${getServerBaseUrl(req)}/api/auth/oauth/${provider}/callback`;
};

const ensureSession = (req: Request) => {
  if (!req.session) {
    throw new AppError('Session is not initialized', 500);
  }
  return req.session;
};

const ensureJwtSecret = (): string => {
  if (!process.env.JWT_SECRET) {
    throw new AppError('JWT_SECRET is not defined', 500);
  }
  return process.env.JWT_SECRET;
};

const providerHasConfig = (provider: Exclude<LoginProvider, 'password'>): boolean => {
  switch (provider) {
    case 'google':
      return Boolean(env.googleOAuthClientId && env.googleOAuthClientSecret);
    case 'linkedin':
      return Boolean(env.linkedinClientId && env.linkedinClientSecret);
    case 'facebook':
      return Boolean(env.facebookClientId && env.facebookClientSecret);
    default:
      return false;
  }
};

const configuredProviders = (): Array<Exclude<LoginProvider, 'password'>> =>
  externalProviders.filter((provider) => providerHasConfig(provider));

const generateUniqueUsername = async (hint: string): Promise<string> => {
  const cleaned = hint
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 20);
  let base = cleaned || `grownet${crypto.randomBytes(2).toString('hex')}`;
  base = base.slice(0, 20);
  let candidate = base;
  let counter = 1;

  while (await User.exists({ username: candidate })) {
    const suffix = `${counter}`;
    const allowedLength = Math.max(3, 30 - suffix.length);
    candidate = `${base.slice(0, allowedLength)}${suffix}`;
    counter += 1;
  }

  return candidate;
};

const upsertOAuthProviderInfo = (
  user: IUser,
  provider: Exclude<LoginProvider, 'password'>,
  accountId?: string
): void => {
  const now = new Date();
  user.lastLoginProvider = provider;
  user.lastLoginAt = now;
  user.lastActive = now;

  if (!Array.isArray(user.oauthProviders)) {
    user.oauthProviders = [];
  }

  const existing = user.oauthProviders.find((entry) => {
    if (entry.provider !== provider) return false;
    if (!accountId) return true;
    return entry.accountId === accountId;
  });

  if (existing) {
    existing.lastLoginAt = now;
    if (accountId) {
      existing.accountId = accountId;
    }
  } else {
    user.oauthProviders.push({
      provider,
      accountId,
      lastLoginAt: now
    });
  }
};

const findOrCreateUser = async (
  profile: OAuthProfile
): Promise<{ user: IUser; isNew: boolean }> => {
  const email = profile.email?.toLowerCase();
  if (!email) {
    throw new AppError('Không thể lấy email từ nhà cung cấp', 400);
  }

  let user = await User.findOne({ email });
  if (user) {
    upsertOAuthProviderInfo(user, profile.provider, profile.id);
    if (!user.fullName && profile.fullName) {
      user.fullName = profile.fullName;
    }
    if (!user.avatar && profile.avatar) {
      user.avatar = profile.avatar;
    }
    await user.save();
    return { user, isNew: false };
  }

  const usernameHint = profile.fullName || email.split('@')[0] || 'grownet';
  const username = await generateUniqueUsername(usernameHint);
  const randomPassword = crypto.randomBytes(12).toString('hex');
  const hashedPassword = await bcrypt.hash(randomPassword, 10);

  user = await User.create({
    username,
    email,
    password: hashedPassword,
    fullName: profile.fullName || username,
    avatar: profile.avatar,
    interests: [],
    fields: [],
    skills: [],
    role: 'mentee'
  });

  upsertOAuthProviderInfo(user, profile.provider, profile.id);
  await user.save();

  return { user, isNew: true };
};

const buildGoogleProfile = async (
  code: string,
  callbackUrl: string
): Promise<OAuthProfile> => {
  if (!env.googleOAuthClientId || !env.googleOAuthClientSecret) {
    throw new AppError('Google OAuth không được cấu hình', 500);
  }

  const oauthClient = new google.auth.OAuth2(
    env.googleOAuthClientId,
    env.googleOAuthClientSecret,
    callbackUrl
  );
  const { tokens } = await oauthClient.getToken(code);
  oauthClient.setCredentials(tokens);
  const oauth2 = google.oauth2({ version: 'v2', auth: oauthClient });
  const { data } = await oauth2.userinfo.get();

  if (!data.id || !data.email) {
    throw new AppError('Không lấy được thông tin Google', 400);
  }

  return {
    provider: 'google',
    id: data.id,
    email: data.email,
    fullName: data.name || data.email,
    avatar: data.picture || undefined
  };
};

const buildLinkedInProfile = async (
  code: string,
  callbackUrl: string
): Promise<OAuthProfile> => {
  if (!env.linkedinClientId || !env.linkedinClientSecret) {
    throw new AppError('LinkedIn OAuth không được cấu hình', 500);
  }

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: callbackUrl,
    client_id: env.linkedinClientId,
    client_secret: env.linkedinClientSecret
  });

  const tokenResponse = await axios.post(
    'https://www.linkedin.com/oauth/v2/accessToken',
    params.toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  const accessToken = tokenResponse.data?.access_token;
  if (!accessToken) {
    throw new AppError('Không lấy được access token từ LinkedIn', 400);
  }

  const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  const { sub, email, name, picture } = profileResponse.data || {};
  if (!sub || !email) {
    throw new AppError('Không lấy được dữ liệu LinkedIn', 400);
  }

  let avatar: string | undefined;
  if (typeof picture === 'string') {
    avatar = picture;
  } else if (picture?.data?.elements?.length) {
    avatar = picture.data.elements[0]?.identifiers?.[0]?.identifier;
  }

  return {
    provider: 'linkedin',
    id: String(sub),
    email: String(email).toLowerCase(),
    fullName: name || email,
    avatar
  };
};

const buildFacebookProfile = async (
  code: string,
  callbackUrl: string
): Promise<OAuthProfile> => {
  if (!env.facebookClientId || !env.facebookClientSecret) {
    throw new AppError('Facebook OAuth không được cấu hình', 500);
  }

  const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
    params: {
      client_id: env.facebookClientId,
      client_secret: env.facebookClientSecret,
      redirect_uri: callbackUrl,
      code
    }
  });

  const accessToken = tokenResponse.data?.access_token;
  if (!accessToken) {
    throw new AppError('Không lấy được access token từ Facebook', 400);
  }

  const profileResponse = await axios.get('https://graph.facebook.com/me', {
    params: {
      fields: 'id,name,email,picture',
      access_token: accessToken
    }
  });

  const { id, email, name, picture } = profileResponse.data || {};
  if (!id || !email) {
    throw new AppError('Không lấy được dữ liệu Facebook', 400);
  }

  let avatar: string | undefined;
  if (picture?.data?.url) {
    avatar = picture.data.url;
  }

  return {
    provider: 'facebook',
    id: String(id),
    email: String(email).toLowerCase(),
    fullName: name || email,
    avatar
  };
};

const buildProfile = async (
  provider: Exclude<LoginProvider, 'password'>,
  code: string,
  callbackUrl: string
): Promise<OAuthProfile> => {
  switch (provider) {
    case 'google':
      return buildGoogleProfile(code, callbackUrl);
    case 'linkedin':
      return buildLinkedInProfile(code, callbackUrl);
    case 'facebook':
      return buildFacebookProfile(code, callbackUrl);
    default:
      throw new AppError('Provider không được hỗ trợ', 400);
  }
};

const issueRedirect = (
  res: Response,
  target: string,
  params: Record<string, string | undefined>
): void => {
  const url = new URL(target);
  Object.entries(params).forEach(([key, value]) => {
    if (typeof value !== 'undefined') {
      url.searchParams.set(key, value);
    }
  });
  res.redirect(url.toString());
};

export const initiateOAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const provider = req.params.provider as Exclude<LoginProvider, 'password'>;
    if (!externalProviders.includes(provider)) {
      throw new AppError('Provider không hợp lệ', 400);
    }

    const redirectParam = typeof req.query.redirect === 'string' ? req.query.redirect : undefined;
    const redirectTo = resolveClientRedirect(redirectParam);

    if (!providerHasConfig(provider)) {
      issueRedirect(res, redirectTo, {
        error: `Đăng nhập ${provider} chưa được cấu hình`,
        provider
      });
      return;
    }
    const state = crypto.randomBytes(16).toString('hex');
    const session = ensureSession(req);
    session.oauthState = {
      value: state,
      provider,
      redirectTo,
      createdAt: Date.now()
    };

    const callbackUrl = buildCallbackUrl(req, provider);
    let authorizationUrl = '';

    if (provider === 'google') {
      const scopes = ['openid', 'profile', 'email'];
      const oauthClient = new google.auth.OAuth2(
        env.googleOAuthClientId,
        env.googleOAuthClientSecret,
        callbackUrl
      );
      authorizationUrl = oauthClient.generateAuthUrl({
        scope: scopes,
        access_type: 'offline',
        prompt: 'consent',
        state
      });
    } else if (provider === 'linkedin') {
      const scopes = ['openid', 'profile', 'email'];
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: env.linkedinClientId || '',
        redirect_uri: callbackUrl,
        state,
        scope: scopes.join(' ')
      });
      authorizationUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
    } else if (provider === 'facebook') {
      const scopes = ['email', 'public_profile'];
      const params = new URLSearchParams({
        client_id: env.facebookClientId || '',
        redirect_uri: callbackUrl,
        state,
        scope: scopes.join(',')
      });
      authorizationUrl = `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
    }

    res.redirect(authorizationUrl);
  } catch (error) {
    next(error);
  }
};

export const handleOAuthCallback = async (req: Request, res: Response): Promise<void> => {
  const provider = req.params.provider as Exclude<LoginProvider, 'password'>;
  const sessionState = req.session?.oauthState;
  const redirectTarget = sessionState?.redirectTo || getDefaultClientRedirect();

  const sendError = (message: string) => {
    issueRedirect(res, redirectTarget, {
      error: message,
      provider
    });
  };

  try {
    if (!externalProviders.includes(provider)) {
      throw new AppError('Provider không hợp lệ', 400);
    }

    if (!sessionState || sessionState.provider !== provider) {
      throw new AppError('Phiên đăng nhập đã hết hạn. Vui lòng thử lại.', 400);
    }

    const { state, code } = req.query;
    if (typeof state !== 'string' || sessionState.value !== state) {
      throw new AppError('Trạng thái xác thực không hợp lệ', 400);
    }
    if (typeof code !== 'string') {
      throw new AppError('Không tìm thấy mã xác thực', 400);
    }

    const callbackUrl = buildCallbackUrl(req, provider);
    const profile = await buildProfile(provider, code, callbackUrl);
    const { user, isNew } = await findOrCreateUser(profile);
    const secret = ensureJwtSecret();
    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '7d' });

    issueRedirect(res, redirectTarget, {
      token,
      provider,
      newUser: isNew ? '1' : '0'
    });
  } catch (error: any) {
    console.error(`[OAuth:${provider}] callback error`, error);
    const message = error instanceof AppError ? error.message : 'Không thể hoàn tất đăng nhập mạng xã hội';
    sendError(message);
  } finally {
    if (req.session) {
      req.session.oauthState = undefined;
    }
  }
};

export const listOAuthProviders = (_req: Request, res: Response): void => {
  const providers = configuredProviders();
  sendSuccess(res, providers, { message: 'Danh sách nhà cung cấp OAuth đã được cấu hình' });
};
