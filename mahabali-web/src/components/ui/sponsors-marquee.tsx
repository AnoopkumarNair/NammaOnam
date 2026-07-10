"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { Sponsor } from "@/types/festival";

interface SponsorsMarqueeProps {
  sponsors: Sponsor[];
}

export function SponsorsMarquee({ sponsors }: SponsorsMarqueeProps) {
  if (!sponsors || sponsors.length === 0) return null;

  // Separate Title sponsor from the rest ONLY if they are explicitly Title/Platinum
  const titleSponsor = sponsors.find(s => s.Tier?.toLowerCase() === "title" || s.Tier?.toLowerCase() === "platinum");
  const marqueeSponsors = titleSponsor ? sponsors.filter(s => s !== titleSponsor) : sponsors;

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1000);
  const animationRef = useRef<number | null>(null);
  const isInitialized = useRef(false);

  const { scrollX } = useScroll({ container: containerRef });

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) setContainerWidth(containerRef.current.clientWidth);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const startAutoPlay = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    let lastTime = performance.now();
    const speed = 0.05; // 50px per second

    const step = (time: number) => {
      const dt = time - lastTime;
      const container = containerRef.current;
      if (container && dt > 0) {
        container.scrollLeft += speed * dt;
      }
      lastTime = time;
      animationRef.current = requestAnimationFrame(step);
    };
    
    animationRef.current = requestAnimationFrame(step);
  };

  const stopAutoPlay = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  const multiplier = 200;
  const extendedSponsors = Array(multiplier).fill(marqueeSponsors).flat();

  useEffect(() => {
    if (!isInitialized.current && containerRef.current && containerWidth > 0 && marqueeSponsors.length > 0) {
      const container = containerRef.current;
      
      const isMobile = containerWidth < 768;
      const cardWidth = isMobile ? 128 : 160; 
      const gap = 64; 
      const cardTotalWidth = cardWidth + gap;
      
      const middleIndex = Math.floor(multiplier / 2) * marqueeSponsors.length;
      const centerScrollOffset = middleIndex * cardTotalWidth - (containerWidth - cardWidth) / 2;
      
      container.style.scrollBehavior = "auto";
      container.scrollLeft = centerScrollOffset;
      void container.offsetWidth;
      container.style.scrollBehavior = "smooth";
      
      isInitialized.current = true;
      startAutoPlay();
    }
    
    return () => stopAutoPlay();
  }, [containerWidth, marqueeSponsors.length]);

  return (
    <div className="w-full bg-white border-y border-yellow-200/50 py-10 overflow-hidden flex flex-col items-center">
      {titleSponsor && (
        <div className="max-w-7xl mx-auto w-full px-6 mb-12 flex flex-col items-center justify-center text-center">
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
      )}

      {marqueeSponsors.length > 0 && (
        <div className="w-full relative flex items-center py-6">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          
          <div 
            ref={containerRef}
            onTouchStart={stopAutoPlay}
            onTouchMove={stopAutoPlay}
            onMouseDown={stopAutoPlay}
            onWheel={stopAutoPlay}
            className="w-full flex gap-16 overflow-x-auto pb-6 px-0"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <style dangerouslySetInnerHTML={{__html: `
              div::-webkit-scrollbar {
                display: none !important;
              }
            `}} />
            
            {extendedSponsors.map((sponsor, idx) => (
              <SponsorCardWrapper 
                key={`${sponsor.Title}-${idx}`}
                sponsor={sponsor}
                index={idx}
                scrollX={scrollX}
                containerWidth={containerWidth}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SponsorCardWrapper({ sponsor, index, scrollX, containerWidth }: any) {
  const isMobile = containerWidth < 768;
  const cardWidth = isMobile ? 128 : 160; 
  const gap = 64; // gap-16 = 64px
  const cardTotalWidth = cardWidth + gap;

  // Assuming container has px-0
  const centerScrollOffset = index * cardTotalWidth - (containerWidth - cardWidth) / 2;

  const range = [
    centerScrollOffset - cardTotalWidth * 2,
    centerScrollOffset,
    centerScrollOffset + cardTotalWidth * 2
  ];

  // Scale up to 1.4x in the center, fade edges
  const scale = useTransform(scrollX, range, [0.75, 1.4, 0.75]);
  const opacity = useTransform(scrollX, range, [0.3, 1, 0.3]);

  return (
    <motion.div 
      style={{ scale, opacity, width: cardWidth }}
      className="shrink-0 flex items-center justify-center h-20 md:h-24"
    >
      {sponsor["Website URL"] ? (
        <a href={sponsor["Website URL"]} target="_blank" rel="noreferrer" className="block w-full h-full">
          {sponsor["Logo URL"] || sponsor["Image URL"] ? (
            <img src={sponsor["Logo URL"] || sponsor["Image URL"]} alt={sponsor.Title} className="w-full h-full object-contain filter hover:brightness-110 transition-all duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-400 text-center bg-gray-50/50 rounded-xl border border-gray-100">{sponsor.Title}</div>
          )}
        </a>
      ) : (
        <div className="w-full h-full">
          {sponsor["Logo URL"] || sponsor["Image URL"] ? (
            <img src={sponsor["Logo URL"] || sponsor["Image URL"]} alt={sponsor.Title} className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-400 text-center bg-gray-50/50 rounded-xl border border-gray-100">{sponsor.Title}</div>
          )}
        </div>
      )}
    </motion.div>
  );
}
