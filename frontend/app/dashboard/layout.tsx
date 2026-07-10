'use client';

import * as React from 'react';
import { useState } from 'react';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { MobileNavDrawer } from '@/components/sidebar/MobileNavDrawer';
import { Topbar } from '@/components/common/Topbar';
import { CommandPalette } from '@/components/common/CommandPalette';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="hidden shrink-0 border-r border-sidebar-border lg:block">
        <Sidebar />
      </aside>

      <MobileNavDrawer open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
        </main>
      </div>

      <CommandPalette />
    </div>
  );
}
