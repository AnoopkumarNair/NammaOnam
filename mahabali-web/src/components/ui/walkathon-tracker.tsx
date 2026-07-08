"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface WalkathonEntry {
  "Participant Name": string;
  Steps: string | number;
}

interface WalkathonTrackerProps {
  leaderboard: WalkathonEntry[];
  registrationUrl?: string;
}

const RANK_COLORS = ["#D4AF37", "#A8A9AD", "#CD7F32"]; // Gold, Silver, Bronze

export function WalkathonTracker({ leaderboard, registrationUrl }: WalkathonTrackerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="text-center py-16" style={{ color: "rgba(74,46,31,0.4)" }}>
        <p className="text-5xl mb-4">👟</p>
        <p className="text-lg font-medium">Walkathon registrations open soon.</p>
      </div>
    );
  }

  // Calculate max steps to determine percentages
  const maxSteps = Math.max(...leaderboard.map((e) => Number(e.Steps) || 0), 10000); // minimum 10k max to avoid 100% on small numbers

  // Split into Top 3 and Others (capping at Top 5 total)
  const top3 = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3, 5);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-12">
      {/* ── Top 3: Apple Fitness Style Rings ── */}
      {registrationUrl && (
        <div className="flex flex-col items-center mb-4">
          <a 
            href={registrationUrl} 
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--color-onam-orange)] text-white px-6 py-2 rounded-full font-bold shadow-md hover:bg-orange-600 transition-colors mb-6"
          >
            📝 Register for Walkathon
          </a>
        </div>
      )}

      <div className="flex flex-row gap-4 justify-center items-end px-4">
        {[1, 0, 2].map((rankIdx) => {
          const entry = top3[rankIdx];
          if (!entry) return null;

          const steps = Number(entry.Steps) || 0;
          const percentage = Math.min((steps / maxSteps) * 100, 100);
          const color = RANK_COLORS[rankIdx];
          const isFirst = rankIdx === 0;

          return (
            <motion.div
              key={rankIdx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: rankIdx * 0.2, duration: 0.6, type: "spring" }}
              className={`flex flex-col items-center gap-3 ${isFirst ? "order-2 md:-translate-y-6" : rankIdx === 1 ? "order-1 mt-6" : "order-3 mt-6"} w-[32%] max-w-[160px]`}
            >
              <div className="relative flex items-center justify-center">
                {/* Background Ring */}
                <svg className="w-24 h-24 md:w-32 md:h-32 transform -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="35%"
                    stroke="rgba(0,0,0,0.05)"
                    strokeWidth="10"
                    fill="none"
                  />
                  {/* Progress Ring */}
                  {mounted && (
                    <motion.circle
                      cx="50%"
                      cy="50%"
                      r="35%"
                      stroke={color}
                      strokeWidth="10"
                      fill="none"
                      strokeLinecap="round"
                      initial={{ strokeDashoffset: 100 }}
                      animate={{ strokeDashoffset: 100 - percentage }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                      style={{ strokeDasharray: 100, filter: `drop-shadow(0px 0px 4px ${color}88)` }}
                    />
                  )}
                </svg>

                {/* Center Content */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl md:text-5xl mb-0.5">{rankIdx === 0 ? "🥇" : rankIdx === 1 ? "🥈" : "🥉"}</span>
                </div>
              </div>

              {/* Name & Steps */}
              <div className="text-center bg-white/90 backdrop-blur-md px-2 py-2 md:px-3 md:py-3 rounded-xl shadow-md border border-black/5 w-full">
                <h4 className="font-bold text-[11px] md:text-sm truncate" style={{ color: "var(--color-deep-brown)" }}>
                  {entry["Participant Name"]}
                </h4>
                <p className="font-bold text-[11px] md:text-sm mt-0.5" style={{ color: color }}>
                  {steps.toLocaleString()}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Remaining Participants: Horizontal Progress Bars ── */}
      {others.length > 0 && (
        <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/60 shadow-xl">
          <h3 className="font-bold text-xl mb-6" style={{ color: "var(--color-deep-brown)", fontFamily: "'Playfair Display', serif" }}>
            Leaderboard Tracker
          </h3>
          <div className="flex flex-col gap-5">
            {others.map((entry, idx) => {
              const rank = idx + 4;
              const steps = Number(entry.Steps) || 0;
              const percentage = Math.min((steps / maxSteps) * 100, 100);

              return (
                <div key={idx} className="flex flex-col gap-2">
                  <div className="flex justify-between items-end px-1 text-sm font-semibold">
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center text-black/40">#{rank}</span>
                      <span style={{ color: "var(--color-deep-brown)" }}>{entry["Participant Name"]}</span>
                    </div>
                    <span style={{ color: "var(--color-onam-orange)" }}>{steps.toLocaleString()}</span>
                  </div>

                  {/* Progress Bar Track */}
                  <div className="h-3 w-full bg-black/5 rounded-full overflow-hidden">
                    {mounted && (
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${percentage}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: "easeOut", delay: idx * 0.1 }}
                        className="h-full rounded-full"
                        style={{
                          background: "linear-gradient(90deg, #E67E22, #D4AF37)",
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
