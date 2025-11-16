/**
 * NavBar Component
 * 
 * Evolution 3.0 inspired glassmorphic navigation
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, LayoutDashboard, Settings } from 'lucide-react';
import { StudiosLogo } from '@evolution/ui';

export function NavBar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/jobs/new', label: 'New Job', icon: Plus },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed inset-x-0 top-0 z-50 w-full bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <StudiosLogo size="md" showTagline={true} />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-muted hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-2.5 right-2.5 h-[2px] bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Section */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">Dev User</p>
              <p className="text-xs text-muted">Development Mode</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              <span className="text-sm font-bold text-primary">DU</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
