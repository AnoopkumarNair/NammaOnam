"use client";

import { motion } from "framer-motion";
import { CulturalEvent } from "@/types/festival";

interface CulturalTimelineProps {
  events?: CulturalEvent[];
}

export function CulturalTimeline({ events }: CulturalTimelineProps) {
  const displayEvents = events && events.length > 0 ? events : [
    { Date: "Day 1", Time: "08:00 AM", Title: "Athapookalam Contest", Description: "Traditional floral carpet competition.", Icon: "🌸" },
    { Date: "Day 1", Time: "10:00 AM", Title: "Shinkari Melam", Description: "Welcome Maveli with the thunderous beats of traditional percussion.", Icon: "🥁" },
    { Date: "Day 1", Time: "11:30 AM", Title: "Thiruvathirakkali Dance", Description: "A beautiful traditional dance form performed by residents.", Icon: "💃" },
    { Date: "Day 2", Time: "12:30 PM", Title: "Ona Sadhya", Description: "The grand community feast served on banana leaves.", Icon: "🍛" },
    { Date: "Day 2", Time: "03:30 PM", Title: "Vadam Vali (Tug of War)", Description: "The ultimate block-wise strength competition.", Icon: "🎗️" },
    { Date: "Day 2", Time: "06:00 PM", Title: "Musical Night", Description: "Closing ceremony with live music and prize distribution.", Icon: "🎵" },
  ];

  // Group events by Date
  const groupedEvents = displayEvents.reduce((acc, event) => {
    const dateGroup = (event.Date && event.Date.trim() !== "") ? event.Date.trim() : "";
    if (!acc[dateGroup]) acc[dateGroup] = [];
    acc[dateGroup].push(event);
    return acc;
  }, {} as Record<string, CulturalEvent[]>);

  const groups = Object.entries(groupedEvents);

  return (
    <div className="w-full max-w-6xl mx-auto py-6">
      {(!events || events.length === 0) && (
        <div className="bg-amber-50 text-amber-800 px-4 py-2 rounded-full text-xs font-bold shadow-sm border border-amber-200 animate-pulse text-center w-fit mx-auto mb-8">
          🔍 Displaying Sample Timeline
        </div>
      )}

      {groups.map(([date, dateEvents], groupIdx) => (
        <div key={date || `group-${groupIdx}`} className={groupIdx > 0 ? "mt-12" : ""}>
          {date && (
            <div className="px-4 md:px-0 mb-6">
              <h3 className="text-xl md:text-2xl font-bold text-[var(--color-deep-brown)] border-l-4 pl-3" style={{ borderLeftColor: "var(--color-onam-orange)" }}>
                {date}
              </h3>
            </div>
          )}

          {/* Horizontal Carousel for Mobile, Wrapping Grid for Desktop */}
          <div className="flex overflow-x-auto snap-x custom-scrollbar pb-8 px-4 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dateEvents.map((event, idx) => (
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
                    <div className="flex flex-col gap-1 items-start">
                      {event.Track && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                          event.Track.toLowerCase().includes('main') 
                            ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}>
                          {event.Track}
                        </span>
                      )}
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
      ))}
    </div>
  );
}
