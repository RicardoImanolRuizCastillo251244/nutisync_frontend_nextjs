'use client';

import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/src/presentation/contexts/AuthContext';
import { toast } from 'sonner';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      toast.success('Inicio de sesión exitoso');
      router.replace('/pacientes');
    } catch {
      toast.error('Credenciales incorrectas');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat px-4"
      style={{ backgroundImage: "url('/images/bc-login.png')" }}
    >
      <div
        className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full max-w-md border border-white/40"
        style={{ fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif' }}
      >
        <div className="flex flex-col items-center mb-6">
          <Image src="/images/logo.png" alt="NutriSync" width={130} height={39} priority />
          <p className="mt-3 text-base font-semibold text-gray-700">
            Bienvenido a Nutrisync
          </p>
        </div>
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Panel del Nutriólogo
        </h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-gray-600 font-medium mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              {...register('email', { required: 'El correo es obligatorio' })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#24B38A] focus:border-[#24B38A] outline-none transition"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
          <div className="mb-6">
            <label className="block text-gray-600 font-medium mb-1">
              Contraseña
            </label>
            <input
              type="password"
              {...register('password', { required: 'La contraseña es obligatoria' })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#24B38A] focus:border-[#24B38A] outline-none transition"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#24B38A] hover:bg-[#1f9b77] text-white font-semibold py-2 rounded-xl shadow-md transition disabled:opacity-50"
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}