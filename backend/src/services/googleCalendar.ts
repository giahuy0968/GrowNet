import { google, calendar_v3 } from 'googleapis';
import { v4 as uuid } from 'uuid';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const FALLBACK_LINK_PREFIX = (process.env.FALLBACK_MEETING_URL_PREFIX || 'https://meet.jit.si/GrowNet').replace(/\/$/, '');

const hasCalendarCredentials = () => Boolean(
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
  process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY &&
  process.env.GOOGLE_CALENDAR_ID
);

const getAuthClient = () => {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\n/g, '\n');

  if (!clientEmail || !privateKey) {
    throw new Error('Google service account credentials are not configured');
  }

  return new google.auth.JWT(clientEmail, undefined, privateKey, SCOPES);
};

const calendar = google.calendar('v3');

const buildFallbackLink = () => {
  const slug = uuid().replace(/-/g, '').slice(0, 10);
  return `${FALLBACK_LINK_PREFIX}-${slug}`;
};

const buildFallbackEvent = (input: CalendarEventInput): calendar_v3.Schema$Event => {
  const fallbackLink = buildFallbackLink();
  return {
    id: `local-${uuid()}`,
    summary: input.summary,
    description: input.description,
    location: input.location,
    start: { dateTime: input.start },
    end: { dateTime: input.end },
    attendees: input.attendees,
    hangoutLink: fallbackLink,
    conferenceData: input.enableConference ? {
      entryPoints: [{ entryPointType: 'video', uri: fallbackLink }]
    } : undefined,
    organizer: {
      email: 'no-reply@grownet.local',
      displayName: 'GrowNet Scheduler'
    }
  };
};

export const isGoogleCalendarConfigured = () => hasCalendarCredentials();

interface CalendarEventInput {
  summary: string;
  description?: string;
  start: string;
  end: string;
  attendees?: { email: string }[];
  enableConference?: boolean;
  calendarId?: string;
  location?: string;
}

export const createCalendarEvent = async (input: CalendarEventInput): Promise<calendar_v3.Schema$Event> => {
  if (!hasCalendarCredentials()) {
    return buildFallbackEvent(input);
  }

  const auth = getAuthClient();
  await auth.authorize();

  const calendarId = input.calendarId || process.env.GOOGLE_CALENDAR_ID;
  if (!calendarId) {
    throw new Error('GOOGLE_CALENDAR_ID is not configured');
  }

  const requestBody: calendar_v3.Schema$Event = {
    summary: input.summary,
    description: input.description,
    location: input.location,
    start: {
      dateTime: input.start
    },
    end: {
      dateTime: input.end
    },
    attendees: input.attendees,
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 10 },
        { method: 'email', minutes: 60 }
      ]
    }
  };

  if (input.enableConference) {
    requestBody.conferenceData = {
      createRequest: {
        conferenceSolutionKey: { type: 'hangoutsMeet' },
        requestId: uuid()
      }
    };
  }

  const response = await calendar.events.insert({
    auth,
    calendarId,
    requestBody,
    conferenceDataVersion: input.enableConference ? 1 : 0
  });

  return response.data;
};

export const deleteCalendarEvent = async (eventId: string, calendarId?: string): Promise<void> => {
  if (!hasCalendarCredentials()) {
    return;
  }

  const auth = getAuthClient();
  await auth.authorize();

  const targetCalendar = calendarId || process.env.GOOGLE_CALENDAR_ID;
  if (!targetCalendar) {
    throw new Error('GOOGLE_CALENDAR_ID is not configured');
  }

  await calendar.events.delete({
    auth,
    calendarId: targetCalendar,
    eventId
  });
};
