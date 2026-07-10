'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import {
  LayoutDashboard,
  Upload,
  Users,
  BarChart3,
  UsersRound,
  Settings,
  Moon,
  Sun,
  Download,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { useTheme } from '@/hooks/useTheme';
import { useLeadsStore } from '@/hooks/useLeadsStore';
import { exportLeadsToCsv } from '@/lib/csv';
import { toast } from 'sonner';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Import Leads', href: '/dashboard/import', icon: Upload },
  { label: 'Leads', href: '/dashboard/leads', icon: Users },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Team', href: '/dashboard/team', icon: UsersRound },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { result } = useLeadsStore();

  useKeyboardShortcut('k', () => setOpen((o) => !o), { meta: true });

  const runCommand = useCallback((action: () => void) => {
    setOpen(false);
    action();
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages and actions…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {NAV_ITEMS.map((item) => (
            <CommandItem
              key={item.href}
              value={item.label}
              onSelect={() => runCommand(() => router.push(item.href))}
            >
              <item.icon className="text-muted-foreground" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem
            value="Toggle theme"
            onSelect={() => runCommand(toggleTheme)}
          >
            {theme === 'dark' ? <Sun className="text-muted-foreground" /> : <Moon className="text-muted-foreground" />}
            Toggle theme
            <CommandShortcut>⌘J</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="Export leads as CSV"
            disabled={!result || result.records.length === 0}
            onSelect={() =>
              runCommand(() => {
                if (!result) return;
                exportLeadsToCsv(result.records);
                toast.success('Leads exported', { description: 'Your CSV download has started.' });
              })
            }
          >
            <Download className="text-muted-foreground" />
            Export leads as CSV
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
