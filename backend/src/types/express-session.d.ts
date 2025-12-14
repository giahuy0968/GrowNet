import 'express-session';
import { LoginProvider } from '../models/User';

declare module 'express-session' {
    interface SessionData {
        // stored lowercase captcha text
        captcha?: string;
        oauthState?: {
            value: string;
            provider: LoginProvider;
            redirectTo: string;
            createdAt: number;
        };
    }
}
