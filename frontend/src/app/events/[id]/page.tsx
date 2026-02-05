import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EventDetailClient from './EventDetailClient';
import { Header, Footer } from '@/components/layout';
import { Event } from '@/types';

interface EventPageProps {
  params: { id: string };
}

async function getEvent(id: string): Promise<Event | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const response = await fetch(`${apiUrl}/events/${id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const event = await getEvent(params.id);
  
  if (!event) {
    return {
      title: 'Événement non trouvé - Eventify',
    };
  }

  return {
    title: `${event.title} - Eventify`,
    description: event.description.substring(0, 160),
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const event = await getEvent(params.id);

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 py-8">
        <EventDetailClient event={event} />
      </main>
      <Footer />
    </div>
  );
}
