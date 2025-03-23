// app/sessions.ts
import { createCookieSessionStorage } from '@remix-run/node';
type SessionData = {
  token: string | null;
};

type SessionFlashData = {
  error: string;
  data: string;
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: '__session',
      // domain: 'remix.run',
      // domain: 'frontend-take-home-service.fetch.com',
      httpOnly: true,
      // maxAge: 3600,
      path: '/',
      sameSite: 'none',
      secrets: ['secret'],
      // secure: process.env.NODE_ENV === 'production',
      secure: true
    }
  });

export { commitSession, destroySession, getSession };
