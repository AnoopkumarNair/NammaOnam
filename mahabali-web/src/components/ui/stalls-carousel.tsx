"use client";

import React from "react";
import type { Stall } from "@/types/festival";

interface StallsCarouselProps {
  stalls: Stall[];
}

export function StallsCarousel({ stalls }: StallsCarouselProps) {
  if (!stalls || stalls.length === 0) return null;

  return (
    <div className="relative w-full group/carousel py-6 overflow-hidden">
      <div className="flex animate-marquee gap-6 w-max px-4 hover:[animation-play-state:paused]">
        {/* Repeat twice for continuous infinite loop */}
        {[...stalls, ...stalls].map((stall, idx) => (
          <StallCard 
            key={`${stall.Location}-${stall.Title}-${idx}`}
            stall={stall}
          />
        ))}
      </div>
    </div>
  );
}

function StallCard({ stall }: { stall: Stall }) {
  return (
    <div className="shrink-0 w-64 md:w-72">
      <article className="flex flex-col h-full rounded-2xl overflow-hidden bg-white/95 border-2 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:shadow-[0_0_25px_rgba(251,191,36,0.6)] hover:-translate-y-1 transition-all duration-500 backdrop-blur-sm">
        <div className="w-full aspect-video flex items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50/40 to-amber-100/20 border-b-2 border-amber-200/50 relative group p-3">
          {stall["Image URL"] ? (
            <img
              src={stall["Image URL"]}
              alt={stall.Title}
              className="object-contain w-full h-full filter group-hover:scale-105 transition-transform duration-300 pointer-events-none"
              loading="lazy"
            />
          ) : (
            <span className="text-4xl text-gray-300 pointer-events-none">
              {stall.Title.slice(0, 1)}
            </span>
          )}
          {stall.Location && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-bold px-2.5 py-1 rounded-full shadow-sm text-orange-700">
              {stall.Location}
            </div>
          )}
        </div>
        <div className="p-5 flex flex-col flex-1">
          <h4 className="font-bold text-lg text-[var(--color-deep-brown)] leading-tight">
            {stall.Title}
          </h4>
          <p className="text-sm mt-2 leading-relaxed text-gray-600 flex-1">
            {stall.Description}
          </p>
        </div>
      </article>
    </div>
  );
}
