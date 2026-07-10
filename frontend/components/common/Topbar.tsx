'use client';

import { useEffect, useState } from 'react';
import { Menu, Search, LogOut, Settings as SettingsIcon, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Kbd } from '@/components/common/Kbd';
import { checkBackendHealth } from '@/lib/api';
import { cn } from '@/lib/utils';

export function Topbar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const [backendUp, setBackendUp] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    checkBackendHealth().then((ok) => {
      if (!cancelled) setBackendUp(ok);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenMobileNav} aria-label="Open menu">
        <Menu size={18} />
      </Button>

      <button
        onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
        className="flex h-8 w-full max-w-xs items-center gap-2 rounded-md border border-input bg-secondary/50 px-2.5 text-xs text-muted-foreground transition-colors hover:bg-secondary sm:max-w-sm"
      >
        <Search size={13} />
        <span className="flex-1 text-left">Search or jump to…</span>
        <Kbd>⌘K</Kbd>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <span
          className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground sm:flex"
          title={backendUp === false ? 'Backend unreachable' : 'Backend connection status'}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              backendUp === null ? 'bg-muted-foreground' : backendUp ? 'bg-success' : 'bg-destructive'
            )}
          />
          {backendUp === null ? 'Checking API…' : backendUp ? 'API connected' : 'API offline'}
        </span>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 rounded-full ring-offset-background transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>AR</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm font-medium">Aditi Rao</p>
              <p className="text-xs font-normal text-muted-foreground">aditi@nextlead.io</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <SettingsIcon /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <LogOut /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
