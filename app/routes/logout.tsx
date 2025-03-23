import { LoaderFunctionArgs, redirect, Session } from '@remix-run/node';
import { useSubmit } from '@remix-run/react';
import { LogOut } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { destroySession, getSession } from '~/session';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get('Cookie'));
  const cookie = (session as Session).get('token');

  if (request.method === 'POST') {
    const res = await fetch(
      'https://frontend-take-home-service.fetch.com/auth/logout',
      {
        method: 'POST',
        headers: {
          Cookie: cookie,
          'Content-Type': 'application/json'
        }
      }
    );

    await destroySession(session); //FIXME: this might be redundant
    return redirect('/auth', {
      headers: {
        'Set-Cookie': await destroySession(session)
      }
    });
  }

  return null;
};

const Logout = () => {
  const submit = useSubmit();
  const handleLogout = () => {
    submit(
      {},
      {
        method: 'DELETE'
      }
    );
  };

  return (
    <Button onClick={handleLogout}>
      <LogOut />
    </Button>
  );
};
