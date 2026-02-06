import React from 'react';
import Link from 'next/link';
import { Calendar, Mail, Phone, MapPin } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Calendar className="h-8 w-8 text-primary-400" />
              <span className="text-xl font-bold">{APP_NAME}</span>
            </Link>
            <p className="text-gray-400 mb-4">
              Plateforme de gestion d&apos;événements et de réservations. 
              Organisez vos formations, ateliers et conférences en toute simplicité.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liens Rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors hover:underline underline-offset-4 py-1 block rounded focus:outline-none focus:ring-2 focus:ring-primary-400">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-gray-400 hover:text-white transition-colors hover:underline underline-offset-4 py-1 block rounded focus:outline-none focus:ring-2 focus:ring-primary-400">
                  Événements
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-400 hover:text-white transition-colors hover:underline underline-offset-4 py-1 block rounded focus:outline-none focus:ring-2 focus:ring-primary-400">
                  Connexion
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-gray-400 hover:text-white transition-colors hover:underline underline-offset-4 py-1 block rounded focus:outline-none focus:ring-2 focus:ring-primary-400">
                  Inscription
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-gray-400">
                <Mail className="h-5 w-5" />
                <span>contact@eventify.com</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-400">
                <Phone className="h-5 w-5" />
                <span>+33 1 23 45 67 89</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-400">
                <MapPin className="h-5 w-5" />
                <span>Paris, France</span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-gray-800 my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} {APP_NAME}. Tous droits réservés.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#" className="text-gray-400 hover:text-white text-sm hover:underline underline-offset-4 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-primary-400">
              Mentions légales
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white text-sm hover:underline underline-offset-4 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-primary-400">
              Politique de confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
