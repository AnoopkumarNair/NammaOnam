"use client";

import { motion } from "framer-motion";
import { CulturalEvent } from "@/types/festival";

interface CulturalTimelineProps {
  events?: CulturalEvent[];
}

export function CulturalTimeline({ events }: CulturalTimelineProps) {
  const displayEvents = events && events.length > 0 ? events : [
    { Time: "08:00 AM - 09:30 AM", Title: "Athapookalam Contest", Description: "Traditional floral carpet competition.", Icon: "🌸" },
    { Time: "10:00 AM - 11:30 AM", Title: "Shinkari Melam", Description: "Welcome Maveli with the thunderous beats of traditional percussion.", Icon: "🥁" },
    { Time: "11:30 AM - 12:30 PM", Title: "Thiruvathirakkali Dance", Description: "A beautiful traditional dance form performed by residents.", Icon: "💃" },
    { Time: "12:30 PM - 03:00 PM", Title: "Ona Sadhya", Description: "The grand community feast served on banana leaves.", Icon: "🍛" },
    { Time: "03:30 PM - 05:00 PM", Title: "Vadam Vali (Tug of War)", Description: "The ultimate block-wise strength competition.", Icon: "🎗️" },
    { Time: "06:00 PM onwards", Title: "Musical Night", Description: "Closing ceremony with live music and prize distribution.", Icon: "🎵" },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto py-6">
      {(!events || events.length === 0) && (
        <div className="bg-amber-50 text-amber-800 px-4 py-2 rounded-full text-xs font-bold shadow-sm border border-amber-200 animate-pulse text-center w-fit mx-auto mb-8">
          🔍 Displaying Sample Timeline
        </div>
      )}

      {/* Horizontal Carousel for Mobile, Wrapping Grid for Desktop */}
      <div className="flex overflow-x-auto snap-x custom-scrollbar pb-8 px-4 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayEvents.map((event, idx) => (
          <motion.div
            key={`${event.Title}-${idx}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
            className="snap-center shrink-0 w-[85vw] max-w-[320px] md:w-auto flex flex-col relative"
          >
            {/* Event Card */}
            <div className="flex-1 bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm hover:shadow-md transition-all flex flex-col h-full border-t-4" style={{ borderTopColor: "var(--color-onam-orange)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[var(--color-brand-secondary)] border-2 border-yellow-100 flex items-center justify-center shadow-sm text-2xl shrink-0">
                  {event.Icon || "🌟"}
                </div>
                <div>
                  <span className="block text-xs font-bold text-[var(--color-deep-brown)] uppercase tracking-widest">
                    {event.Time}
                  </span>
                </div>
              </div>
              
              <h4 className="text-lg font-bold text-[var(--foreground)] mb-2 leading-tight">{event.Title}</h4>
              <p className="text-sm text-gray-600 leading-relaxed flex-1">
                {event.Description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
