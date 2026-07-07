"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface StackedSectionProps {
  id: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
  index: number;
  icon?: string;
}

export function StackedSection({ id, title, children, className, index, icon }: StackedSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const scale   = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.97, 1, 1, 0.97]);
  const opacity = useTransform(scrollYProgress, [0, 0.12, 0.88, 1], [0.5, 1, 1, 0.6]);

  return (
    <section
      id={id}
      ref={containerRef}
      className={`relative w-full flex flex-col items-center justify-start md:sticky ${className ?? ""}`}
      style={{ top: `${index * 40}px`, zIndex: index * 10 }}
    >
      <motion.div
        style={{ scale, opacity }}
        className="w-[calc(100%-1rem)] md:w-full max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-20 section-card rounded-3xl md:rounded-[2rem] md:min-h-[82vh] flex flex-col overflow-hidden"
      >
        {title && (
          <div className="text-center mb-7 md:mb-14">
            {icon && (
              <div className="text-3xl md:text-4xl mb-3 md:mb-4">{icon}</div>
            )}
            <h2
              className="text-2xl md:text-5xl font-bold"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "var(--foreground)",
              }}
            >
              {title}
            </h2>
            {/* Gold rule under every section title */}
            <div
              className="mx-auto mt-4 h-px w-20"
              style={{ background: "var(--gradient-gold)" }}
            />
          </div>
        )}
        <div className="flex-1 w-full relative">
          {children}
        </div>
      </motion.div>
    </section>
  );
}
