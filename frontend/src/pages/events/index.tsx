import Link from "next/link";
import { Layout, Button, Card } from "@/components";
import type { Event } from "@/types";

// Mock Events Data
const events: Event[] = [
  {
    id: "1",
    title: "Formation React Avancé",
    description: "Formation approfondie sur React avec hooks, context et patterns avancés.",
    date: "15 Février 2026",
    location: "Salle A - Bâtiment Principal",
    category: "Formation",
    price: "Gratuit",
  },
  {
    id: "2",
    title: "Atelier DevOps & CI/CD",
    description: "Introduction pratique au DevOps avec Docker et GitHub Actions.",
    date: "18 Février 2026",
    location: "Salle B - Espace Innovation",
    category: "Atelier",
    price: "Gratuit",
  },
  {
    id: "3",
    title: "Conférence IA & Machine Learning",
    description: "L'intelligence artificielle dans l'entreprise moderne.",
    date: "20 Février 2026",
    location: "Amphithéâtre Central",
    category: "Conférence",
    price: "Gratuit",
  },
  {
    id: "4",
    title: "Webinaire Cybersécurité",
    description: "Les bases de la cybersécurité pour les développeurs.",
    date: "22 Février 2026",
    location: "En ligne",
    category: "Webinaire",
    price: "Gratuit",
  },
];

export default function EventsPage() {
  return (
    <Layout title="Événements" description="Découvrez tous nos événements">
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Nos Événements
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Découvrez tous les événements disponibles et réservez votre place
            </p>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} hoverable className="flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-blue-500/20 text-blue-400 text-xs font-medium px-3 py-1 rounded-full">
                      {event.category}
                    </span>
                    <span className="text-green-400 font-semibold text-sm">
                      {event.price}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {event.title}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="space-y-2 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <Link href={`/events/${event.id}`}>
                    <Button variant="primary" className="w-full">
                      Voir les détails
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
