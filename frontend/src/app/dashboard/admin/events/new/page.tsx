'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui';
import { EventForm } from '@/components/events';
import { useEventsStore } from '@/store/eventsStore';
import { CreateEventDto } from '@/types';
import { getErrorMessage } from '@/lib/utils';

export default function NewEventPage() {
  const router = useRouter();
  const { createEvent, isLoading } = useEventsStore();
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (data: CreateEventDto) => {
    try {
      await createEvent(data);
      toast.success('Événement créé avec succès !');
      router.push('/dashboard/admin/events');
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message || 'Erreur lors de la création');
    }
  };

  if (!mounted) return null;

  return (
    <DashboardLayout requiredRole="admin">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/admin/events"
            className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux événements
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Créer un événement</h1>
          <p className="text-gray-600">Remplissez les informations pour créer un nouvel événement</p>
        </div>

        {/* Form */}
        <Card>
          <CardContent className="p-6">
            <EventForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              onCancel={() => router.push('/dashboard/admin/events')}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
