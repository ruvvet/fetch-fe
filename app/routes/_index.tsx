import { LoaderFunctionArgs, Session } from '@remix-run/node';
import { Outlet, redirect } from '@remix-run/react';
import { middlewareSessionAuth } from '~/utils/api';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await middlewareSessionAuth(request);
  const cookie = (session as Session).get('token');
  if (session && cookie) {
    throw redirect('/dogs');
  }
  return null;
};

const Index = () => <Outlet />;

export default Index;
