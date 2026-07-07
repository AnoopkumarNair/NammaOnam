"use client";

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function FloatingNilavilakku() {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);
  const [isBright, setIsBright] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    // Show back-to-top when scrolled past 500px
    if (latest > 500) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  const scrollToTop = () => {
    setIsBright(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // Reset brightness after animation
    setTimeout(() => {
      setIsBright(false);
    }, 1000);
  };

  return (
    <motion.button
      onClick={scrollToTop}
      initial={{ opacity: 0, scale: 0.5, y: 50 }}
      animate={{ 
        opacity: visible ? 1 : 0, 
        scale: visible ? 1 : 0.5,
        y: visible ? 0 : 50
      }}
      transition={{ duration: 0.3 }}
      className={cn(
        "fixed bottom-8 right-8 z-50 p-4 rounded-full flex items-center justify-center cursor-pointer pointer-events-auto",
        visible ? "pointer-events-auto" : "pointer-events-none"
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Decorative Glow */}
      <motion.div 
        className={cn(
          "absolute inset-0 rounded-full bg-[var(--color-brand-accent)] blur-xl transition-opacity duration-300",
          isBright ? "opacity-100 scale-150" : "opacity-40"
        )}
        animate={{ 
          scale: isBright ? 1.5 : [1, 1.2, 1],
          opacity: isBright ? 1 : [0.4, 0.6, 0.4]
        }}
        transition={{ duration: isBright ? 0.3 : 2, repeat: isBright ? 0 : Infinity }}
      />
      
      {/* Visual representation of Nilavilakku (placeholder, could use an SVG or Image) */}
      <div className="relative z-10 w-12 h-12 bg-[var(--color-festival-brass)] rounded-full border-2 border-yellow-300 shadow-xl flex items-center justify-center">
        {/* Flame */}
        <motion.div 
          className="absolute -top-3 w-4 h-6 bg-[var(--color-brand-primary)] rounded-full blur-[2px]"
          animate={{ scaleY: [1, 1.2, 0.9, 1.1, 1], x: [0, 1, -1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="w-2 h-6 bg-yellow-600 rounded-t-md" />
      </div>
    </motion.button>
  );
}
