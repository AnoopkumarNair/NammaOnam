"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useAnimation } from "framer-motion";
import type { Stall } from "@/types/festival";

interface StallsCarouselProps {
  stalls: Stall[];
}

export function StallsCarousel({ stalls }: StallsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const dragX = useMotionValue(0);
  const controls = useAnimation();

  // Handle responsive visible card counts (peeking the next card to invite swiping)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1.3);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2.3);
      } else {
        setVisibleCount(3.2);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Allow scrolling all the way to the last card so it can be centered
  const maxIndex = Math.max(0, stalls.length - 1);

  // Auto-play interval
  useEffect(() => {
    if (isHovered || maxIndex === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 3500);
    return () => clearInterval(interval);
  }, [isHovered, maxIndex]);

  // Adjust transition position when index changes
  useEffect(() => {
    controls.start({ x: `-${currentIndex * (100 / visibleCount)}%` });
  }, [currentIndex, visibleCount, controls]);

  const handleDragEnd = async () => {
    const x = dragX.get();
    const width = containerRef.current?.offsetWidth || 0;
    const swipeThreshold = width / (visibleCount * 4); // 25% of card width

    if (x < -swipeThreshold && currentIndex < maxIndex) {
      setCurrentIndex((prev) => prev + 1);
    } else if (x > swipeThreshold && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      // Snap back
      controls.start({ x: `-${currentIndex * (100 / visibleCount)}%` });
    }
    dragX.set(0);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  return (
    <div 
      className="relative w-full overflow-hidden group/carousel py-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      ref={containerRef}
    >
      {/* Cards Slider Track */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        style={{ x: dragX }}
        animate={controls}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        onDragEnd={handleDragEnd}
        className="flex cursor-grab active:cursor-grabbing w-full"
      >
        {stalls.map((stall) => (
          <div
            key={`${stall.Location}-${stall.Title}`}
            className="px-2 shrink-0 select-none"
            style={{ width: `${100 / visibleCount}%` }}
          >
            <article className="flex flex-col h-full rounded-2xl overflow-hidden bg-white border border-yellow-200/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="w-full aspect-video flex items-center justify-center overflow-hidden bg-orange-50/20 border-b border-orange-100/30 relative group p-3">
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
        ))}
      </motion.div>

      {/* Navigation Buttons (Desktop only show on hover) */}
      {maxIndex > 0 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-orange-800 border border-orange-100 hover:bg-orange-50 active:scale-95 transition-all duration-200 opacity-0 group-hover/carousel:opacity-100 touch-none z-10"
            aria-label="Previous Stall"
          >
            ←
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-orange-800 border border-orange-100 hover:bg-orange-50 active:scale-95 transition-all duration-200 opacity-0 group-hover/carousel:opacity-100 touch-none z-10"
            aria-label="Next Stall"
          >
            →
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {maxIndex > 0 && (
        <div className="flex justify-center gap-1.5 mt-6">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentIndex === idx 
                  ? "w-6 bg-orange-600" 
                  : "w-1.5 bg-orange-200 hover:bg-orange-300"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
