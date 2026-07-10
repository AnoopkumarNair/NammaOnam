"use client";

import { useRef, useState, useEffect } from "react";
import { useInView } from "framer-motion";

export function SafeVideo({ src, className = "w-full h-full object-cover" }: { src: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: "200px 0px" });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isInView) setLoaded(false);
  }, [isInView]);

  return (
    <div ref={ref} className="absolute inset-0 w-full h-full bg-slate-900 overflow-hidden">
      {isInView ? (
        <video 
          src={src} 
          autoPlay 
          loop 
          muted 
          playsInline 
          preload="metadata" 
          className={className}
          onPlay={() => setLoaded(true)}
          style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.5s ease-out" }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#3b1d11] via-[#521717] to-[#3b1d11]" />
      )}
    </div>
  );
}

export function SequentialMedia({ urls, title }: { urls: string[]; title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);
  
  // Trigger when card is 100px away from entering the screen
  const isInView = useInView(containerRef, { margin: "100px 0px" });

  useEffect(() => {
    if (!isInView) {
      setLoaded(false); // Reset load state when scrolled out
    }
  }, [isInView]);

  // Strict WebKit video memory release workaround to prevent Safari OOM crash on scroll
  useEffect(() => {
    const videoEl = videoRef.current;
    return () => {
      if (videoEl) {
        try {
          videoEl.pause();
          videoEl.removeAttribute("src");
          videoEl.load();
        } catch (e) {
          // Ignore errors during clean up
        }
      }
    };
  }, [isInView, currentIndex]);

  if (!urls || urls.length === 0) return null;

  const currentUrl = urls[currentIndex];
  const isVideo = currentUrl.toLowerCase().endsWith(".mp4") || currentUrl.toLowerCase().endsWith(".webm");

  const handleEnded = () => {
    setCurrentIndex((prev) => (prev + 1) % urls.length);
    setLoaded(false);
  };

  return (
    <div ref={containerRef} className="aspect-video w-full bg-slate-900 relative overflow-hidden">
      {isVideo ? (
        isInView ? (
          <video
            ref={videoRef}
            key={currentUrl}
            src={currentUrl}
            autoPlay
            loop={urls.length === 1}
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
            onEnded={handleEnded}
            onPlay={() => setLoaded(true)}
            style={{ 
              opacity: loaded ? 1 : 0, 
              transition: "opacity 0.5s ease-out" 
            }}
          />
        ) : (
          // Beautiful gradient placeholder while out of view to avoid iOS OOM crash
          <div 
            className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#3b1d11] via-[#521717] to-[#3b1d11]"
            style={{ borderBottom: "1px solid rgba(212,175,55,0.1)" }}
          >
            <div className="text-yellow-100/10 text-4xl font-bold select-none uppercase tracking-[0.2em] font-sans">
              Onam
            </div>
          </div>
        )
      ) : (
        <img 
          src={currentUrl} 
          alt={title} 
          loading="lazy" 
          className="w-full h-full object-cover" 
          onLoad={() => setLoaded(true)}
          style={{ 
            opacity: loaded ? 1 : 0, 
            transition: "opacity 0.5s ease-out" 
          }}
        />
      )}
    </div>
  );
}
