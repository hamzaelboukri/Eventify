'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Textarea, Select } from '@/components/ui';
import { EVENT_CATEGORIES } from '@/lib/constants';
import { Event, EventStatus } from '@/types';

const eventSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(100, 'Le titre ne peut pas dépasser 100 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères').max(2000, 'La description ne peut pas dépasser 2000 caractères'),
  date: z.string().min(1, 'La date est obligatoire'),
  time: z.string().min(1, "L'heure est obligatoire"),
  location: z.string().min(1, 'Le lieu est obligatoire').max(200, 'Le lieu ne peut pas dépasser 200 caractères'),
  image: z.string().optional(),
  category: z.string().optional(),
  capacity: z.coerce.number().min(1, 'La capacité doit être au moins de 1'),
  price: z.string().optional(),
  status: z.nativeEnum(EventStatus).optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  event?: Event;
  onSubmit: (data: EventFormData) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

export default function EventForm({ event, onSubmit, isLoading, onCancel }: EventFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: event
      ? {
          title: event.title,
          description: event.description,
          date: event.date.split('T')[0],
          time: event.time,
          location: event.location,
          image: event.image || '',
          category: event.category || 'Formation',
          capacity: event.capacity,
          price: event.price || '',
          status: event.status,
        }
      : {
          category: 'Formation',
          capacity: 20,
        },
  });

  const categoryOptions = EVENT_CATEGORIES.map((cat) => ({ value: cat, label: cat }));
  
  const statusOptions = [
    { value: EventStatus.DRAFT, label: 'Brouillon' },
    { value: EventStatus.PUBLISHED, label: 'Publié' },
    { value: EventStatus.CANCELED, label: 'Annulé' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Input
            label="Titre *"
            placeholder="Nom de l'événement"
            {...register('title')}
            error={errors.title?.message}
          />
        </div>

        <div className="md:col-span-2">
          <Textarea
            label="Description *"
            placeholder="Décrivez votre événement..."
            {...register('description')}
            error={errors.description?.message}
            className="min-h-[150px]"
          />
        </div>

        <Input
          type="date"
          label="Date *"
          {...register('date')}
          error={errors.date?.message}
        />

        <Input
          type="time"
          label="Heure *"
          {...register('time')}
          error={errors.time?.message}
        />

        <div className="md:col-span-2">
          <Input
            label="Lieu *"
            placeholder="Adresse ou lieu de l'événement"
            {...register('location')}
            error={errors.location?.message}
          />
        </div>

        <Select
          label="Catégorie"
          options={categoryOptions}
          {...register('category')}
          error={errors.category?.message}
        />

        <Input
          type="number"
          label="Capacité *"
          placeholder="Nombre de places"
          {...register('capacity')}
          error={errors.capacity?.message}
          min={1}
        />

        <Input
          label="URL de l'image"
          placeholder="https://..."
          {...register('image')}
          error={errors.image?.message}
        />

        <Input
          label="Prix (€)"
          placeholder="Gratuit ou montant"
          {...register('price')}
          error={errors.price?.message}
        />

        {event && (
          <Select
            label="Statut"
            options={statusOptions}
            {...register('status')}
            error={errors.status?.message}
          />
        )}
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button type="submit" isLoading={isLoading}>
          {event ? 'Mettre à jour' : 'Créer l\'événement'}
        </Button>
      </div>
    </form>
  );
}
