import 'express-session';

declare module 'express-session' {
    interface SessionData {
        // stored lowercase captcha text
        captcha?: string;
    }
}
