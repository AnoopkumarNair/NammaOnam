"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DriveImage {
  id: string;
  name: string;
  webContentLink: string;
}

export function Gallery() {
  const [images, setImages] = useState<DriveImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGallery() {
      try {
        const res = await fetch("/api/gallery");
        const data = await res.json();
        if (data.files) {
          setImages(data.files);
        }
      } catch (error) {
        console.error("Failed to load gallery", error);
      } finally {
        setLoading(false);
      }
    }
    fetchGallery();
  }, []);

  if (loading) {
    return <div className="w-full text-center p-12 text-[var(--foreground)] opacity-50">Loading memories...</div>;
  }

  if (images.length === 0) {
    return <div className="w-full text-center p-12 text-[var(--foreground)] opacity-50">No images found in the gallery.</div>;
  }

  return (
    <>
      <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4 p-4">
        {images.map((img, idx) => (
          <motion.div 
            key={img.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
            className="break-inside-avoid relative group cursor-pointer overflow-hidden rounded-xl border border-white/20 shadow-sm hover:shadow-xl transition-all"
            onClick={() => setSelectedImage(img.id)}
          >
            <img 
              src={`https://drive.google.com/thumbnail?id=${img.id}&sz=w1000`} 
              alt={img.name} 
              className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500" 
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={`https://drive.google.com/thumbnail?id=${selectedImage}&sz=w2000`}
              alt="Fullscreen"
              className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
