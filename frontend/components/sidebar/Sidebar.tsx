'use client';

import {
  LayoutDashboard,
  Upload,
  Users,
  BarChart3,
  UsersRound,
  Settings,
  Sparkles,
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { NavItem } from './NavItem';
import { useLeadsStore } from '@/hooks/useLeadsStore';
import { Separator } from '@/components/ui/separator';

const PRIMARY_NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/import', label: 'Import Leads', icon: Upload },
  { href: '/dashboard/leads', label: 'Leads', icon: Users },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
];

const SECONDARY_NAV = [
  { href: '/dashboard/team', label: 'Team', icon: UsersRound },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { result } = useLeadsStore();

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center px-4">
        <Logo className="[&_span]:text-sidebar-foreground" />
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
        <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
          Workspace
        </p>
        {PRIMARY_NAV.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            onNavigate={onNavigate}
            badge={item.href === '/dashboard/leads' ? result?.totalImported : undefined}
          />
        ))}

        <p className="px-3 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
          Organization
        </p>
        {SECONDARY_NAV.map((item) => (
          <NavItem key={item.href} {...item} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="p-3">
        <Separator className="mb-3 bg-sidebar-border" />
        <div className="flex items-center gap-2.5 rounded-lg bg-sidebar-accent/60 px-3 py-2.5">
          <Sparkles size={15} className="shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-sidebar-foreground">Gemini AI active</p>
            <p className="truncate text-[11px] text-sidebar-foreground/50">Lead extraction engine</p>
          </div>
        </div>
      </div>
    </div>
  );
}
