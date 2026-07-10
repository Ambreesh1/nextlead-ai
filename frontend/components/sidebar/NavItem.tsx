'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  onNavigate?: () => void;
  badge?: number;
}

export function NavItem({ href, label, icon: Icon, onNavigate, badge }: NavItemProps) {
  const pathname = usePathname();
  const isActive = href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        'group relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'text-sidebar-foreground'
          : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground'
      )}
    >
      {isActive && (
        <motion.span
          layoutId="sidebar-active-pill"
          className="absolute inset-0 rounded-md bg-sidebar-accent"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
        />
      )}
      <Icon size={16} className="relative z-10 shrink-0" strokeWidth={1.8} />
      <span className="relative z-10 flex-1 truncate">{label}</span>
      {typeof badge === 'number' && badge > 0 && (
        <span className="relative z-10 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}
