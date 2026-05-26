import { type FC } from 'react';
import { Outlet } from 'react-router-dom';

import { Sidebar } from './sidebar';

export const AppLayout: FC = () => {
  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};
