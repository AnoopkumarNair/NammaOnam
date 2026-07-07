"use client";

import { motion } from "framer-motion";
import type { Sponsor } from "@/types/festival";

interface SponsorsMarqueeProps {
  sponsors: Sponsor[];
}

export function SponsorsMarquee({ sponsors }: SponsorsMarqueeProps) {
  if (!sponsors || sponsors.length === 0) return null;

  // Separate Title sponsor from the rest
  const titleSponsor = sponsors.find(s => s.Tier?.toLowerCase() === "title" || s.Tier?.toLowerCase() === "platinum") || sponsors[0];
  const otherSponsors = sponsors.filter(s => s !== titleSponsor);

  return (
    <div className="w-full bg-white border-y border-yellow-200/50 py-6 overflow-hidden flex flex-col items-center">
      <div className="max-w-7xl mx-auto w-full px-6 mb-6 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--color-onam-orange)] mb-3">
          Title Sponsor
        </span>
        {titleSponsor["Website URL"] ? (
          <a href={titleSponsor["Website URL"]} target="_blank" rel="noreferrer" className="block w-full max-w-sm h-32 md:h-40 relative group">
            {titleSponsor["Logo URL"] || titleSponsor["Image URL"] ? (
              <img 
                src={titleSponsor["Logo URL"] || titleSponsor["Image URL"]} 
                alt={titleSponsor.Title} 
                className="w-full h-full object-contain filter group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-100 group-hover:border-yellow-300 transition-colors">
                <span className="text-2xl font-black text-gray-400">{titleSponsor.Title}</span>
              </div>
            )}
          </a>
        ) : (
          <div className="w-full max-w-sm h-32 md:h-40 relative">
            {titleSponsor["Logo URL"] || titleSponsor["Image URL"] ? (
              <img 
                src={titleSponsor["Logo URL"] || titleSponsor["Image URL"]} 
                alt={titleSponsor.Title} 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-2xl font-black text-gray-400">{titleSponsor.Title}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {otherSponsors.length > 0 && (
        <div className="w-full relative flex items-center">
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10" />
          
          <div className="flex w-fit animate-marquee hover:[animation-play-state:paused] gap-8 py-6">
            {[...otherSponsors, ...otherSponsors, ...otherSponsors].map((sponsor, idx) => (
              <div key={`${sponsor.Title}-${idx}`} className="shrink-0 flex items-center justify-center h-16 w-32 md:h-20 md:w-40 hover:scale-110 transition-transform duration-300">
                {sponsor["Website URL"] ? (
                  <a href={sponsor["Website URL"]} target="_blank" rel="noreferrer" className="block w-full h-full">
                    {sponsor["Logo URL"] || sponsor["Image URL"] ? (
                      <img src={sponsor["Logo URL"] || sponsor["Image URL"]} alt={sponsor.Title} className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-400 text-center">{sponsor.Title}</div>
                    )}
                  </a>
                ) : (
                  <div className="w-full h-full">
                    {sponsor["Logo URL"] || sponsor["Image URL"] ? (
                      <img src={sponsor["Logo URL"] || sponsor["Image URL"]} alt={sponsor.Title} className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-400 text-center">{sponsor.Title}</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
