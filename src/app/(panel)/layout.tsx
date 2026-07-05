'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/presentation/contexts/AuthContext';
import MainLayout from '@/src/presentation/layouts/MainLayout';

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Verificando sesión...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7f6] px-4">
        <div className="panel-card px-6 py-4 text-center text-sm text-gray-500 shadow-sm">
          Redirigiendo a login...
        </div>
      </div>
    );
  }

  return <MainLayout>{children}</MainLayout>;
}