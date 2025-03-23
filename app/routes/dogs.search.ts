import { LoaderFunctionArgs, Session } from '@remix-run/node';
import { middlewareSessionAuth, throwAuthRedirect } from '~/utils/api';

export interface Dog {
  id: string;
  img: string;
  name: string;
  age: number;
  zip_code: string;
  breed: string;
}

export interface Location {
  zip_code: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  county: string;
}

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface SearchData {
  data: Dog[];
  next: string;
  from: number;
  total: number;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await middlewareSessionAuth(request);
  const cookie = (session as Session).get('token');
  const url = new URL(request.url);

  const searchRes = await fetch(
    `https://frontend-take-home-service.fetch.com/dogs/search${url.search}`,
    {
      method: 'GET',
      headers: {
        Cookie: cookie
      }
    }
  );

  if (searchRes.status !== 200) {
    await throwAuthRedirect(session);
  }

  const searchData = await searchRes.json();
  const resultIds = searchData.resultIds;
  const nextURLParams = searchData.next.split('?')[1];
  const total = searchData.total;
  const from = new URLSearchParams(searchData.next).get('from');

  const dataRes = await fetch(
    `https://frontend-take-home-service.fetch.com/dogs`,
    {
      method: 'POST',
      headers: {
        Cookie: cookie,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(resultIds)
    }
  );

  if (dataRes.status !== 200) {
    await throwAuthRedirect(session);
  }

  const data = await dataRes.json();
  return { data, nextURLParams, from, total };
};
