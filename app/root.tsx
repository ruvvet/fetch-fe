import type { LinksFunction, MetaFunction } from '@remix-run/node';
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError
} from '@remix-run/react';
import './tailwind.css';
import styles from './tailwind.css?url';

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous'
  },
  {
    rel: 'stylesheet',
    href: styles
  }
];

export const meta: MetaFunction = () => [
  { title: 'Fetch-FE' },
  { property: 'og:title', content: 'Fetch-FE-App' }
];

export const loader = async () => {
  const nodeEnv = process.env.NODE_ENV;
  const remixDevPort = Number(process.env.REMIX_DEV_SERVER_WS_PORT || 8002);
  return { nodeEnv, remixDevPort };
};

export function Layout({ children }: { children: React.ReactNode }) {
  // const { nodeEnv, remixDevPort } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <Scripts />
        <ScrollRestoration />
        {/* {nodeEnv === 'development' ? <LiveReload port={remixDevPort} /> : null} */}
      </body>
    </html>
  );
}

const App = () => <Outlet />;
export default App;

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </>
    );
  }

  return (
    <>
      <h1>Error!</h1>
      <p>{(error as { message: string })?.message! ?? 'Unknown error'}</p>
    </>
  );
}
