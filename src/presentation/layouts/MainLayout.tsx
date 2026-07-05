'use client';

import { ReactNode } from 'react';
import Sidebar from '../components/Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex h-screen bg-transparent">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/95 backdrop-blur border-b border-primary-light px-6 py-4 flex justify-between items-center shadow-sm">
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-gray-800">Panel del Nutriólogo</h1>
            <p className="text-xs md:text-sm text-gray-500">Seguimiento clínico nutricional</p>
          </div>
          <div className="text-gray-500 text-sm">Bienvenido, Nutriólogo</div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;