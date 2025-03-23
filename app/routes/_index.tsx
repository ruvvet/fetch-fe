import { LoaderFunctionArgs, redirect, Session } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { middlewareSessionAuth, throwAuthRedirect } from '~/utils/api';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await middlewareSessionAuth(request);
  const cookie = (session as Session).get('token');
  if (session && cookie) {
    throw redirect('/dogs');
  }

  await throwAuthRedirect(session);

  return null;
};

const Index = () => <Outlet />;

export default Index;
