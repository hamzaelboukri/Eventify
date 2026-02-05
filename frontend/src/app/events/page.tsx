import { Metadata } from 'next';
import { Suspense } from 'react';
import EventsListClient from './EventsListClient';
import { Header, Footer } from '@/components/layout';
import Spinner from '@/components/ui/Spinner';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Événements - Eventify',
  description: 'Découvrez tous nos événements disponibles et réservez votre place.',
};

// This is a server component that fetches initial data
async function getEvents(searchParams: { [key: string]: string | string[] | undefined }) {
  try {
    const params = new URLSearchParams();
    
    if (searchParams.search) {
      params.set('search', String(searchParams.search));
    }
    if (searchParams.category) {
      params.set('category', String(searchParams.category));
    }
    if (searchParams.page) {
      params.set('page', String(searchParams.page));
    }
    params.set('limit', '12');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const response = await fetch(`${apiUrl}/events?${params.toString()}`, {
      cache: 'no-store', // Always get fresh data for SSR
    });

    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    return { data: [], total: 0, page: 1, limit: 12, totalPages: 0 };
  }
}

async function getCategories() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const response = await fetch(`${apiUrl}/events/categories`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

interface EventsPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const [eventsData, categories] = await Promise.all([
    getEvents(searchParams),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Événements</h1>
            <p className="text-gray-600">
              Découvrez tous nos événements disponibles et réservez votre place.
            </p>
          </div>
          
          <Suspense fallback={<div className="flex justify-center py-12"><Spinner size="lg" /></div>}>
            <EventsListClient 
              initialEvents={eventsData.data}
              initialPagination={{
                total: eventsData.total,
                page: eventsData.page,
                limit: eventsData.limit,
                totalPages: eventsData.totalPages,
              }}
              categories={categories}
            />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
