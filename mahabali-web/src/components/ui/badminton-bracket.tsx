"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BadmintonFixture } from "@/types/festival";

interface BadmintonBracketProps {
  fixtures: BadmintonFixture[];
  registrationUrl?: string;
}

// Stage configuration for colors
const STAGES = {
  QF: { color: "#e67e22", bg: "bg-[#e67e22]", text: "text-[#e67e22]", label: "Quarter Finals" },
  SF: { color: "#8e44ad", bg: "bg-[#8e44ad]", text: "text-[#8e44ad]", label: "Semi-Finals" },
  FN: { color: "#d4af37", bg: "bg-[#d4af37]", text: "text-[#d4af37]", label: "Finals" },
};

const MatchCard = ({ match, stage, delayIdx = 0 }: { match: any; stage: keyof typeof STAGES; delayIdx?: number }) => {
  if (!match) return <div className="h-[120px] w-[260px] opacity-0" />;
  
  const isCompleted = match.Status?.toLowerCase() === "completed";
  const isLive = match.Status?.toLowerCase() === "live";
  const stageConfig = STAGES[stage];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: delayIdx * 0.1, duration: 0.4 }}
      className="w-[260px] bg-white rounded-lg border border-gray-200 shadow-sm relative z-10 hover:shadow-md transition-shadow overflow-hidden flex flex-col"
    >
      {/* Top Header (Date | Time | Match No) */}
      <div className="flex bg-[#f8f9fa] border-b border-gray-200 text-[9px] font-bold text-gray-600 uppercase tracking-wider divide-x divide-gray-200">
        <div className="flex-1 text-center py-1">{(match.Date || "").split(" - ")[0] || "TBD"}</div>
        <div className="flex-1 text-center py-1">{(match.Date || "").split(" - ")[1] || "TBD"}</div>
        <div className="flex-1 text-center py-1 text-gray-800 bg-gray-100">{match["Match Name"]}</div>
      </div>

      {/* Teams Container */}
      <div className="flex-1 p-2 flex flex-col justify-center gap-1">
        {["Team A", "Team B"].map((teamKey) => {
          const team = match[teamKey] || "TBD";
          const isWinner = isCompleted && match.Winner === team;
          return (
            <div
              key={teamKey}
              className={`flex justify-between items-center px-2 py-1.5 rounded text-xs border ${
                isWinner ? `border-[${stageConfig.color}] bg-[#fffaf0] font-bold text-gray-900` : 
                isCompleted ? "border-transparent bg-gray-50 text-gray-400" : "border-gray-100 bg-white text-gray-700"
              }`}
            >
              <span className="truncate">{team}</span>
              {isWinner && <span>🏆</span>}
            </div>
          );
        })}
      </div>
      
      {/* Status Footer */}
      {isLive && (
        <div className="bg-red-50 text-red-600 text-center py-1 text-[10px] font-bold border-t border-red-100 animate-pulse">
          🔴 LIVE NOW
        </div>
      )}
    </motion.div>
  );
};

export function BadmintonBracket({ fixtures, registrationUrl }: BadmintonBracketProps) {
  const hasData = fixtures && fixtures.length > 0;
  
  // High quality dummy data to match World Cup style
  const displayFixtures = hasData ? fixtures : [
    { "Match Name": "MATCH-1", "Team A": "Rahul & Ajay", "Team B": "Vikram & Sunil", Status: "Completed", Winner: "Rahul & Ajay", Date: "15-08-2026 - 10:00 AM", Category: "Mens Doubles", Active: true },
    { "Match Name": "MATCH-2", "Team A": "Karthik & Manoj", "Team B": "Deepak & Hari", Status: "Completed", Winner: "Karthik & Manoj", Date: "15-08-2026 - 10:45 AM", Category: "Mens Doubles", Active: true },
    { "Match Name": "MATCH-3", "Team A": "Sanjay & Amit", "Team B": "Praveen & Raj", Status: "Completed", Winner: "Sanjay & Amit", Date: "15-08-2026 - 11:30 AM", Category: "Mens Doubles", Active: true },
    { "Match Name": "MATCH-4", "Team A": "Arun & Naveen", "Team B": "Gokul & Pradeep", Status: "Upcoming", Winner: "", Date: "15-08-2026 - 12:15 PM", Category: "Mens Doubles", Active: true },
    { "Match Name": "MATCH-5", "Team A": "Rahul & Ajay", "Team B": "Karthik & Manoj", Status: "Upcoming", Winner: "", Date: "16-08-2026 - 09:00 AM", Category: "Mens Doubles", Active: true },
    { "Match Name": "MATCH-6", "Team A": "Sanjay & Amit", "Team B": "TBD", Status: "Upcoming", Winner: "", Date: "16-08-2026 - 09:45 AM", Category: "Mens Doubles", Active: true },
    { "Match Name": "FINAL", "Team A": "TBD", "Team B": "TBD", Status: "Upcoming", Winner: "", Date: "16-08-2026 - 04:00 PM", Category: "Mens Doubles", Active: true },
    
    // Womens Singles
    { "Match Name": "MATCH-1", "Team A": "Priya", "Team B": "Anita", Status: "Completed", Winner: "Priya", Date: "15-08-2026 - 02:00 PM", Category: "Womens Singles", Active: true },
    { "Match Name": "MATCH-2", "Team A": "Lakshmi", "Team B": "Meera", Status: "Completed", Winner: "Meera", Date: "15-08-2026 - 02:30 PM", Category: "Womens Singles", Active: true },
    { "Match Name": "FINAL", "Team A": "Priya", "Team B": "Meera", Status: "Upcoming", Winner: "", Date: "16-08-2026 - 11:00 AM", Category: "Womens Singles", Active: true },
  ];

  // Extract unique categories
  const categories = useMemo(() => {
    const unique = Array.from(new Set(displayFixtures.map(f => f.Category || "General")));
    return unique.sort();
  }, [displayFixtures]);

  const [activeTab, setActiveTab] = useState<string>(categories[0] || "General");

  // Filter fixtures by active tab
  const activeFixtures = useMemo(() => {
    return displayFixtures.filter(f => (f.Category || "General") === activeTab);
  }, [displayFixtures, activeTab]);

  // Ensure we always have exactly 7 matches to build the layout for a standard 8-team tree
  const paddedFixtures = [...activeFixtures];
  while (paddedFixtures.length < 7) {
    paddedFixtures.push({
      "Match Name": `Match ${paddedFixtures.length + 1}`,
      "Team A": "TBD",
      "Team B": "TBD",
      Status: "Upcoming",
      Winner: "",
      Date: "TBD",
      Category: activeTab,
      Active: true
    });
  }

  // Organize by stages (assuming 7 matches for QF -> SF -> FN)
  const qf = paddedFixtures.slice(0, 4);
  const sf = paddedFixtures.slice(4, 6);
  const fn = paddedFixtures.slice(6, 7);

  const champion = fn.find(m => m.Status?.toLowerCase() === "completed")?.Winner;

  return (
    <div className="w-full flex flex-col items-center pb-8">
      
      {!hasData && (
        <div className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold border border-blue-200 mb-6 flex items-center gap-2">
          <span>ℹ️</span> Displaying Sample Tournament Data
        </div>
      )}

      {/* Tabs UI */}
      {categories.length > 0 && (
        <div className="flex overflow-x-auto custom-scrollbar gap-2 mb-8 bg-white/50 backdrop-blur-sm p-2 rounded-2xl border border-gray-200 w-[95%] max-w-3xl">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`flex-1 min-w-[120px] px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === cat 
                  ? "bg-[var(--color-onam-orange)] text-white shadow-md" 
                  : "bg-transparent text-gray-600 hover:bg-white hover:shadow-sm"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {registrationUrl && (
        <div className="flex flex-col items-center mb-4">
          <a 
            href={registrationUrl} 
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#d4af37] text-white px-6 py-2 rounded-full font-bold shadow-md hover:bg-yellow-600 transition-colors mb-6"
          >
            🏸 Register for Badminton
          </a>
        </div>
      )}

      {champion && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="bg-[#fffaf0] border-2 border-[#d4af37] rounded-2xl p-6 shadow-xl text-center mb-8"
        >
          <span className="text-5xl drop-shadow-md">🏆</span>
          <h2 className="text-xl font-bold text-gray-500 tracking-widest mt-2 uppercase">Champions</h2>
          <p className="text-3xl font-black text-[#d4af37] mt-1">{champion}</p>
        </motion.div>
      )}

      {/* Bracket Container */}
      <div className="w-full overflow-x-auto custom-scrollbar px-4 pb-8">
        <div className="min-w-max flex items-stretch justify-center gap-12 mx-auto relative pt-4">
          
          {/* Custom Styles for Connector Lines */}
          <style dangerouslySetInnerHTML={{ __html: `
            .bracket-connector-right {
              position: relative;
            }
            .bracket-connector-right::after {
              content: '';
              position: absolute;
              right: -1.5rem;
              top: 50%;
              width: 1.5rem;
              height: 2px;
              background-color: #cbd5e1;
              z-index: 0;
            }
            .bracket-pair {
              position: relative;
            }
            .bracket-pair::after {
              content: '';
              position: absolute;
              right: -1.5rem;
              top: 25%;
              bottom: 25%;
              width: 2px;
              background-color: #cbd5e1;
              z-index: 0;
            }
            .bracket-connector-left {
              position: relative;
            }
            .bracket-connector-left::before {
              content: '';
              position: absolute;
              left: -1.5rem;
              top: 50%;
              width: 1.5rem;
              height: 2px;
              background-color: #cbd5e1;
              z-index: 0;
            }
            .custom-scrollbar::-webkit-scrollbar {
              height: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: #f1f5f9;
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #94a3b8;
              border-radius: 4px;
            }
            
            .stage-header {
              text-align: center;
              font-weight: 800;
              color: white;
              text-transform: uppercase;
              padding: 0.5rem;
              border-radius: 0.5rem 0.5rem 0 0;
              letter-spacing: 0.05em;
              font-size: 0.85rem;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
          `}} />

          {/* Quarter Finals Column */}
          {qf.length === 4 && (
            <div className="flex flex-col gap-4 relative">
              <div className={`stage-header ${STAGES.QF.bg} w-[260px]`}>
                {STAGES.QF.label}
              </div>
              
              <div className="flex flex-col justify-around h-full gap-8 py-4">
                {/* Pair 1 */}
                <div className="bracket-pair flex flex-col justify-center h-full gap-[60px]">
                  <div className="bracket-connector-right"><MatchCard match={qf[0]} stage="QF" delayIdx={0} /></div>
                  <div className="bracket-connector-right"><MatchCard match={qf[1]} stage="QF" delayIdx={1} /></div>
                </div>

                {/* Pair 2 */}
                <div className="bracket-pair flex flex-col justify-center h-full gap-[60px]">
                  <div className="bracket-connector-right"><MatchCard match={qf[2]} stage="QF" delayIdx={2} /></div>
                  <div className="bracket-connector-right"><MatchCard match={qf[3]} stage="QF" delayIdx={3} /></div>
                </div>
              </div>
            </div>
          )}

          {/* Semi Finals Column */}
          {sf.length === 2 && (
            <div className="flex flex-col gap-4 relative">
              <div className={`stage-header ${STAGES.SF.bg} w-[260px]`}>
                {STAGES.SF.label}
              </div>
              
              <div className="flex flex-col justify-around h-full py-4">
                <div className="bracket-pair flex flex-col justify-center h-full gap-[220px]">
                  <div className="bracket-connector-left bracket-connector-right"><MatchCard match={sf[0]} stage="SF" delayIdx={4} /></div>
                  <div className="bracket-connector-left bracket-connector-right"><MatchCard match={sf[1]} stage="SF" delayIdx={5} /></div>
                </div>
              </div>
            </div>
          )}

          {/* Finals Column */}
          {fn.length === 1 && (
            <div className="flex flex-col gap-4 relative">
              <div className={`stage-header ${STAGES.FN.bg} w-[260px]`}>
                🏆 {STAGES.FN.label}
              </div>
              
              <div className="flex flex-col justify-center h-full py-4">
                <div className="bracket-connector-left">
                  <MatchCard match={fn[0]} stage="FN" delayIdx={6} />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
