'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calendar, 
  ClipboardList, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const adminLinks = [
  { href: '/dashboard/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/admin/events', label: 'Événements', icon: Calendar },
  { href: '/dashboard/admin/reservations', label: 'Réservations', icon: ClipboardList },
];

const participantLinks = [
  { href: '/dashboard/participant', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/participant/reservations', label: 'Mes Réservations', icon: ClipboardList },
];

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  
  const links = user?.role === 'admin' ? adminLinks : participantLinks;

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 h-[calc(100vh-4rem)] bg-gray-900 text-white transition-all duration-300 z-30',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-6 bg-primary-600 rounded-full p-1 shadow-lg hover:bg-primary-700 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        {/* Navigation */}
        <nav className="flex-1 py-6">
          <ul className="space-y-2 px-3">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors',
                      isActive
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    )}
                    title={isCollapsed ? link.label : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium">{link.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Settings Link */}
        <div className="border-t border-gray-800 px-3 py-4">
          <Link
            href="/dashboard/settings"
            className={cn(
              'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors text-gray-300 hover:bg-gray-800 hover:text-white'
            )}
            title={isCollapsed ? 'Paramètres' : undefined}
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-medium">Paramètres</span>}
          </Link>
        </div>
      </div>
    </aside>
  );
}
