import { Response } from 'express';
import mongoose from 'mongoose';
import Chat from '../models/Chat';
import Meeting from '../models/Meeting';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/response';
import { createCalendarEvent, deleteCalendarEvent } from '../services/googleCalendar';

type PopulatedParticipant =
  | mongoose.Types.ObjectId
  | (mongoose.Document & {
      _id: mongoose.Types.ObjectId;
      email?: string;
      fullName?: string;
      username?: string;
    });

type PopulatedChat = mongoose.Document & { participants: PopulatedParticipant[] };

type NormalizedAttendee = {
  email: string;
  userId?: mongoose.Types.ObjectId;
};

type ParticipantDocument = Extract<PopulatedParticipant, mongoose.Document>;

const isPopulatedParticipant = (
  participant: PopulatedParticipant
): participant is ParticipantDocument => (
  !(participant instanceof mongoose.Types.ObjectId)
);

const isNormalizedAttendee = (
  attendee: NormalizedAttendee | null
): attendee is NormalizedAttendee => Boolean(attendee);

interface AttendeePayload {
  userId?: string;
  email?: string;
}

const ensureParticipant = async (chatId: string, userId?: string | null): Promise<PopulatedChat> => {
  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }

  const chat = await Chat.findById(chatId)
    .populate('participants', 'email fullName username') as PopulatedChat | null;
  if (!chat) {
    throw new AppError('Chat not found', 404);
  }

  const participants = chat.participants as PopulatedParticipant[];

  const isParticipant = participants.some(participant => {
    const id = participant instanceof mongoose.Types.ObjectId ? participant : participant._id;
    return id?.toString() === userId;
  });

  if (!isParticipant) {
    throw new AppError('Unauthorized', 403);
  }

  return chat;
};

const normalizeAttendees = (
  chat: PopulatedChat,
  attendees?: AttendeePayload[]
): NormalizedAttendee[] => {
  const participants = chat.participants as PopulatedParticipant[];

  if (attendees && attendees.length > 0) {
    return attendees
      .map((att): NormalizedAttendee | null => {
        if (att.email) {
          return {
            email: att.email,
            userId: att.userId ? new mongoose.Types.ObjectId(att.userId) : undefined
          };
        }
        if (!att.userId) {
          return null;
        }
        const participant = participants.find((candidate): candidate is ParticipantDocument => (
          isPopulatedParticipant(candidate) && candidate._id?.toString() === att.userId
        ));
        if (participant?.email) {
          return { email: participant.email, userId: participant._id };
        }
        return null;
      })
      .filter(isNormalizedAttendee);
  }

  return participants
    .map((participant): NormalizedAttendee | null => {
      if (!isPopulatedParticipant(participant) || !participant.email) {
        return null;
      }
      return { email: participant.email, userId: participant._id };
    })
    .filter(isNormalizedAttendee);
};

const toISO = (value: string | Date) => new Date(value).toISOString();

export const createMeeting = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { chatId, title, description, startTime, endTime, attendees, location, provider = 'google_meet' } = req.body;
    if (!chatId || !title || !startTime || !endTime) {
      throw new AppError('Missing required fields', 400);
    }

    if (!req.userId) {
      throw new AppError('Unauthorized', 401);
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (start >= end) {
      throw new AppError('End time must be after start time', 400);
    }

    const chat = await ensureParticipant(chatId, req.userId);
    const normalizedAttendees = normalizeAttendees(chat, attendees);

    if (normalizedAttendees.length === 0) {
      throw new AppError('No attendee emails available', 400);
    }

    const event = await createCalendarEvent({
      summary: title,
      description,
      start: toISO(start),
      end: toISO(end),
      attendees: normalizedAttendees.map((att: NormalizedAttendee) => ({ email: att.email })),
      enableConference: provider === 'google_meet',
      location
    });

    const chatObjectId = new mongoose.Types.ObjectId(chatId);
    const organizerObjectId = new mongoose.Types.ObjectId(req.userId);
    const calendarEventId = event.id || event.iCalUID || `local-${Date.now()}`;
    const videoLink = event.hangoutLink || event.conferenceData?.entryPoints?.[0]?.uri || undefined;

    const meeting = await Meeting.create({
      chatId: chatObjectId,
      organizerId: organizerObjectId,
      title,
      description,
      startTime: start,
      endTime: end,
      attendees: normalizedAttendees,
      videoLink,
      provider,
      calendarEventId,
      calendarId: event.organizer?.email || (process.env.GOOGLE_CALENDAR_ID as string)
    });

    sendSuccess(res, meeting, {
      status: 201,
      message: 'Meeting scheduled successfully'
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const createInstantMeeting = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { chatId, durationMinutes = 45, title = 'Cuộc gọi nhanh GrowNet' } = req.body;
    if (!chatId) {
      throw new AppError('chatId is required', 400);
    }

    const now = new Date();
    const end = new Date(now.getTime() + durationMinutes * 60000);

    req.body.startTime = now.toISOString();
    req.body.endTime = end.toISOString();
    req.body.title = title;

    return createMeeting(req, res);
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const getMeetingsByChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;
    await ensureParticipant(chatId, req.userId);

    const meetings = await Meeting.find({ chatId })
      .sort({ startTime: -1 });

    sendSuccess(res, meetings, {
      meta: {
        count: meetings.length
      }
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const getUserMeetings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      throw new AppError('Unauthorized', 401);
    }

    const userObjectId = new mongoose.Types.ObjectId(req.userId);
    const { start, end } = req.query as { start?: string; end?: string };
    const startTimeFilter: Record<string, Date> = {};

    if (start) {
      startTimeFilter.$gte = new Date(start);
    }
    if (end) {
      startTimeFilter.$lte = new Date(end);
    }

    const query: Record<string, unknown> = {
      $or: [
        { organizerId: userObjectId },
        { 'attendees.userId': userObjectId }
      ]
    };

    if (Object.keys(startTimeFilter).length > 0) {
      query.startTime = startTimeFilter;
    }

    const meetings = await Meeting.find(query)
      .sort({ startTime: 1 });

    sendSuccess(res, meetings, {
      meta: {
        count: meetings.length
      }
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const deleteMeeting = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { meetingId } = req.params;
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      throw new AppError('Meeting not found', 404);
    }

    await ensureParticipant(meeting.chatId.toString(), req.userId);

    if (meeting.calendarEventId) {
      await deleteCalendarEvent(meeting.calendarEventId, meeting.calendarId);
    }

    await meeting.deleteOne();

    sendSuccess(res, null, { message: 'Meeting cancelled' });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};
