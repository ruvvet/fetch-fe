import { Outlet } from '@remix-run/react';

const Dogs = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      test
      <Outlet />
      {children}
    </div>
  );
};
export default Dogs;
