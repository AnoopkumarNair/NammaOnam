"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface HeroBannerProps {
  title: string;
  subtitle: string;
  targetDate: string;
  eventDateLabel?: string;
  registrationHref?: string;
}

const PETALS = [
  { left: "5%", delay: 0, duration: 12, size: 36, color: "#FFFFFF" },
  { left: "15%", delay: 3, duration: 14, size: 28, color: "#E53935" },
  { left: "22%", delay: 1, duration: 11, size: 42, color: "#FDD835" },
  { left: "30%", delay: 4, duration: 16, size: 24, color: "#43A047" },
  { left: "38%", delay: 2, duration: 13, size: 32, color: "#800000" },
  { left: "45%", delay: 0.5, duration: 10, size: 38, color: "#FFFFFF" },
  { left: "55%", delay: 3.5, duration: 15, size: 26, color: "#FDD835" },
  { left: "62%", delay: 1.5, duration: 12, size: 40, color: "#E53935" },
  { left: "70%", delay: 0.2, duration: 14, size: 30, color: "#43A047" },
  { left: "80%", delay: 2.8, duration: 11, size: 34, color: "#800000" },
  { left: "88%", delay: 1.2, duration: 13, size: 36, color: "#FFFFFF" },
  { left: "95%", delay: 4.5, duration: 16, size: 28, color: "#FDD835" },
  { left: "10%", delay: 5.5, duration: 14, size: 32, color: "#E53935" },
  { left: "50%", delay: 6.0, duration: 11, size: 24, color: "#800000" },
  { left: "85%", delay: 7.0, duration: 15, size: 38, color: "#43A047" },
  { left: "25%", delay: 8.0, duration: 12, size: 30, color: "#FFFFFF" },
  { left: "75%", delay: 9.5, duration: 14, size: 42, color: "#FDD835" },
];

function CountdownUnit({ value, label }: { value: number; label: string }) {
  const [prev, setPrev] = useState(value);
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    if (value !== prev) {
      setFlip(true);
      const timer = setTimeout(() => {
        setPrev(value);
        setFlip(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [value, prev]);

  return (
    <div className="flex flex-col items-center gap-1.5 md:gap-2">
      <div
        className="relative w-16 h-16 md:w-28 md:h-28 rounded-2xl md:rounded-3xl flex items-center justify-center overflow-hidden"
        style={{
          background: "rgba(30, 15, 5, 0.65)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(212, 175, 55, 0.4)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(212,175,55,0.2)",
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-1/2 rounded-t-2xl md:rounded-t-3xl pointer-events-none"
          style={{ background: "rgba(255,255,255,0.04)" }}
        />
        <motion.span
          key={value}
          initial={flip ? { y: -20, opacity: 0 } : false}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="text-2xl md:text-5xl font-bold tabular-nums gold-shimmer"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {String(value).padStart(2, "0")}
        </motion.span>
      </div>
      <span
        className="text-[9px] md:text-xs uppercase tracking-[0.18em] md:tracking-[0.2em] font-semibold"
        style={{ color: "rgba(212,175,55,0.82)" }}
      >
        {label}
      </span>
    </div>
  );
}

export function HeroBanner({
  title,
  subtitle,
  targetDate,
  eventDateLabel = "August 15 & 16, 2026",
  registrationHref = "#activities",
}: HeroBannerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      let parsedTime = new Date(targetDate).getTime();
      
      // Fallback 1: Safari fails on YYYY-MM-DD HH:MM:SS. Inject 'T'.
      if (isNaN(parsedTime)) {
        parsedTime = new Date(targetDate.replace(" ", "T")).getTime();
      }
      
      // Fallback 2: Safari fails on some YYYY-MM-DD variations. Swap to slashes.
      if (isNaN(parsedTime)) {
        parsedTime = new Date(targetDate.replace(/-/g, "/")).getTime();
      }

      const diff = parsedTime - Date.now();
      if (!isNaN(diff) && diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff / 3600000) % 24),
          minutes: Math.floor((diff / 60000) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <section className="relative w-full min-h-[92svh] md:min-h-[100svh] flex flex-col items-center justify-center overflow-hidden py-24 md:py-28">
      <div className="absolute inset-0 z-0">
        <img src="/kerala-dawn.png" alt="Kerala dawn" className="w-full h-full object-cover" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(20,8,2,0.08) 0%, rgba(20,8,2,0.26) 42%, rgba(20,8,2,0.78) 100%)",
          }}
        />
      </div>

      {PETALS.map((petal, index) => (
        <div
          key={index}
          className="petal z-10"
          style={{
            left: petal.left,
            bottom: "-5%",
            width: petal.size,
            height: petal.size,
            animationDuration: `${petal.duration}s`,
            animationDelay: `${petal.delay}s`,
            fontSize: petal.size,
            color: petal.color,
          }}
        >
          *
        </div>
      ))}

      <div
        className="absolute top-0 right-1/4 w-[460px] md:w-[600px] h-[460px] md:h-[600px] pointer-events-none z-10 opacity-20"
        style={{
          background: "radial-gradient(ellipse at center, rgba(212,175,55,0.6) 0%, transparent 70%)",
          transform: "rotate(-30deg) translateY(-30%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-20 text-center px-5 max-w-4xl mx-auto"
      >
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.05em" }}
          animate={{ opacity: 1, letterSpacing: "0.2em" }}
          transition={{ duration: 1.4, delay: 0.3 }}
          className="text-[11px] md:text-sm uppercase font-semibold mb-4 md:mb-5"
          style={{ color: "rgba(212,175,55,0.9)" }}
        >
          G R Sitara - {eventDateLabel}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl sm:text-5xl md:text-8xl font-bold leading-tight"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "#F8F3E7",
            textShadow: "0 4px 32px rgba(0,0,0,0.5)",
          }}
        >
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-3 md:mt-4 text-sm md:text-xl font-medium"
            style={{ 
              color: "#F8F3E7",
              textShadow: "0 2px 16px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,0.8)"
            }}
          >
            {subtitle}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="flex justify-center gap-2.5 md:gap-6 mt-8 md:mt-12"
        >
          <CountdownUnit value={timeLeft.days} label="Days" />
          <CountdownUnit value={timeLeft.hours} label="Hours" />
          <CountdownUnit value={timeLeft.minutes} label="Mins" />
          <CountdownUnit value={timeLeft.seconds} label="Secs" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.3 }}
          className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mt-8 md:mt-12"
        >
          <motion.a
            href="#activities"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="px-7 py-3.5 md:px-8 md:py-4 rounded-full font-semibold text-sm md:text-base transition-shadow duration-300"
            style={{
              background: "var(--gradient-gold)",
              color: "#1E0F08",
              boxShadow: "0 8px 24px rgba(212,175,55,0.4)",
            }}
          >
            Explore Festival
          </motion.a>
          <motion.a
            href={registrationHref}
            target={registrationHref.startsWith("http") ? "_blank" : undefined}
            rel={registrationHref.startsWith("http") ? "noreferrer" : undefined}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="px-7 py-3.5 md:px-8 md:py-4 rounded-full font-semibold text-sm md:text-base transition-all duration-300"
            style={{
              background: "rgba(248,243,231,0.12)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              color: "#F8F3E7",
              border: "1px solid rgba(248,243,231,0.35)",
            }}
          >
            Register Now
          </motion.a>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-5 md:bottom-8 z-20 flex flex-col items-center gap-2 opacity-60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <span className="text-xs uppercase tracking-[0.2em]" style={{ color: "rgba(212,175,55,0.8)" }}>
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-10 rounded-full"
          style={{ background: "linear-gradient(to bottom, rgba(212,175,55,0.8), transparent)" }}
        />
      </motion.div>
    </section>
  );
}
