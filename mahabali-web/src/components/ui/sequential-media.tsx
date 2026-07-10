"use client";

import { useRef, useState, useEffect } from "react";
import { useInView } from "framer-motion";

export function SequentialMedia({ urls, title }: { urls: string[]; title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: "600px 0px" });
  
  const [isIOS, setIsIOS] = useState(false);
  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes("Mac") && "ontouchend" in document));
  }, []);

  if (!urls || urls.length === 0) return null;

  const currentUrl = urls[currentIndex];
  const isVideo = currentUrl.toLowerCase().endsWith(".mp4") || currentUrl.toLowerCase().endsWith(".webm");

  const handleEnded = () => {
    setCurrentIndex((prev) => (prev + 1) % urls.length);
  };

  return (
    <div ref={ref} className="aspect-video w-full bg-black/5 relative">
      {isVideo ? (
        isIOS ? (
          <div className="w-full h-full bg-slate-900" />
        ) : isInView ? (
          <video
            key={currentUrl}
            src={currentUrl}
            autoPlay
            loop={urls.length === 1}
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
            onEnded={handleEnded}
          />
        ) : null
      ) : (
        <img src={currentUrl} alt={title} loading="lazy" className="w-full h-full object-cover" />
      )}
    </div>
  );
}
