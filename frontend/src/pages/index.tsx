import { Layout, Button, Input, Card } from "@/components";
import { EventCard, CategoryCard } from "@/components/events";
import { CATEGORIES, STATS } from "@/lib/constants";
import type { Event, Category } from "@/types";

// Icons
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// Featured Events Data
const featuredEvents: Event[] = [
  {
    id: "1",
    title: "Tech Conference 2026",
    description: "Join industry leaders and innovators for the biggest tech conference of the year. Network, learn, and discover the latest trends.",
    date: "March 15, 2026",
    location: "San Francisco, CA",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop",
    price: "$299",
    category: "Technology",
  },
  {
    id: "2",
    title: "Music Festival",
    description: "Experience three days of incredible live music featuring top artists from around the world. Don't miss this unforgettable event!",
    date: "April 20, 2026",
    location: "Austin, TX",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=250&fit=crop",
    price: "$150",
    category: "Music",
  },
  {
    id: "3",
    title: "Art Exhibition",
    description: "Explore contemporary masterpieces from emerging and established artists. A visual journey through modern artistic expression.",
    date: "May 5, 2026",
    location: "New York, NY",
    image: "https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=400&h=250&fit=crop",
    price: "$45",
    category: "Art",
  },
  {
    id: "4",
    title: "Food & Wine Expo",
    description: "Savor exceptional cuisines and premium wines from renowned chefs and vineyards. A culinary adventure for food enthusiasts.",
    date: "June 10, 2026",
    location: "Napa Valley, CA",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=250&fit=crop",
    price: "$85",
    category: "Food",
  },
];

export default function Home() {
  return (
    <Layout title="Home" description="Discover and book amazing events worldwide">
      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 bg-gradient-hero">
        <div className="max-w-7xl mx-auto text-center">
          {/* Hero Title */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-slide-up">
            Discover Amazing
            <span className="block text-gradient mt-2">
              Events Near You
            </span>
          </h1>
          
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto animate-fade-in">
            Find and book tickets for concerts, conferences, workshops, and more.
            Your next unforgettable experience is just a click away.
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto bg-slate-800/50 backdrop-blur-sm rounded-2xl p-2 flex flex-col md:flex-row gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search events..."
                icon={<SearchIcon />}
                className="border-0 bg-slate-700/50"
              />
            </div>
            <div className="md:w-48">
              <Input
                placeholder="Location"
                icon={<LocationIcon />}
                className="border-0 bg-slate-700/50"
              />
            </div>
            <Button variant="primary" size="lg" className="rounded-xl">
              Search
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-white">{stat.value}</div>
                <div className="text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Browse by Category
          </h2>
          <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
            Explore events across various categories and find what excites you most
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((category) => (
              <CategoryCard key={category.slug} category={category as Category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-20 px-4 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Featured Events
              </h2>
              <p className="text-slate-400">Don&apos;t miss out on these popular events</p>
            </div>
            <Button variant="ghost" className="hidden md:flex">
              View All →
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          <div className="md:hidden mt-8 text-center">
            <Button variant="ghost">View All Events →</Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-primary p-8 md:p-12 text-center border-0">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Host Your Own Event?
            </h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Create and manage your events with our powerful platform. 
              Reach thousands of attendees and make your event a success.
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <Button 
                variant="secondary" 
                size="lg"
                className="bg-white text-blue-900 hover:bg-slate-100"
              >
                Create Event
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white/10"
              >
                Learn More
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4 bg-slate-900/30">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-slate-400 mb-8">
            Subscribe to our newsletter and never miss an event near you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Enter your email"
              type="email"
              className="flex-1"
            />
            <Button variant="primary" size="lg">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
