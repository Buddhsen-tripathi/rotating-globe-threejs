"use client";

import { ArrowRight, Play } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

// I dynamically load the globe to avoid SSR issues with Three.js
const GlobeRenderer = dynamic(() => import("@/components/GlobeRenderer"), { ssr: false });

// I create a hero section with the globe as background and UI overlay
export default function HeroSection() {
  return (
    <section
      className="relative overflow-hidden h-screen flex items-center justify-center pt-16"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black to-blue-900 z-0"></div>
      <noscript>
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold">
            Main <span className="bg-gradient-to-r from-cyan-400 to-blue-400">Title</span>
          </h1>
          <p className="text-xl mt-4">
            Subtitle text goes here.
          </p>
        </div>
      </noscript>
      {/* Render the dynamically loaded client-side globe */}
      <GlobeRenderer />
      <div className="container mx-auto px-4 relative z-20">
        <div className="text-center">
          <h1 className="text-6xl md:text-6xl font-bold mb-6 text-white leading-tight">
            Main<span className="text-cyan-400">Title</span>
          </h1>
          <p className="text-2xl mb-8 text-gray-100 max-w-2xl mx-auto">
            Subtitle text goes here.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              href="/tools"
              aria-label="Explore Tools"
              className="group inline-flex items-center justify-center w-48 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 px-0 rounded-lg transition-all duration-300 shadow-xl hover:shadow-cyan-500/25 transform backdrop-blur-sm"
            >
              <span className="text-lg">Button 1</span>
              <ArrowRight className="ml-1 mt-1 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>

            <Link
              href="/demo"
              aria-label="Watch Demo"
              className="group inline-flex items-center justify-center w-48 bg-gray-800/50 border border-gray-600 hover:bg-gray-700/50 hover:border-cyan-500/30 text-white font-bold py-4 px-0 rounded-lg transition-all duration-300 shadow-xl hover:shadow-gray-700/25 transform  backdrop-blur-sm"
            >
              <span className="text-lg">Button 2</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}