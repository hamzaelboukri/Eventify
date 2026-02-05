'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Users, Award, ArrowRight, CheckCircle } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { Button } from '@/components/ui';
import { EventsGrid } from '@/components/events';
import { useEventsStore } from '@/store/eventsStore';

const features = [
  {
    icon: Calendar,
    title: 'Gestion simplifiée',
    description: 'Créez et gérez vos événements en quelques clics. Interface intuitive et moderne.',
  },
  {
    icon: Users,
    title: 'Réservations en ligne',
    description: 'Permettez à vos participants de réserver facilement leur place en ligne.',
  },
  {
    icon: Award,
    title: 'Suivi en temps réel',
    description: 'Suivez les inscriptions et le taux de remplissage en temps réel.',
  },
];

const benefits = [
  'Gestion centralisée des événements',
  'Réservations automatisées',
  'Confirmation par email',
  'Tickets téléchargeables',
  'Tableau de bord administrateur',
  'Statistiques détaillées',
];

export default function HomePage() {
  const { fetchPublishedEvents, events, isLoading } = useEventsStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchPublishedEvents({ limit: 6 });
  }, [fetchPublishedEvents]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700 text-white py-20 lg:py-32">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                Gérez vos événements en toute simplicité
              </h1>
              <p className="text-lg sm:text-xl text-primary-100 mb-8">
                Eventify vous permet de créer, gérer et suivre vos événements et réservations 
                depuis une plateforme unique et intuitive.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/events">
                  <Button size="lg" className="bg-white text-primary-700 hover:bg-gray-100 w-full sm:w-auto">
                    Découvrir les événements
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                    Créer un compte
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Pourquoi choisir Eventify ?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Une solution complète pour la gestion de vos événements professionnels.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Upcoming Events Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Événements à venir
                </h2>
                <p className="text-gray-600">
                  Découvrez nos prochains événements et réservez votre place.
                </p>
              </div>
              <Link href="/events">
                <Button variant="outline">
                  Voir tout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {mounted && <EventsGrid events={(events || []).slice(0, 6)} isLoading={isLoading} />}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">
                  Tout ce dont vous avez besoin pour vos événements
                </h2>
                <p className="text-gray-400 mb-8">
                  Que vous organisiez des formations, des ateliers, des conférences ou des meetups, 
                  Eventify s&apos;adapte à vos besoins.
                </p>
                <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl p-8 lg:p-12">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4">Prêt à commencer ?</h3>
                  <p className="text-primary-100 mb-6">
                    Créez votre compte gratuitement et commencez à gérer vos événements dès aujourd&apos;hui.
                  </p>
                  <Link href="/register">
                    <Button size="lg" className="bg-white text-primary-700 hover:bg-gray-100">
                      S&apos;inscrire gratuitement
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
