"use client";

import { useRef, useState, useEffect } from "react";
import { useInView } from "framer-motion";

export function SequentialMedia({ urls, title }: { urls: string[]; title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Trigger when 20% of the video is visible to start buffering
  const isInView = useInView(containerRef, { margin: "0px", amount: 0.2 });

  useEffect(() => {
    if (videoRef.current) {
      if (isInView) {
        // Use a tiny timeout to avoid interrupting the main scroll thread
        setTimeout(() => {
          videoRef.current?.play().catch(() => {
            // Silently ignore Safari auto-play rejection if it happens
          });
        }, 100);
      } else {
        videoRef.current.pause();
      }
    }
  }, [isInView, currentIndex]);

  if (!urls || urls.length === 0) return null;

  const currentUrl = urls[currentIndex];
  const isVideo = currentUrl.toLowerCase().endsWith(".mp4") || currentUrl.toLowerCase().endsWith(".webm");

  const handleEnded = () => {
    setCurrentIndex((prev) => (prev + 1) % urls.length);
  };

  return (
    <div ref={containerRef} className="aspect-video w-full bg-slate-900 relative overflow-hidden">
      {isVideo ? (
        <video
          ref={videoRef}
          key={currentUrl}
          src={currentUrl}
          loop={urls.length === 1}
          muted
          playsInline
          preload="none"
          className="w-full h-full object-cover"
          onEnded={handleEnded}
        />
      ) : (
        <img src={currentUrl} alt={title} loading="lazy" className="w-full h-full object-cover" />
      )}
    </div>
  );
}
