import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
  Session,
  type MetaFunction
} from '@remix-run/node';
import { useFetcher, useLoaderData, useSubmit } from '@remix-run/react';
import { LogOut } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AgeInput from '~/components/ageInput';
import BreedSearch from '~/components/breedSearch';
import DataTable from '~/components/dataTable';
import FavoriteDogs from '~/components/favoriteDogs';
import { Button } from '~/components/ui/button';
import { Spinner } from '~/components/ui/spinner';
import ZipCodeInput from '~/components/zipCodeInput';
import { commitSession, destroySession } from '~/session';
import { middlewareSessionAuth } from '~/utils/api';
import { Dog, SearchData } from './dogs.search';

export interface SearchParams {
  breeds?: string[];
  zipcodes?: string[];
  ageMin?: number;
  ageMax?: number;
  size?: number;
  from?: number;
  sortField?: string;
  sort?: 'asc' | 'desc';
}

export const meta: MetaFunction = () => {
  return [{ title: 'Fetch Dogs' }];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await middlewareSessionAuth(request);
  const cookie = (session as Session).get('token');

  const res = await fetch(
    'https://frontend-take-home-service.fetch.com/dogs/breeds',
    {
      method: 'GET',
      headers: {
        Cookie: cookie
      }
    }
  );

  if (res.status !== 200) {
    throw redirect('/auth');
  }

  const allBreeds: string[] = await res.json();
  return allBreeds;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await middlewareSessionAuth(request);
  if (request.method === 'POST') {
    const formData = await request.formData();
    const favorites = formData.get('favorites');
    session.flash('data', JSON.stringify(favorites));

    return redirect('/match', {
      headers: {
        'Set-Cookie': await commitSession(session)
      }
    });
  }

  if (request.method === 'DELETE') {
    await destroySession(session);
    return redirect('/auth', {
      headers: {
        'Set-Cookie': await destroySession(session)
      }
    });
  }

  return null;
};

const Dogs = () => {
  const allBreeds = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const submit = useSubmit();

  const [searchParams, setSearchParams] = useState<SearchParams>({});
  const [data, setData] = useState<Dog[]>([]);
  const [total, setTotal] = useState(0);
  const [favorites, setFavorites] = useState<Dog[]>([]);
  const [loggingOut, setLoggingOut] = useState(false);

  const dogsMap = useMemo(
    () =>
      data.reduce<Record<string, Dog>>((map, d) => {
        map[d.id] = d;
        return map;
      }, {}),
    [data]
  );

  const updateSearchParams = useCallback(
    (key: keyof SearchParams, value: string | string[]) =>
      setSearchParams((prev) => ({ ...prev, [key]: value })),
    []
  );

  useEffect(() => {
    if (fetcher.data) {
      const { data, total, from } = fetcher.data as SearchData;
      setData(data);
      setTotal(total);
      updateSearchParams('from', `${from}`);
    }
  }, [fetcher.state, fetcher.data]);

  const dogsSearch = async () => {
    const params = new URLSearchParams();

    if (searchParams.breeds?.length) {
      searchParams.breeds.forEach((b) => {
        params.append('breeds', b);
      });
    }

    if (searchParams.zipcodes?.length) {
      searchParams.zipcodes.forEach((z) => {
        params.append('zipcodes', z);
      });
    }

    if (searchParams.ageMin) {
      params.append('ageMin', `${searchParams.ageMin}`);
    }

    if (searchParams.ageMax) {
      params.append('ageMax', `${searchParams.ageMax}`);
    }

    if (searchParams.size) {
      params.append('size', `${searchParams.size}`);
    }

    if (searchParams.from) {
      params.append('from', `${searchParams.from}`);
    }

    fetcher.submit(params, {
      method: 'GET',
      action: `/dogs/search`
    });
  };

  const handleMatch = () => {
    const formData = new FormData();
    formData.append('favorites', JSON.stringify(favorites.map((f) => f.id)));

    submit(formData, {
      method: 'POST'
    });
  };
  const updateFavorites = (id: string, add: boolean) => {
    if (add) {
      setFavorites((prev) => [...prev, dogsMap[id]]);
    } else {
      setFavorites((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const paginateFetch = async (from: number) => {
    updateSearchParams('from', `${from}`);
    dogsSearch();
  };

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
    <div className="w-screen min-w-full flex flex-col items-center max-w-[50%]">
      <div className="pt-8">
        <Button onClick={handleLogout}>
          <LogOut />
        </Button>
      </div>
      <div className="flex flex-col min-w-[50%]">
        <div className="flex flex-col sm:flex-row justify-between">
          <BreedSearch
            breeds={allBreeds}
            selectedBreeds={searchParams.breeds || []}
            updateSearchParams={updateSearchParams}
          />
          <ZipCodeInput
            selectedZipCodes={searchParams.zipcodes || []}
            updateSearchParams={updateSearchParams}
          />
          <AgeInput
            ageMin={searchParams.ageMin}
            ageMax={searchParams.ageMax}
            updateSearchParams={updateSearchParams}
          />

          <div className="flex items-center"></div>
        </div>
        <Button onClick={dogsSearch}>Search</Button>
      </div>
      <div className="min-w-[70%]">
        <DataTable
          data={data}
          total={total}
          isLoading={fetcher.state === 'loading'}
          from={parseInt(`${searchParams.from || 0}`)}
          size={parseInt(`${searchParams.size || 25}`)}
          paginateFetch={paginateFetch}
          favorites={favorites}
          updateFavorites={updateFavorites}
          updateSearchParams={updateSearchParams}
        />
      </div>
      {!!favorites.length && <Button onClick={handleMatch}>MATCH</Button>}
      <FavoriteDogs favorites={favorites} updateFavorites={updateFavorites} />
    </div>
  );
};

export default Dogs;
