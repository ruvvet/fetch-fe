import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
  Session,
  type MetaFunction
} from '@remix-run/node';
import { useLoaderData, useSubmit } from '@remix-run/react';
import { Heart, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import { Spinner } from '~/components/ui/spinner';
import { destroySession } from '~/session';
import { middlewareSessionAuth } from '~/utils/api';

export const meta: MetaFunction = () => {
  return [{ title: 'Fetch Match!' }];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await middlewareSessionAuth(request);
  const data = session.get('data');
  const body = data ? JSON.parse(data) : [];
  const cookie = (session as Session).get('token');

  const res = await fetch(
    'https://frontend-take-home-service.fetch.com/dogs/match',
    {
      method: 'POST',
      body,
      headers: {
        Cookie: cookie,
        'Content-Type': 'application/json'
      }
    }
  );

  if (res.status !== 200) {
    throw redirect('/auth');
  }

  const match = (await res.json()).match;

  const dataRes = await fetch(
    `https://frontend-take-home-service.fetch.com/dogs`,
    {
      method: 'POST',
      headers: {
        Cookie: cookie,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([match])
    }
  );

  if (dataRes.status !== 200) {
    throw redirect('/auth');
  }

  const matchData = (await dataRes.json())[0];
  return matchData;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await middlewareSessionAuth(request);
  if (request.method === 'DELETE') {
    await destroySession(session);
    return redirect('/auth', {
      headers: {
        'Set-Cookie': await destroySession(session)
      }
    });
  }
};

const Match = () => {
  const match = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    submit(
      {},
      {
        method: 'DELETE'
      }
    );

    setLoggingOut(true);
  };

  if (loggingOut) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <Card className="flex flex-col w-[30%] items-center m-2 items-center">
        <CardHeader>
          <div className="flex flex-col justify-center items-center">
            <CardTitle>{match.name}</CardTitle>
            <CardDescription>You matched!</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center pt-4">
          <div className="pt-2 pb-8 px-2 background-color-white">
            <img src={match.img} className="w-[300px] h-[300px] object-cover" />
          </div>
          <div>
            <p>Age: {match.age}</p>
            <p>Breed: {match.breed}</p>
            <p>Zip: {match.zip_code}</p>
          </div>
        </CardContent>
        <CardFooter>
          <Heart />
        </CardFooter>
      </Card>
      <Button onClick={handleLogout}>
        <LogOut />
      </Button>
    </div>
  );
};

export default Match;
