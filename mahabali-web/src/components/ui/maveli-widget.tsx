"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface MaveliWidgetProps {
  initialMessage?: string;
}

const SECTION_MESSAGES = [
  { id: "activities", msg: "Festival highlights are open." },
  { id: "walkathon", msg: "Walkathon leaderboard is live." },
  { id: "badminton", msg: "Badminton fixtures are here." },
  { id: "culturals", msg: "Cultural programs are lined up." },
  { id: "sponsors", msg: "Sponsors and food stalls await." },
  { id: "gallery", msg: "Memories will show up here." },
  { id: "faq", msg: "Questions answered here." },
  { id: "committee", msg: "Meet the organizing team." },
];

export function MaveliWidget({ initialMessage = "Swagatham to GR Sitara Onam." }: MaveliWidgetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState(initialMessage);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const match = SECTION_MESSAGES.find((section) => section.id === entry.target.id);
            if (match) setMessage(match.msg);
          }
        });
      },
      { threshold: 0.35 },
    );

    SECTION_MESSAGES.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 120, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 22 }}
          className="fixed bottom-5 right-4 sm:bottom-8 sm:right-6 z-[45] flex items-end gap-3 pointer-events-none"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            key={message}
            className="hidden sm:block bg-white/92 backdrop-blur-md text-[var(--color-deep-brown)] px-4 py-3 rounded-2xl rounded-br-sm shadow-xl border border-white/50 text-xs font-bold max-w-[190px] pointer-events-auto"
          >
            {message}
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full shadow-2xl border-2 border-[var(--color-temple-gold)] cursor-pointer relative overflow-hidden pointer-events-auto bg-black"
            aria-label="Maveli guide"
            title={message}
          >
            <video
              src="/King_Maveli_dancing_with_procession_202607062058.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <motion.div
              className="absolute inset-0 rounded-full border border-white/25"
              animate={{ scale: [1, 1.18, 1], opacity: [0.3, 0.65, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
