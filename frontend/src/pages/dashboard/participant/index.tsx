"use client";

import React, { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { APP_NAME } from "@/lib/constants";
import { ReservationStatus } from "@/types";

// Mock data for participant dashboard
const mockReservations = [
  { 
    id: "1", 
    eventTitle: "Formation React Avancé", 
    eventDate: "2026-02-15",
    eventLocation: "Paris, France",
    status: ReservationStatus.CONFIRMED, 
    createdAt: "2026-02-01" 
  },
  { 
    id: "2", 
    eventTitle: "Atelier DevOps & CI/CD", 
    eventDate: "2026-02-18",
    eventLocation: "Lyon, France",
    status: ReservationStatus.PENDING, 
    createdAt: "2026-02-03" 
  },
  { 
    id: "3", 
    eventTitle: "Conférence IA & ML", 
    eventDate: "2026-02-20",
    eventLocation: "Marseille, France",
    status: ReservationStatus.CONFIRMED, 
    createdAt: "2026-02-04" 
  },
];

const mockUpcomingEvents = [
  { id: "1", title: "Workshop UX Design", date: "2026-02-22", location: "Nice, France", price: 49 },
  { id: "2", title: "Networking Tech", date: "2026-02-25", location: "Bordeaux, France", price: 0 },
  { id: "3", title: "Hackathon 48h", date: "2026-03-01", location: "Paris, France", price: 29 },
];

export default function ParticipantDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, isAdmin } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    } else if (!isLoading && isAuthenticated && isAdmin()) {
      router.push("/dashboard/admin");
    }
  }, [isLoading, isAuthenticated, router, isAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-slate-400 mt-4">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || isAdmin()) {
    return null;
  }

  const getStatusBadge = (status: ReservationStatus) => {
    const config: Record<ReservationStatus, { label: string; color: string }> = {
      [ReservationStatus.PENDING]: { label: "En attente", color: "bg-yellow-500" },
      [ReservationStatus.CONFIRMED]: { label: "Confirmé", color: "bg-green-500" },
      [ReservationStatus.CANCELED]: { label: "Annulé", color: "bg-red-500" },
      [ReservationStatus.REFUSED]: { label: "Refusé", color: "bg-red-500" },
    };
    const statusConfig = config[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color} text-white`}>
        {statusConfig.label}
      </span>
    );
  };

  return (
    <>
      <Head>
        <title>Mon Espace | {APP_NAME}</title>
      </Head>

      <div className="min-h-screen bg-slate-900">
        {/* Header */}
        <header className="bg-slate-800/50 border-b border-slate-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="text-2xl font-bold text-white">
                {APP_NAME}
              </Link>
              <div className="flex items-center gap-4">
                <Link href="/events" className="text-slate-300 hover:text-white transition-colors">
                  Événements
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white hidden sm:inline">{user?.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  🚪
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">
              Bonjour, {user?.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-slate-400 mt-1">
              Gérez vos réservations et découvrez de nouveaux événements
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">🎟️</span>
              </div>
              <p className="text-3xl font-bold text-white">{mockReservations.length}</p>
              <p className="text-slate-400 text-sm">Mes réservations</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <p className="text-3xl font-bold text-white">
                {mockReservations.filter(r => r.status === ReservationStatus.CONFIRMED).length}
              </p>
              <p className="text-slate-400 text-sm">Confirmées</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">⏳</span>
              </div>
              <p className="text-3xl font-bold text-white">
                {mockReservations.filter(r => r.status === ReservationStatus.PENDING).length}
              </p>
              <p className="text-slate-400 text-sm">En attente</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* My Reservations */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                Mes réservations
              </h2>

              <div className="space-y-4">
                {mockReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="p-4 bg-slate-700/30 rounded-xl"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-white font-medium">{reservation.eventTitle}</p>
                        <p className="text-slate-400 text-sm">
                          📍 {reservation.eventLocation}
                        </p>
                        <p className="text-slate-400 text-sm">
                          📅 {new Date(reservation.eventDate).toLocaleDateString("fr-FR", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })}
                        </p>
                      </div>
                      {getStatusBadge(reservation.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Events */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Événements suggérés
                </h2>
                <Link
                  href="/events"
                  className="text-blue-400 text-sm hover:text-blue-300"
                >
                  Voir tout →
                </Link>
              </div>

              <div className="space-y-4">
                {mockUpcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{event.title}</p>
                        <p className="text-slate-400 text-sm">📍 {event.location}</p>
                        <p className="text-slate-400 text-sm">
                          📅 {new Date(event.date).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">
                          {event.price === 0 ? "Gratuit" : `${event.price}€`}
                        </p>
                        <button className="mt-2 px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors">
                          Réserver
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
