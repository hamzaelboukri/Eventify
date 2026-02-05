'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { APP_NAME } from '@/lib/constants';
import { getErrorMessage } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est obligatoire'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user, isLoading } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated && user) {
      const redirectPath = user.role === 'admin' ? '/dashboard/admin' : '/dashboard/participant';
      router.push(redirectPath);
    }
  }, [isAuthenticated, user, router, mounted]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast.success('Connexion réussie !');
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message || 'Identifiants invalides');
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center space-x-2 mb-8">
            <Calendar className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">{APP_NAME}</span>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Connexion</h1>
          <p className="text-gray-600 mb-8">
            Connectez-vous pour accéder à votre espace.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Email"
                  {...register('email')}
                  error={errors.email?.message}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Mot de passe"
                  {...register('password')}
                  error={errors.password?.message}
                  className="pl-10"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Se connecter
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>

          <p className="mt-8 text-center text-gray-600">
            Pas encore de compte ?{' '}
            <Link href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image/Gradient */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 to-secondary-600 items-center justify-center p-12">
        <div className="text-white text-center max-w-lg">
          <h2 className="text-4xl font-bold mb-6">
            Bienvenue sur {APP_NAME}
          </h2>
          <p className="text-lg text-primary-100">
            Gérez vos événements et réservations en toute simplicité. 
            Une plateforme intuitive pour organiser vos formations, ateliers et conférences.
          </p>
        </div>
      </div>
    </div>
  );
}
