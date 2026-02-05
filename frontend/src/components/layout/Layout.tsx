import React from "react";
import Head from "next/head";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { APP_NAME } from "@/lib/constants";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  description = "Discover and book amazing events worldwide",
}) => {
  const pageTitle = title ? `${title} | ${APP_NAME}` : APP_NAME;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 flex flex-col">
        <Navbar />
        <main className="flex-grow pt-16">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
