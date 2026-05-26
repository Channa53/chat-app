import { type FC } from 'react';

export const AdminPage: FC = () => {
  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 items-center border-b border-border px-4">
        <h1 className="text-sm font-semibold">Admin</h1>
      </header>
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        <p className="text-sm">Admin dashboard coming in Phase 6.</p>
      </div>
    </div>
  );
};
