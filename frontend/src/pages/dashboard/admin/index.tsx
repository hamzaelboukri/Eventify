"use client";

import React, { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { APP_NAME, ADMIN_NAV_LINKS, RESERVATION_STATUS_CONFIG } from "@/lib/constants";
import { EventStatus, ReservationStatus } from "@/types";

// Mock data for dashboard
const mockStats = {
  totalEvents: 24,
  publishedEvents: 18,
  draftEvents: 4,
  canceledEvents: 2,
  totalReservations: 156,
  pendingReservations: 12,
  confirmedReservations: 128,
  totalParticipants: 89,
};

const mockRecentReservations = [
  { id: "1", userName: "Marie Dupont", eventTitle: "Formation React Avancé", status: ReservationStatus.PENDING, createdAt: "2026-02-04" },
  { id: "2", userName: "Pierre Martin", eventTitle: "Atelier DevOps", status: ReservationStatus.CONFIRMED, createdAt: "2026-02-04" },
  { id: "3", userName: "Sophie Bernard", eventTitle: "Conférence IA", status: ReservationStatus.PENDING, createdAt: "2026-02-03" },
  { id: "4", userName: "Lucas Petit", eventTitle: "Workshop UX", status: ReservationStatus.CONFIRMED, createdAt: "2026-02-03" },
  { id: "5", userName: "Emma Roux", eventTitle: "Networking Tech", status: ReservationStatus.PENDING, createdAt: "2026-02-02" },
];

const mockUpcomingEvents = [
  { id: "1", title: "Formation React Avancé", date: "2026-02-15", reservations: 18, capacity: 30, status: EventStatus.PUBLISHED },
  { id: "2", title: "Atelier DevOps & CI/CD", date: "2026-02-18", reservations: 15, capacity: 20, status: EventStatus.PUBLISHED },
  { id: "3", title: "Conférence IA & ML", date: "2026-02-20", reservations: 55, capacity: 100, status: EventStatus.PUBLISHED },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, isAdmin } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    } else if (!isLoading && isAuthenticated && !isAdmin()) {
      router.push("/dashboard/participant");
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

  if (!isAuthenticated || !isAdmin()) {
    return null;
  }

  const getStatusBadge = (status: ReservationStatus) => {
    const config = RESERVATION_STATUS_CONFIG[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} text-white`}>
        {config.label}
      </span>
    );
  };

  return (
    <>
      <Head>
        <title>Dashboard Admin | {APP_NAME}</title>
      </Head>

      <div className="min-h-screen bg-slate-900">
        {/* Sidebar */}
        <aside className="fixed top-0 left-0 h-full w-64 bg-slate-800 border-r border-slate-700 z-50">
          {/* Logo */}
          <div className="p-6 border-b border-slate-700">
            <Link href="/" className="text-2xl font-bold text-white">
              {APP_NAME}
            </Link>
            <p className="text-slate-400 text-sm mt-1">Administration</p>
          </div>

          {/* Navigation */}
          <nav className="p-4">
            <ul className="space-y-2">
              {ADMIN_NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      router.pathname === link.href
                        ? "bg-blue-500/20 text-blue-400"
                        : "text-slate-300 hover:bg-slate-700/50"
                    }`}
                  >
                    <span className="text-xl">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{user?.name}</p>
                <p className="text-slate-400 text-sm truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-colors"
            >
              <span>🚪</span>
              <span>Déconnexion</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">
              Bienvenue, {user?.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-slate-400 mt-1">
              Voici un aperçu de votre activité
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Events */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">📅</span>
                <span className="text-green-400 text-sm font-medium">+12%</span>
              </div>
              <p className="text-3xl font-bold text-white">{mockStats.totalEvents}</p>
              <p className="text-slate-400 text-sm">Événements totaux</p>
              <div className="mt-3 flex gap-2 text-xs">
                <span className="text-green-400">{mockStats.publishedEvents} publiés</span>
                <span className="text-slate-500">•</span>
                <span className="text-yellow-400">{mockStats.draftEvents} brouillons</span>
              </div>
            </div>

            {/* Total Reservations */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">🎟️</span>
                <span className="text-green-400 text-sm font-medium">+8%</span>
              </div>
              <p className="text-3xl font-bold text-white">{mockStats.totalReservations}</p>
              <p className="text-slate-400 text-sm">Réservations totales</p>
              <div className="mt-3 flex gap-2 text-xs">
                <span className="text-green-400">{mockStats.confirmedReservations} confirmées</span>
              </div>
            </div>

            {/* Pending Reservations */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">⏳</span>
                <span className="text-yellow-400 text-sm font-medium">À traiter</span>
              </div>
              <p className="text-3xl font-bold text-white">{mockStats.pendingReservations}</p>
              <p className="text-slate-400 text-sm">En attente</p>
              <Link
                href="/dashboard/admin/reservations"
                className="mt-3 inline-block text-blue-400 text-sm hover:text-blue-300"
              >
                Voir les demandes →
              </Link>
            </div>

            {/* Total Participants */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">👥</span>
                <span className="text-green-400 text-sm font-medium">+15%</span>
              </div>
              <p className="text-3xl font-bold text-white">{mockStats.totalParticipants}</p>
              <p className="text-slate-400 text-sm">Participants uniques</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Reservations */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Dernières réservations
                </h2>
                <Link
                  href="/dashboard/admin/reservations"
                  className="text-blue-400 text-sm hover:text-blue-300"
                >
                  Voir tout →
                </Link>
              </div>

              <div className="space-y-4">
                {mockRecentReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {reservation.userName}
                      </p>
                      <p className="text-slate-400 text-sm truncate">
                        {reservation.eventTitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(reservation.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Prochains événements
                </h2>
                <Link
                  href="/dashboard/admin/events"
                  className="text-blue-400 text-sm hover:text-blue-300"
                >
                  Voir tout →
                </Link>
              </div>

              <div className="space-y-4">
                {mockUpcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 bg-slate-700/30 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-medium">{event.title}</p>
                      <span className="text-slate-400 text-sm">
                        {new Date(event.date).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="w-full bg-slate-600 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${(event.reservations / event.capacity) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <span className="ml-4 text-slate-400 text-sm">
                        {event.reservations}/{event.capacity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Actions rapides
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/dashboard/admin/events/new"
                className="flex items-center gap-4 p-6 bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-2xl hover:border-blue-500/50 transition-colors"
              >
                <span className="text-4xl">➕</span>
                <div>
                  <p className="text-white font-semibold">Créer un événement</p>
                  <p className="text-slate-400 text-sm">Ajouter un nouvel événement</p>
                </div>
              </Link>

              <Link
                href="/dashboard/admin/reservations"
                className="flex items-center gap-4 p-6 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-2xl hover:border-yellow-500/50 transition-colors"
              >
                <span className="text-4xl">📋</span>
                <div>
                  <p className="text-white font-semibold">Gérer les réservations</p>
                  <p className="text-slate-400 text-sm">{mockStats.pendingReservations} en attente</p>
                </div>
              </Link>

              <Link
                href="/dashboard/admin/events"
                className="flex items-center gap-4 p-6 bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 rounded-2xl hover:border-green-500/50 transition-colors"
              >
                <span className="text-4xl">📊</span>
                <div>
                  <p className="text-white font-semibold">Voir les événements</p>
                  <p className="text-slate-400 text-sm">{mockStats.publishedEvents} publiés</p>
                </div>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
