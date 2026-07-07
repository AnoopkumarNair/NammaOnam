"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FAQItem } from "@/types/festival";

interface FaqAccordionProps {
  faqs?: FAQItem[];
}

export function FaqAccordion({ faqs }: FaqAccordionProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const displayFaqs = faqs && faqs.length > 0 ? faqs : [
    { Question: "What is the date and timing of the Ona Sadhya?", Answer: "The grand community Ona Sadhya is scheduled for August 16, 2026. Seating starts at 12:00 PM." },
    { Question: "How can I register for the Walkathon?", Answer: "You can register by scanning the QR code under the Walkathon section." },
    { Question: "What is the structure of the Badminton tournament?", Answer: "The tournament is a single-elimination knockout format." },
    { Question: "Who can participate in the cultural programs?", Answer: "All residents of GR Sitara (including kids, youths, and senior citizens) are invited." },
    { Question: "Can I manage or sponsor food stalls?", Answer: "Yes, residents can set up stalls. Stall allocations are managed via the organizing committee." },
  ];

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 px-4 py-6">
      {displayFaqs.map((faq, idx) => {
        const isOpen = openIdx === idx;
        return (
          <div key={idx} className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 shadow-sm overflow-hidden">
            <button
              onClick={() => toggle(idx)}
              className="w-full text-left px-6 py-5 flex justify-between items-center font-bold text-lg transition-colors cursor-pointer"
              style={{ color: "var(--color-deep-brown)" }}
            >
              <span>{faq.Question}</span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-xl ml-4 shrink-0"
                style={{ color: "var(--color-onam-orange)" }}
              >
                ▼
              </motion.span>
            </button>
            
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  <div className="px-6 pb-5 leading-relaxed text-sm border-t border-gray-100 pt-3" style={{ color: "rgba(74,46,31,0.80)" }}>
                    {faq.Answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
