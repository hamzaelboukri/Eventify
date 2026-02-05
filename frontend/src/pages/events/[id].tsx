import { useRouter } from "next/router";
import Link from "next/link";
import { Layout, Button, Card } from "@/components";
import type { Event } from "@/types";

// Mock Events Data
const eventsData: Record<string, Event> = {
  "1": {
    id: "1",
    title: "Formation React Avancé",
    description: "Formation approfondie sur React avec hooks, context, patterns avancés et les meilleures pratiques de développement moderne. Au programme: React Hooks avancés, Context API, Patterns de composition, Performance et optimisation.",
    date: "15 Février 2026",
    location: "Salle A - Bâtiment Principal",
    category: "Formation",
    price: "Gratuit",
    capacity: 30,
    attendees: 18,
  },
  "2": {
    id: "2",
    title: "Atelier DevOps & CI/CD",
    description: "Introduction pratique au DevOps avec Docker, Kubernetes et GitHub Actions. Apprenez à automatiser vos déploiements et à mettre en place des pipelines CI/CD efficaces.",
    date: "18 Février 2026",
    location: "Salle B - Espace Innovation",
    category: "Atelier",
    price: "Gratuit",
    capacity: 20,
    attendees: 15,
  },
  "3": {
    id: "3",
    title: "Conférence IA & Machine Learning",
    description: "Découvrez comment l'intelligence artificielle transforme l'entreprise moderne. Cas pratiques et démonstrations en direct avec des experts du domaine.",
    date: "20 Février 2026",
    location: "Amphithéâtre Central",
    category: "Conférence",
    price: "Gratuit",
    capacity: 100,
    attendees: 55,
  },
  "4": {
    id: "4",
    title: "Webinaire Cybersécurité",
    description: "Les bases de la cybersécurité pour les développeurs. Protégez vos applications contre les menaces courantes et apprenez les bonnes pratiques de sécurité.",
    date: "22 Février 2026",
    location: "En ligne",
    category: "Webinaire",
    price: "Gratuit",
    capacity: 100,
    attendees: 22,
  },
};

export default function EventDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const event = eventsData[id as string];

  if (!event) {
    return (
      <Layout title="Événement non trouvé">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">
              Événement non trouvé
            </h1>
            <Link href="/events">
              <Button variant="primary">Retour aux événements</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const spotsLeft = event.capacity && event.attendees 
    ? event.capacity - event.attendees 
    : null;

  return (
    <Layout title={event.title} description={event.description}>
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-slate-400">
              <li>
                <Link href="/" className="hover:text-white">Accueil</Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/events" className="hover:text-white">Événements</Link>
              </li>
              <li>/</li>
              <li className="text-white truncate">{event.title}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Category Badge */}
              <span className="inline-block bg-blue-500/20 text-blue-400 text-sm font-medium px-4 py-2 rounded-full mb-4">
                {event.category}
              </span>

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
                {event.title}
              </h1>

              {/* Event Info */}
              <div className="flex flex-wrap gap-6 mb-8 text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📅</span>
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📍</span>
                  <span>{event.location}</span>
                </div>
              </div>

              {/* Description */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  À propos de cet événement
                </h2>
                <p className="text-slate-300 leading-relaxed">
                  {event.description}
                </p>
              </Card>
            </div>

            {/* Sidebar - Booking Card */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <div className="text-center mb-6">
                  <p className="text-slate-400 text-sm mb-1">Prix</p>
                  <p className="text-3xl font-bold text-green-400">{event.price}</p>
                </div>

                {spotsLeft !== null && (
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Places disponibles</span>
                      <span className="text-blue-400 font-medium">
                        {spotsLeft} restantes
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${((event.attendees || 0) / (event.capacity || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                <Link href="/login">
                  <Button variant="primary" size="lg" className="w-full mb-3">
                    Réserver ma place
                  </Button>
                </Link>

                <p className="text-slate-500 text-xs text-center mt-4">
                  Annulation gratuite jusqu&apos;à 24h avant
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
