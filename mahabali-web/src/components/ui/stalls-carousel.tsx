"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { Stall } from "@/types/festival";

interface StallsCarouselProps {
  stalls: Stall[];
}

export function StallsCarousel({ stalls }: StallsCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(375);
  const [isInteracting, setIsInteracting] = useState(false);
  const animationRef = useRef<number | null>(null);
  const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef(false);

  // Hook into scroll position of our scroll container using Framer Motion
  const { scrollX } = useScroll({ container: containerRef });
  
  // Duplicate stalls to create a near-infinite scrolling experience
  const multiplier = 200;
  const extendedStalls = Array(multiplier).fill(stalls).flat();

  // Track container width for centering calculations
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Helper to scroll
  const getCardWidth = (w: number) => {
    if (w < 640) return w * 0.75;
    if (w < 1024) return w * 0.45;
    return 280;
  };

  // Auto-play continuous scrolling logic
  const startAutoPlay = () => {
    stopAutoPlay();
    let lastTime = performance.now();
    const speed = 0.05; // pixels per ms (~50px per second)

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

  useEffect(() => {
    if (!isInitialized.current && containerRef.current && containerWidth > 0 && stalls.length > 0) {
      const container = containerRef.current;
      const cardWidth = getCardWidth(containerWidth);
      const cardTotalWidth = cardWidth + 16;
      const padding = 16;
      
      // Start in the middle of our extended array
      const middleIndex = Math.floor(multiplier / 2) * stalls.length;
      
      // Calculate exact scroll position for the middle item
      const centerScrollOffset = middleIndex * cardTotalWidth - (containerWidth - cardWidth) / 2 + padding;
      
      // Temporarily disable smooth behavior for instant jump
      container.style.scrollBehavior = "auto";
      container.scrollLeft = centerScrollOffset;
      // Force reflow
      void container.offsetWidth;
      
      isInitialized.current = true;
    }
  }, [containerWidth, stalls.length]);

  useEffect(() => {
    if (!isInteracting) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }
    return () => stopAutoPlay();
  }, [isInteracting, stalls.length, containerWidth]);

  // Pause autoplay on interaction, resume after 6 seconds of inactivity
  const handleInteraction = () => {
    setIsInteracting(true);
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
    interactionTimeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, 6000);
  };

  const scrollPrev = () => {
    handleInteraction();
    const container = containerRef.current;
    if (container) {
      const cardWidth = getCardWidth(containerWidth);
      container.scrollBy({ left: -(cardWidth + 16), behavior: "smooth" });
    }
  };

  const scrollNext = () => {
    handleInteraction();
    const container = containerRef.current;
    if (container) {
      const cardWidth = getCardWidth(containerWidth);
      container.scrollBy({ left: cardWidth + 16, behavior: "smooth" });
    }
  };

  return (
    <div 
      className="relative w-full group/carousel py-6"
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
    >
      {/* Scrollable Container with Native Scroll Snap and 3D Perspective */}
      <div
        ref={containerRef}
        onTouchStart={handleInteraction}
        onTouchMove={handleInteraction}
        onMouseDown={handleInteraction}
        onWheel={handleInteraction}
        className="w-full flex gap-4 overflow-x-auto pb-6 px-4"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          perspective: "1000px",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Hide Webkit Scrollbar */}
        <style dangerouslySetInnerHTML={{__html: `
          div::-webkit-scrollbar {
            display: none !important;
          }
        `}} />
        
        {extendedStalls.map((stall, idx) => (
          <StallCardWrapper 
            key={`${stall.Location}-${stall.Title}-${idx}`}
            stall={stall}
            index={idx}
            scrollX={scrollX}
            containerWidth={containerWidth}
          />
        ))}
      </div>

      {/* Navigation Buttons (Desktop only) */}
      <button
        onClick={scrollPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 shadow-md flex items-center justify-center text-orange-850 border border-orange-100 hover:bg-orange-50 active:scale-95 transition-all duration-200 opacity-0 group-hover/carousel:opacity-100 touch-none z-10 hidden sm:flex"
        aria-label="Previous Stall"
      >
        ←
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 shadow-md flex items-center justify-center text-orange-850 border border-orange-100 hover:bg-orange-50 active:scale-95 transition-all duration-200 opacity-0 group-hover/carousel:opacity-100 touch-none z-10 hidden sm:flex"
        aria-label="Next Stall"
      >
        →
      </button>
    </div>
  );
}

interface StallCardWrapperProps {
  stall: Stall;
  index: number;
  scrollX: any;
  containerWidth: number;
}

function StallCardWrapper({ stall, index, scrollX, containerWidth }: StallCardWrapperProps) {
  const isMobile = containerWidth < 640;

  // Calculate card width dynamically matching our responsive layout widths
  const getCardWidth = () => {
    if (containerWidth < 640) return containerWidth * 0.75;
    if (containerWidth < 1024) return containerWidth * 0.45;
    return 280;
  };

  const cardWidth = getCardWidth();
  const gap = 16;
  const padding = 16; // px-4 padding
  const cardTotalWidth = cardWidth + gap;

  // Calculate scrollLeft offset when this card is perfectly centered in the viewport
  const centerScrollOffset = index * cardTotalWidth - (containerWidth - cardWidth) / 2 + padding;

  const range = [
    centerScrollOffset - cardTotalWidth,
    centerScrollOffset,
    centerScrollOffset + cardTotalWidth
  ];

  // Dynamic 3D transformations bound tightly to mobile/desktop screens
  // Mobile limits values (smaller scale down, smaller rotation angle) to keep text fully readable without edge clipping
  const scale = useTransform(scrollX, range, isMobile ? [0.93, 1, 0.93] : [0.88, 1, 0.88]);
  const opacity = useTransform(scrollX, range, isMobile ? [0.82, 1, 0.82] : [0.65, 1, 0.65]);
  const rotateY = useTransform(scrollX, range, isMobile ? [7, 0, -7] : [12, 0, -12]);
  const z = useTransform(scrollX, range, isMobile ? [-20, 0, -20] : [-50, 0, -50]);

  return (
    <motion.div
      style={{
        width: cardWidth,
        scale,
        opacity,
        rotateY,
        z,
        transformStyle: "preserve-3d",
      }}
      className="shrink-0"
    >
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
    </motion.div>
  );
}
