import { MessageSquare, Settings, Shield } from 'lucide-react';
import { type FC } from 'react';
import { NavLink } from 'react-router-dom';

import { cn } from '@/design-system';

interface NavItem {
  to: string;
  label: string;
  icon: FC<{ className?: string }>;
}

const navItems: NavItem[] = [
  { to: '/chat', label: 'Chat', icon: MessageSquare },
  { to: '/admin', label: 'Admin', icon: Shield },
];

export const Sidebar: FC = () => {
  return (
    <aside className="flex h-full w-60 flex-col border-r border-border bg-surface">
      <div className="flex h-14 items-center border-b border-border px-4 text-sm font-semibold">
        Chat App
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-surface-hover text-foreground'
                  : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-2">
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>
    </aside>
  );
};
