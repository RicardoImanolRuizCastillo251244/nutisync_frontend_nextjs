'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-72 bg-white/95 backdrop-blur border-r border-primary-light/70 flex flex-col shadow-sm">
      <div className="p-5 border-b border-primary-light/70 flex flex-col items-center gap-1">
        <Image src="/images/logo.png" alt="NutriSync" width={90} height={27} priority />
        <span className="text-xs font-semibold text-gray-600 tracking-wide">NutriSync</span>
      </div>
      <nav className="flex-1 p-4 space-y-1.5">
        <Link
          href="/dashboard"
          className={`block px-4 py-2 rounded-lg transition ${
            isActive('/dashboard')
              ? 'bg-primary text-white font-semibold shadow-sm'
              : 'text-gray-700 hover:bg-primary-light/50'
          }`}
        >
          Dashboard
        </Link>
        <Link
          href="/pacientes"
          className={`block px-4 py-2 rounded-lg transition ${
            isActive('/pacientes')
              ? 'bg-primary text-white font-semibold shadow-sm'
              : 'text-gray-700 hover:bg-primary-light/50'
          }`}
        >
          Pacientes
        </Link>
        <Link
          href="/constructor-dietas"
          className={`block px-4 py-2 rounded-lg transition ${
            isActive('/constructor-dietas')
              ? 'bg-primary text-white font-semibold shadow-sm'
              : 'text-gray-700 hover:bg-primary-light/50'
          }`}
        >
          Constructor de Dietas
        </Link>
        <Link
          href="/adherencia"
          className={`block px-4 py-2 rounded-lg transition ${
            isActive('/adherencia')
              ? 'bg-primary text-white font-semibold shadow-sm'
              : 'text-gray-700 hover:bg-primary-light/50'
          }`}
        >
          Adherencia
        </Link>
        <Link
          href="/medicacion"
          className={`block px-4 py-2 rounded-lg transition ${
            isActive('/medicacion')
              ? 'bg-primary text-white font-semibold shadow-sm'
              : 'text-gray-700 hover:bg-primary-light/50'
          }`}
        >
          Medicación
        </Link>
      </nav>
      <div className="p-4 border-t border-primary-light/70 text-sm">
        <button
          onClick={logout}
          className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-2 font-semibold text-red-700 shadow-sm transition hover:bg-red-100"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;