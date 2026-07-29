"use client";

import { motion } from "framer-motion";

interface StackedSectionProps {
  id: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
  index: number;
  icon?: string;
}

export function StackedSection({ id, title, children, className, index, icon }: StackedSectionProps) {
  return (
    <section
      id={id}
      className={`relative w-full flex flex-col items-center justify-start my-4 md:my-8 ${className ?? ""}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-[calc(100%-1.5rem)] md:w-[95%] max-w-7xl mx-auto px-5 md:px-12 py-10 md:py-20 section-card rounded-3xl md:rounded-[2.5rem] flex flex-col overflow-hidden shadow-xl"
      >
        {title && (
          <div className="text-center mb-8 md:mb-16">
            {icon && (
              <div className="text-3xl md:text-5xl mb-4 md:mb-6">{icon}</div>
            )}
            <h2
              className="text-3xl md:text-5xl font-bold tracking-tight"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "var(--foreground)",
              }}
            >
              {title}
            </h2>
            {/* Gold rule under every section title */}
            <div
              className="mx-auto mt-6 h-[2px] w-24 rounded-full"
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
