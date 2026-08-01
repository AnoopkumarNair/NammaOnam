"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BadmintonFixture } from "@/types/festival";

interface BadmintonBracketProps {
  fixtures: BadmintonFixture[];
  rulesUrl?: string;
}

/* ── helpers ─────────────────────────────────────────── */

const norm = (s?: string) => (s || "").trim().toLowerCase().replace(/\s+/g, " ");
const isCompleted = (s?: string) => { const v = norm(s); return v === "completed" || v === "complete" || v === "done"; };
const isLive = (s?: string) => norm(s) === "live";

const STAGE_COLORS: Record<number, { color: string; label: string }> = {
  0: { color: "#d4af37", label: "🏆 Finals" },
  1: { color: "#8e44ad", label: "Semi-Finals" },
  2: { color: "#e67e22", label: "Quarter Finals" },
  3: { color: "#2980b9", label: "Knockouts" },
  4: { color: "#27ae60", label: "Round of 32" },
};
const stageFor = (depth: number) => STAGE_COLORS[depth] ?? { color: "#7f8c8d", label: `Round ${depth}` };

/* ── small match card used in bracket ────────────────── */

function BracketCard({ match, color }: { match: BadmintonFixture; color: string }) {
  const done = isCompleted(match.Status);
  const live = isLive(match.Status);
  const winner = norm(match.Winner);
  const score = (match.Score || "").trim();

  const Team = ({ name }: { name: string }) => {
    const n = name.trim() || "TBD";
    const won = done && winner === norm(n) && norm(n) !== "" && norm(n) !== "tbd";
    return (
      <div className={`flex items-center justify-between px-3 py-1.5 text-[11px] sm:text-xs ${
        won ? "font-bold text-gray-900" : done ? "text-gray-400" : "text-gray-700"
      }`}>
        <span className="truncate">{n}</span>
        {won && <span className="shrink-0 ml-1 text-amber-500">🏆</span>}
      </div>
    );
  };

  const datePart = (match.Date || "").split(" - ")[0] || "";
  const timePart = (match.Date || "").split(" - ")[1] || "";

  return (
    <div className="w-[200px] sm:w-[230px] bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden shrink-0">
      {/* date & time header */}
      {(datePart || timePart) && (
        <div className="flex items-center justify-between px-3 py-1 bg-gray-50 border-b border-gray-100 text-[9px] font-semibold text-gray-400">
          <span>{datePart}</span>
          <span>{timePart}</span>
        </div>
      )}
      {/* teams */}
      <Team name={match["Team A"]} />
      <div className="h-px bg-gray-100" />
      <Team name={match["Team B"]} />
      {/* score strip */}
      {(score || live) && (
        <div className={`text-[10px] font-extrabold text-center py-1 ${
          live ? "bg-red-500 text-white animate-pulse" : "text-white"
        }`} style={live ? {} : { backgroundColor: color }}>
          {live ? "🔴 LIVE" : score}
        </div>
      )}
    </div>
  );
}

/* ── bracket round builder ───────────────────────────── */

function buildRounds(fixtures: BadmintonFixture[]) {
  let maxDepth = -1;
  const depths = new Map<BadmintonFixture, number>();
  const unknowns: BadmintonFixture[] = [];

  fixtures.forEach(f => {
    const n = norm(f["Match Name"]);
    let d = -1;
    if (n.includes("final") && !n.includes("semi") && !n.includes("quarter")) d = 0;
    else if (n.includes("semi")) d = 1;
    else if (n.includes("quarter")) d = 2;
    else if (n.includes("knock") || n.includes("16") || n.includes("pre-quarter")) d = 3;
    else if (n.includes("32")) d = 4;

    if (d !== -1) { if (d > maxDepth) maxDepth = d; depths.set(f, d); }
    else unknowns.push(f);
  });

  if (maxDepth === -1) {
    // Fallback: all unknowns, just stack as single round
    return [{ depth: 0, matches: fixtures, ...stageFor(0) }];
  }

  // Assign unknowns to rounds beyond maxDepth
  if (unknowns.length > 0) {
    const remaining = [...unknowns];
    while (remaining.length > 0) {
      maxDepth++;
      const cap = 1 << maxDepth;
      const start = Math.max(0, remaining.length - cap);
      remaining.splice(start, cap).forEach(f => depths.set(f, maxDepth));
    }
  }

  const rounds = [];
  for (let i = maxDepth; i >= 0; i--) {
    const m = fixtures.filter(f => depths.get(f) === i);
    if (m.length > 0 || i === 0) rounds.push({ depth: i, matches: m, ...stageFor(i) });
  }
  return rounds;
}

/* ── match group for "all matches" view ──────────────── */

function MatchGroup({ label, matches }: { label: string; matches: BadmintonFixture[] }) {
  return (
    <div>
      <h4 className="text-xs font-bold text-gray-700 mb-2 pl-1">{label}</h4>
      <div className="flex flex-col gap-2.5">
        {matches.map((match, idx) => {
          const done = isCompleted(match.Status);
          const live = isLive(match.Status);
          const winner = norm(match.Winner);
          const datePart = (match.Date || "").split(" - ")[0] || "";
          const time = (match.Date || "").split(" - ")[1] || "";
          const score = (match.Score || "").trim();

          return (
            <motion.div key={idx}
              initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: idx * 0.03 }}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-sm transition-shadow">

              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-bold text-gray-400 shrink-0">{datePart}</span>
                  <span className="text-[10px] text-gray-300">·</span>
                  <span className="text-[10px] font-bold text-gray-500 shrink-0">{time}</span>
                  <span className="text-[10px] text-gray-300">·</span>
                  <span className="text-[10px] font-semibold text-gray-700 truncate">{match["Match Name"]}</span>
                </div>
                {live ? (
                  <span className="text-[10px] font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100 animate-pulse shrink-0">🔴 LIVE</span>
                ) : done ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 shrink-0">✓ Done</span>
                ) : (
                  <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">Upcoming</span>
                )}
              </div>

              <div className="flex items-stretch">
                <div className="flex-1 flex flex-col divide-y divide-gray-100">
                  {(["Team A", "Team B"] as const).map(key => {
                    const name = ((key === "Team A" ? match["Team A"] : match["Team B"]) || "TBD").trim();
                    const won = done && winner === norm(name) && norm(name) !== "" && norm(name) !== "tbd";
                    return (
                      <div key={key} className={`flex items-center justify-between px-4 py-3 text-sm ${won ? "font-bold text-gray-900" : "text-gray-600"}`}>
                        <span className="truncate pr-3">{name}</span>
                        {won && <span className="shrink-0 ml-1 text-amber-500">🏆</span>}
                      </div>
                    );
                  })}
                </div>
                {score && (
                  <div className="shrink-0 w-[72px] flex items-center justify-center bg-amber-500 text-white text-sm font-black text-center leading-tight px-2">
                    {score}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ── main component ──────────────────────────────────── */

export function BadmintonBracket({ fixtures, rulesUrl }: BadmintonBracketProps) {
  const hasData = fixtures && fixtures.length > 0;

  const displayFixtures = hasData ? fixtures : [
    { "Match Name": "Quarter Finals 1", "Team A": "Sajith & Ratheesh", "Team B": "Santhosh & Vasu", Status: "Complete", Winner: "Santhosh & Vasu", Date: "01-08-2026 - 02:00 PM", Category: "Men's Doubles", Score: "21-13", Active: true },
    { "Match Name": "Quarter Finals 2", "Team A": "Bhanu & Rohit", "Team B": "Sourav Bose & Gaurav", Status: "Complete", Winner: "Bhanu & Rohit", Date: "01-08-2026 - 02:20 PM", Category: "Men's Doubles", Score: "21-10", Active: true },
    { "Match Name": "Semi Finals 1", "Team A": "Winner 15", "Team B": "Winner 16", Status: "Upcoming", Winner: "", Date: "08-08-2026 - 02:00 PM", Category: "Men's Doubles", Score: "", Active: true },
    { "Match Name": "Finals", "Team A": "TBD", "Team B": "TBD", Status: "Upcoming", Winner: "", Date: "15-08-2026 - 03:20 PM", Category: "Men's Doubles", Score: "", Active: true },
    { "Match Name": "Knock Out 4", "Team A": "Mithun & Nisha", "Team B": "Sahil & Sneha", Status: "Complete", Winner: "Mithun & Nisha", Date: "01-08-2026 - 01:30 PM", Category: "Mixed Doubles", Score: "21 - 7", Active: true },
    { "Match Name": "Quarter Finals 1", "Team A": "Sujeet & Vijayashree", "Team B": "Meenakshi & Niranjan", Status: "Complete", Winner: "Sujeet & Vijayashree", Date: "01-08-2026 - 05:40 PM", Category: "Mixed Doubles", Score: "21-19", Active: true },
    { "Match Name": "Finals", "Team A": "TBD", "Team B": "TBD", Status: "Upcoming", Winner: "", Date: "15-08-2026 - 02:40 PM", Category: "Mixed Doubles", Score: "", Active: true },
    { "Match Name": "Knock Out 1", "Team A": "Ananth", "Team B": "Sajith", Status: "Complete", Winner: "Sajith", Date: "01-08-2026 - 03:00 PM", Category: "Men's Singles", Score: "21-16", Active: true },
    { "Match Name": "Quarter Finals 1", "Team A": "Sajith", "Team B": "Harikrishnan", Status: "Complete", Winner: "Harikrishnan", Date: "08-08-2026 - 02:40 PM", Category: "Men's Singles", Score: "21-11", Active: true },
    { "Match Name": "Finals", "Team A": "TBD", "Team B": "TBD", Status: "Upcoming", Winner: "", Date: "15-08-2026 - 05:30 PM", Category: "Men's Singles", Score: "", Active: true },
  ];

  const categories = useMemo(() => {
    return Array.from(new Set(displayFixtures.map(f => f.Category || "General"))).sort();
  }, [displayFixtures]);

  const [activeTab, setActiveTab] = useState<string>("all");

  /* ── all-matches: completed first, grouped by category ─── */
  const byCategory = useMemo(() => {
    // Split into completed/live and upcoming
    const completed = displayFixtures.filter(f => isCompleted(f.Status) || isLive(f.Status));
    const upcoming = displayFixtures.filter(f => !isCompleted(f.Status) && !isLive(f.Status));

    // Group each by category
    const group = (arr: BadmintonFixture[]) => {
      const g: Record<string, BadmintonFixture[]> = {};
      arr.forEach(f => {
        const cat = f.Category || "General";
        if (!g[cat]) g[cat] = [];
        g[cat].push(f);
      });
      return g;
    };

    return { completed: group(completed), upcoming: group(upcoming) };
  }, [displayFixtures]);

  /* ── bracket data for selected category ─── */
  const rounds = useMemo(() => {
    if (activeTab === "all") return [];
    return buildRounds(displayFixtures.filter(f => (f.Category || "General") === activeTab));
  }, [displayFixtures, activeTab]);

  const champion = useMemo(() => {
    if (activeTab === "all" || rounds.length === 0) return null;
    const final = rounds[rounds.length - 1]?.matches[0];
    return final && isCompleted(final.Status) ? (final.Winner || "").trim() : null;
  }, [rounds, activeTab]);

  return (
    <div className="w-full flex flex-col items-center pb-8">

      {!hasData && (
        <p className="text-xs text-gray-400 mb-4">Sample data — connect your Google Sheet to go live</p>
      )}

      {/* ─── Tab bar ─── */}
      <div className="w-full max-w-3xl flex gap-2 overflow-x-auto pb-2 mb-6 px-4 no-scrollbar">
        <button
          onClick={() => setActiveTab("all")}
          className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-all ${
            activeTab === "all"
              ? "bg-[var(--color-onam-orange)] text-white border-transparent shadow-sm"
              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
          }`}
        >
          All Matches
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-all ${
              activeTab === cat
                ? "bg-[var(--color-onam-orange)] text-white border-transparent shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ─── Rules link ─── */}
      {rulesUrl && (
        <div className="mb-6 text-center">
          <a href={rulesUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#7a5c00] bg-[#fffaf0] border border-[#f5e6cc] px-4 py-2 rounded-full hover:bg-amber-100 transition-colors">
            📖 Official Rules & Regulations
          </a>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          ALL MATCHES — completed first, by category
          ════════════════════════════════════════════════ */}
      {activeTab === "all" && (
        <div className="w-full max-w-2xl px-4 flex flex-col gap-6">
          {/* Completed / Live results */}
          {Object.keys(byCategory.completed).length > 0 && (
            <>
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-emerald-200" />
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-600">✓ Results</span>
                <div className="h-px flex-1 bg-emerald-200" />
              </div>
              {Object.entries(byCategory.completed).sort(([a],[b]) => a.localeCompare(b)).map(([cat, matches]) => (
                <MatchGroup key={`done-${cat}`} label={cat} matches={matches} />
              ))}
            </>
          )}

          {/* Upcoming */}
          {Object.keys(byCategory.upcoming).length > 0 && (
            <>
              <div className="flex items-center gap-3 mt-2">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400">Upcoming</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>
              {Object.entries(byCategory.upcoming).sort(([a],[b]) => a.localeCompare(b)).map(([cat, matches]) => (
                <MatchGroup key={`up-${cat}`} label={cat} matches={matches} />
              ))}
            </>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════
          CATEGORY — tournament bracket
          ════════════════════════════════════════════════ */}
      {activeTab !== "all" && (
        <div className="w-full flex flex-col items-center">
          {/* Champion banner */}
          {champion && (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-[#fffaf0] border-2 border-[#d4af37] rounded-2xl px-8 py-5 shadow-lg text-center mb-8">
              <span className="text-4xl">🏆</span>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Champion</p>
              <p className="text-2xl font-black text-[#d4af37]">{champion}</p>
            </motion.div>
          )}

          {/* Bracket — horizontally scrollable */}
          <div className="w-full overflow-x-auto pb-6 px-4">
            <div className="inline-flex items-start gap-8 min-w-max py-4">
              {rounds.map((round, rIdx) => (
                <div key={rIdx} className="flex flex-col shrink-0 gap-2"
                  style={{ minWidth: round.matches.length > 0 ? undefined : "200px" }}>
                  {/* Round header */}
                  <div className="text-center text-[11px] font-extrabold uppercase tracking-wider text-white py-2 rounded-lg shadow-xs"
                    style={{ backgroundColor: round.color }}>
                    {round.label}
                  </div>

                  {/* Cards in this round, vertically spaced to align with next round */}
                  <div className="flex flex-col justify-around flex-1 gap-4 pt-2"
                    style={{ minHeight: round.matches.length > 1 ? `${round.matches.length * 90}px` : "90px" }}>
                    {round.matches.map((m, mIdx) => (
                      <motion.div key={mIdx}
                        initial={{ opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: rIdx * 0.1 + mIdx * 0.05 }}
                      >
                        <BracketCard match={m} color={round.color} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}` }} />
    </div>
  );
}
