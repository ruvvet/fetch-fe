import { zodResolver } from '@hookform/resolvers/zod';
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
  Session,
  type MetaFunction
} from '@remix-run/node';
import { useSubmit } from '@remix-run/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Spinner } from '~/components/ui/spinner';
import { commitSession, getSession } from '~/session';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.'
  }),
  email: z
    .string()
    .min(1, { message: 'This field has to be filled.' })
    .email('This is not a valid email.')
  //   .refine((e) => e === "abcd@fg.com", "This email is not in our database")
});

export const meta: MetaFunction = () => {
  return [{ title: 'Fetch Login' }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  const cookie = (session as Session).get('token');
  if (session && cookie) {
    throw redirect('/dogs');
  }
  return null;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get('Cookie'));

  if (request.method === 'POST') {
    const formData = await request.formData();
    const name = String(formData.get('name'));
    const email = String(formData.get('email'));

    if (!name || !email) {
      throw new Response(null, { status: 401 });
    }
    const res = await fetch(
      'https://frontend-take-home-service.fetch.com/auth/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email })
      }
    );

    const token = res.headers.get('Set-Cookie');

    if (res.status !== 200 || !token) {
      //TODO: some popup error here
      return;
    }

    session.set('token', token);
    await commitSession(session);
    return redirect('/dogs', {
      headers: {
        'Set-Cookie': await commitSession(session)
      }
    });
  }

  throw new Response(null, { status: 401 }); //TODO: some more err handling
};

const Auth = () => {
  const submit = useSubmit();
  const [loggingIn, setLoggingIn] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: ''
    }
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    submit(data, {
      method: 'POST'
    });
    setLoggingIn(true);
  };

  if (loggingIn) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        method="POST"
        className="space-y-8 max-w-3xl mx-auto py-10"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Name" type="text" {...field} />
              </FormControl>
              <FormDescription>Name</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email" type="email" {...field} />
              </FormControl>
              <FormDescription>Email</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export default Auth;
