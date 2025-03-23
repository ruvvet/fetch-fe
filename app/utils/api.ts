import { redirect, Session } from '@remix-run/node';
import { destroySession, getSession } from '~/session';

export const middlewareSessionAuth = async (req: Request) => {
  const session = await getSession(req.headers.get('Cookie'));
  const cookie = session.get('token');
  if (!session || !cookie) {
    await destroySession(session);
    throw redirect('/auth', {
      headers: {
        'Set-Cookie': await destroySession(session)
      }
    });
  }

  return session;
};

//TODO: app fetch wrapper to handle fetch logic across app
export const appFetch = async (
  api: () => Promise<void>,
  session?: Session,
  cookie?: string,
  request?: Request
) => {
  if (!session) {
    if (!request) {
      throw new Error('Bad request');
    }

    session = await middlewareSessionAuth(request);
    cookie = (session as Session).get('token');
  }
};

export const searchDogs = async (cookie: string, url: string) => {
  const searchRes = await fetch(
    `https://frontend-take-home-service.fetch.com/dogs/search${url.search}`,
    {
      method: 'GET',
      // credentials: 'include',
      headers: {
        // 'Set-Cookie': cookie,
        Cookie: cookie
      }
    }
  );
};

export const getDogsByID = async () => {};
