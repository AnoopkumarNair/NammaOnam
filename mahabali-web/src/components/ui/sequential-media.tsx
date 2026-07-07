"use client";

import { useState } from "react";

export function SequentialMedia({ urls, title }: { urls: string[]; title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!urls || urls.length === 0) return null;

  const currentUrl = urls[currentIndex];
  const isVideo = currentUrl.toLowerCase().endsWith(".mp4") || currentUrl.toLowerCase().endsWith(".webm");

  const handleEnded = () => {
    setCurrentIndex((prev) => (prev + 1) % urls.length);
  };

  return isVideo ? (
    <video
      key={currentUrl}
      src={currentUrl}
      autoPlay
      loop={urls.length === 1} // Loop only if there's a single video
      muted
      playsInline
      preload="metadata"
      className="aspect-video w-full object-cover"
      onEnded={handleEnded}
    />
  ) : (
    <img src={currentUrl} alt={title} loading="lazy" className="aspect-video w-full object-cover" />
  );
}
