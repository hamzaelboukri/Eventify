'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuthStore } from '@/store/authStore';
import { LoadingPage } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'participant';
}

export default function DashboardLayout({ children, requiredRole }: DashboardLayoutProps) {
  const router = useRouter();
  const { user, isAuthenticated, fetchUser, isLoading } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    setMounted(true);
    const checkAuth = async () => {
      try {
        await fetchUser();
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setChecking(false);
      }
    };
    checkAuth();
  }, [fetchUser]);

  useEffect(() => {
    if (!checking && mounted) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (requiredRole && user?.role !== requiredRole) {
        const redirectPath = user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/participant';
        router.push(redirectPath);
      }
    }
  }, [isAuthenticated, user, requiredRole, router, checking, mounted]);

  if (!mounted || checking || isLoading) {
    return <LoadingPage />;
  }

  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex">
        <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
        <main
          className={cn(
            'flex-1 p-6 transition-all duration-300 mt-16',
            isCollapsed ? 'ml-16' : 'ml-64'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
