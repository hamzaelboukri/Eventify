"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { APP_NAME } from "@/lib/constants";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, isAuthenticated, isAdmin } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin()) {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard/participant");
      }
    }
  }, [isAuthenticated, isAdmin, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Veuillez entrer une adresse email valide");
      return;
    }

    try {
      await login(formData);
      // Redirect is handled by useEffect
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
    }
  };

  return (
    <>
      <Head>
        <title>Connexion | {APP_NAME}</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-3xl font-bold text-white">{APP_NAME}</h1>
            </Link>
            <p className="text-slate-400 mt-2">Connectez-vous à votre compte</p>
          </div>

          {/* Login Card */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre@email.com"
                  className="w-full bg-slate-700/50 text-white placeholder-slate-400 rounded-xl py-3 px-4 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-slate-700/50 text-white placeholder-slate-400 rounded-xl py-3 px-4 pr-12 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold py-3 px-4 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Connexion...
                  </>
                ) : (
                  "Se connecter"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-slate-700"></div>
              <span className="px-4 text-slate-500 text-sm">ou</span>
              <div className="flex-1 border-t border-slate-700"></div>
            </div>

            {/* Register Link */}
            <p className="text-center text-slate-400">
              Pas encore de compte?{" "}
              <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">
                S&apos;inscrire
              </Link>
            </p>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-slate-700/30 rounded-xl">
              <p className="text-slate-400 text-sm font-medium mb-2">🔑 Comptes de démo:</p>
              <div className="space-y-1 text-sm">
                <p className="text-slate-300">
                  <span className="text-blue-400">Admin:</span> admin@eventify.com / admin123
                </p>
                <p className="text-slate-300">
                  <span className="text-blue-400">User:</span> user@eventify.com / user123
                </p>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link href="/" className="text-slate-400 hover:text-white text-sm transition-colors">
              ← Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
