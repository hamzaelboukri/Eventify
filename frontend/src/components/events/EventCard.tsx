import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Event } from "@/types";

// Icons
const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

interface EventCardProps {
  event: Event;
  className?: string;
}

export const EventCard: React.FC<EventCardProps> = ({ event, className }) => {
  const defaultImage = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop";
  
  return (
    <Link href={`/events/${event.id}`}>
      <Card hoverable className={cn("group", className)}>
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={event.image || defaultImage}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {/* Category Badge */}
          <div className="absolute top-4 left-4 bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-medium">
            {event.category}
          </div>
          {/* Price Badge */}
          <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full font-semibold">
            {event.price || "Gratuit"}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-white font-semibold text-lg mb-3 group-hover:text-blue-500 transition-colors line-clamp-2">
            {event.title}
          </h3>
          
          <div className="space-y-2">
            <div className="flex items-center text-slate-400 text-sm">
              <CalendarIcon />
              <span className="ml-2">{event.date}</span>
            </div>
            
            <div className="flex items-center text-slate-400 text-sm">
              <LocationIcon />
              <span className="ml-2">{event.location}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default EventCard;
