"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useRef } from "react";
import { LiveScoreState, ActionCategory, getBadmintonBadge } from "@/types/scorecard";
import { subscribeToLiveState, updateLiveState, fetchOngoingMatchFromSheets } from "@/services/live-scoreboard";
import { getRandomClipForCategory, preloadVideoClips, getFastVideoUrl } from "@/services/drive-video-cache";
import { getSponsors, getBadmintonFixtures } from "@/services/google-sheets";
import { Sponsor, BadmintonFixture } from "@/types/festival";
import { Volume2, VolumeX, RefreshCw, Trophy, Zap, Sparkles, ArrowLeft, Calendar, Play } from "lucide-react";
import Link from "next/link";

export default function LiveScorecardTVPage() {
  const [state, setState] = useState<LiveScoreState | null>(null);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<BadmintonFixture[]>([]);
  const [activeVideo, setActiveVideo] = useState<{ 
    url: string; 
    title: string; 
    category: string;
    pointToTeam?: string;
    teamA?: string;
    teamB?: string;
    scoreA?: number;
    scoreB?: number;
  } | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastActionTimestampRef = useRef<number>(typeof window !== 'undefined' ? Date.now() : 0);

  useEffect(() => {
    // Set timestamp to current time on mount so old persisted actions don't play video on load
    lastActionTimestampRef.current = Date.now();

    const unsubscribe = subscribeToLiveState((newState) => {
      setState(newState);
      setIsMuted(newState.muted);

      // Check if a new action point was triggered by Score Control
      if (newState.lastAction && newState.lastAction.timestamp > lastActionTimestampRef.current) {
        lastActionTimestampRef.current = newState.lastAction.timestamp;
        
        const clip = getRandomClipForCategory(newState.lastAction.category);
        const pointTeamName = newState.lastAction.team === 'A' ? newState.teamA : newState.teamB;

        setActiveVideo({
          url: newState.lastAction.clipUrl || clip.url,
          title: clip.title,
          category: newState.lastAction.category.toUpperCase(),
          pointToTeam: pointTeamName,
          teamA: newState.teamA,
          teamB: newState.teamB,
          scoreA: newState.scoreA,
          scoreB: newState.scoreB
        });

        // Auto dismiss video replay after 8 seconds
        setTimeout(() => {
          setActiveVideo(null);
        }, 8000);
      }
    });

    // Fetch sponsors with images for rolling marquee
    getSponsors().then(setSponsors).catch(console.error);

    // Fetch upcoming fixtures
    getBadmintonFixtures().then(fixtures => {
      const upcoming = fixtures.filter(f => String(f.Status || "").trim().toLowerCase() !== "completed");
      setUpcomingMatches(upcoming);
    }).catch(console.error);

    // Auto-fetch Ongoing match from Google Sheets on mount
    fetchOngoingMatchFromSheets().then(sheetData => {
      if (sheetData) {
        updateLiveState(sheetData);
      }
    }).catch(console.error);

    // Preload video clips for offline Fire TV playback
    preloadVideoClips().catch(console.error);

    return () => unsubscribe();
  }, []);

  // Auto-dismiss action video after 7 seconds
  useEffect(() => {
    if (activeVideo) {
      const timer = setTimeout(() => {
        setActiveVideo(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [activeVideo]);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    updateLiveState({ muted: newMuted });
  };

  const handleSheetSync = async () => {
    setIsSyncing(true);
    const ongoingData = await fetchOngoingMatchFromSheets();
    if (ongoingData) {
      updateLiveState(ongoingData);
    }
    setIsSyncing(false);
  };

  if (!state) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="animate-spin text-amber-400">
          <RefreshCw className="w-10 h-10" />
        </div>
      </div>
    );
  }

  const isAttractMode = state.displayMode === 'attract' || state.status === 'Idle';
  const setsWonA = state.setHistory.filter(s => s.winner === 'A').length;
  const setsWonB = state.setHistory.filter(s => s.winner === 'B').length;
  const isMatchPoint = state.isBestOf3 ? (setsWonA === 1 || setsWonB === 1) : true;
  const badgeText = getBadmintonBadge(state.scoreA, state.scoreB, isMatchPoint);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between overflow-hidden relative font-sans">
      {/* Top Header Bar */}
      <header className="bg-slate-900/90 border-b border-amber-500/30 px-6 py-4 flex items-center justify-between shadow-2xl z-10 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-all">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className={`inline-block w-3 h-3 rounded-full ${isAttractMode ? 'bg-amber-400' : 'bg-red-500 animate-ping'}`} />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                {isAttractMode ? "Tournament Showcase" : "Live Broadcast"}
              </span>
            </div>
            <h1 className="text-2xl font-black text-amber-400 tracking-tight flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" />
              {isAttractMode ? "GR Sitara Badminton Championship" : state.matchName}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleSheetSync}
            disabled={isSyncing}
            className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Sheet Match
          </button>

          <button
            onClick={toggleMute}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-semibold transition-all border border-slate-700"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
            {isMuted ? "TV Muted" : "TV Audio On"}
          </button>
        </div>
      </header>

      {/* Main Display Section: ATTRACT MODE vs LIVE SCOREBOARD */}
      {isAttractMode ? (
        /* 🎭 ATTRACT / SLIDESHOW IDLE SHOWCASE MODE */
        <main className="flex-1 flex flex-col justify-center px-8 py-6 z-0 max-w-7xl mx-auto w-full">
          {/* Hero Attract Banner */}
          <div className="bg-gradient-to-r from-indigo-900/60 via-slate-900 to-amber-950/60 border-2 border-amber-500/40 rounded-3xl p-8 mb-8 text-center shadow-2xl relative overflow-hidden flex flex-col items-center">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 animate-pulse" />
            <Sparkles className="w-12 h-12 text-amber-400 mb-3 animate-bounce" />
            <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black px-4 py-1 rounded-full text-xs uppercase tracking-widest mb-2">
              🎾 NEXT MATCH STARTING SOON 🎾
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
              GR Sitara Badminton Tournament
            </h2>
            <p className="text-slate-300 text-base max-w-2xl font-semibold">
              Get ready for exciting smashes, trick shots, and championship action! Check upcoming matches below.
            </p>
          </div>

          {/* Upcoming Matches Schedule Grid */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-black text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" /> Upcoming Matches Schedule
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingMatches.length > 0 ? (
                upcomingMatches.slice(0, 6).map((match, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-md hover:border-amber-500/50 transition-all">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
                      <span className="text-amber-400">{match["Match Name"]}</span>
                      {match.Category && <span className="bg-slate-800 px-2 py-0.5 rounded-md text-slate-300">{match.Category}</span>}
                    </div>
                    <div className="text-base font-black text-white flex items-center justify-between gap-2 my-1">
                      <span className="truncate">{match["Team A"]}</span>
                      <span className="text-amber-400 text-xs italic">vs</span>
                      <span className="truncate">{match["Team B"]}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
                      <span>{match.Date || "Scheduled"}</span>
                      <span className="text-emerald-400 font-bold uppercase text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Up Next</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center text-slate-400 py-6 text-sm font-semibold">
                  All scheduled matches completed! Thank you for participating.
                </div>
              )}
            </div>
          </div>
        </main>
      ) : (
        /* 🔴 LIVE SCOREBOARD DISPLAY */
        <main className="flex-1 flex flex-col justify-center px-8 py-6 z-0">
          {/* Match Format, Set & Deuce/Advantage Badge */}
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="flex justify-center items-center gap-4">
              <span className="px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-sm font-semibold uppercase tracking-widest">
                {state.isBestOf3 ? "Best of 3 Sets" : "Single Set (21 Pts)"}
              </span>
              <span className="px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-sm font-bold uppercase tracking-widest">
                Set {state.currentSet}
              </span>
            </div>

            {/* Badminton Dynamic Badge (DEUCE / ADVANTAGE / SET POINT / MATCH POINT) */}
            {badgeText && !state.winner && (
              <div className="bg-gradient-to-r from-red-600 via-amber-500 to-red-600 text-slate-950 font-black px-6 py-2 rounded-full text-base tracking-widest uppercase shadow-xl animate-pulse flex items-center gap-2">
                <Zap className="w-5 h-5 fill-slate-950" />
                {badgeText}
                <Zap className="w-5 h-5 fill-slate-950" />
              </div>
            )}
          </div>

          {/* Big Teams Score Grid */}
          <div className="grid grid-cols-11 gap-6 items-center max-w-7xl mx-auto w-full">
            {/* Team A Card */}
            <div className={`col-span-5 rounded-3xl p-8 border-2 shadow-2xl transition-all duration-300 flex flex-col items-center relative overflow-hidden ${
              state.server === 'A' 
                ? 'bg-gradient-to-br from-indigo-900/60 via-slate-900 to-indigo-950/80 border-indigo-500 shadow-indigo-500/20' 
                : 'bg-slate-900/60 border-slate-800'
            }`}>
              {/* Serving Indicator */}
              {state.server === 'A' && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-indigo-500/30 border border-indigo-400/50 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                  <span>🏸 Serving ({state.serverCourt})</span>
                </div>
              )}

              <h2 className="text-3xl font-extrabold text-slate-100 mb-4 text-center line-clamp-1">
                {state.teamA}
              </h2>

              <div className="relative my-2">
                <span className={`text-8xl md:text-9xl font-black tracking-tight ${
                  state.scoreA >= 20 ? 'text-amber-400 animate-bounce' : 'text-white'
                }`}>
                  {state.scoreA}
                </span>
              </div>
            </div>

            {/* VS Divider */}
            <div className="col-span-1 flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-slate-900 border-2 border-amber-500/40 flex items-center justify-center shadow-xl">
                <span className="text-amber-400 font-black italic text-xl">VS</span>
              </div>
            </div>

            {/* Team B Card */}
            <div className={`col-span-5 rounded-3xl p-8 border-2 shadow-2xl transition-all duration-300 flex flex-col items-center relative overflow-hidden ${
              state.server === 'B' 
                ? 'bg-gradient-to-br from-indigo-900/60 via-slate-900 to-indigo-950/80 border-indigo-500 shadow-indigo-500/20' 
                : 'bg-slate-900/60 border-slate-800'
            }`}>
              {/* Serving Indicator */}
              {state.server === 'B' && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-indigo-500/30 border border-indigo-400/50 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                  <span>🏸 Serving ({state.serverCourt})</span>
                </div>
              )}

              <h2 className="text-3xl font-extrabold text-slate-100 mb-4 text-center line-clamp-1">
                {state.teamB}
              </h2>

              <div className="relative my-2">
                <span className={`text-8xl md:text-9xl font-black tracking-tight ${
                  state.scoreB >= 20 ? 'text-amber-400 animate-bounce' : 'text-white'
                }`}>
                  {state.scoreB}
                </span>
              </div>
            </div>
          </div>

          {/* Set History Cards */}
          {state.setHistory && state.setHistory.length > 0 && (
            <div className="flex justify-center items-center gap-6 mt-8">
              {state.setHistory.map((s, idx) => (
                <div key={`set-${s.setNumber}-${idx}`} className="bg-slate-900/80 border border-slate-800 px-6 py-2.5 rounded-2xl flex items-center gap-4 shadow-lg">
                  <span className="text-xs font-bold uppercase text-slate-400">Set {s.setNumber}:</span>
                  <span className="text-lg font-black text-amber-400">{s.scoreA} - {s.scoreB}</span>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* Match Victory Celebration Overlay */}
      {state.winner && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-500">
          <div className="bg-gradient-to-b from-amber-500/20 via-slate-900 to-slate-950 border-4 border-amber-400 rounded-3xl p-12 max-w-3xl w-full text-center shadow-2xl relative overflow-hidden flex flex-col items-center">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 animate-pulse" />
            <Trophy className="w-24 h-24 text-amber-400 mb-6 animate-bounce drop-shadow-[0_10px_20px_rgba(245,158,11,0.5)]" />
            <span className="bg-amber-500 text-slate-950 font-black px-6 py-2 rounded-full text-sm uppercase tracking-widest shadow-xl mb-4">
              🏆 MATCH CHAMPION 🏆
            </span>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
              {state.winner.name}
            </h1>
            <p className="text-lg font-extrabold text-amber-400 mb-8">
              Final Match Score: {state.winner.finalScores}
            </p>
            <button
              onClick={() => updateLiveState({ winner: undefined, status: 'Ongoing', displayMode: 'live', scoreA: 0, scoreB: 0, currentSet: 1, setHistory: [] })}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-8 py-3 rounded-2xl font-black text-sm border border-slate-700 transition-all"
            >
              Start New Match
            </button>
          </div>
        </div>
      )}

      {/* 📺 Full-Screen TV Broadcast Instant Replay Overlay */}
      {activeVideo && !state?.winner && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center animate-in fade-in duration-300 overflow-hidden">
          <div className="relative w-full h-full flex flex-col justify-between">
            
            {/* 🔴 Top Broadcast Header Bar */}
            <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/90 via-black/50 to-transparent p-6 z-20 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-2 bg-red-600 text-white font-black px-4 py-1.5 rounded-full text-xs md:text-sm tracking-widest uppercase shadow-xl animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                  🔴 LIVE REPLAY
                </span>
                <span className="bg-amber-500 text-slate-950 font-black px-4 py-1.5 rounded-full text-xs md:text-sm tracking-widest uppercase shadow-xl flex items-center gap-1.5">
                  <Zap className="w-4 h-4 fill-slate-950" />
                  {activeVideo.category}
                </span>
              </div>
              <span className="text-white/90 font-bold text-sm md:text-base drop-shadow-md hidden sm:inline">
                {activeVideo.title}
              </span>
            </div>

            {/* Instant 0ms HTML5 Video Player */}
            <video
              ref={videoRef}
              src={getFastVideoUrl(activeVideo.url)}
              autoPlay
              playsInline
              muted={isMuted}
              className="w-full h-full object-cover pointer-events-none"
              onEnded={() => setActiveVideo(null)}
            />

            {/* 🎾 Bottom TV Sports Lower-Third Overlay Graphic */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/90 to-transparent p-6 sm:p-10 z-20 flex flex-col items-center gap-3">
              {/* POINT TO RECIPIENT BANNER */}
              {activeVideo.pointToTeam && (
                <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-8 py-3 rounded-full shadow-2xl animate-bounce flex items-center gap-3 border-2 border-amber-300">
                  <Sparkles className="w-6 h-6 fill-slate-950 text-slate-950" />
                  <span className="text-sm md:text-xl font-black tracking-wider uppercase">
                    POINT TO: {activeVideo.pointToTeam}
                  </span>
                  <Sparkles className="w-6 h-6 fill-slate-950 text-slate-950" />
                </div>
              )}

              {/* LIVE SCORE TICKER */}
              {activeVideo.teamA && activeVideo.teamB && (
                <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-700/80 px-6 py-2 rounded-2xl backdrop-blur-md shadow-xl text-xs md:text-sm font-black">
                  <span className="text-slate-300">{activeVideo.teamA}</span>
                  <span className="bg-amber-500 text-slate-950 px-3 py-1 rounded-lg text-base font-black">
                    {activeVideo.scoreA ?? 0} - {activeVideo.scoreB ?? 0}
                  </span>
                  <span className="text-slate-300">{activeVideo.teamB}</span>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Rolling Sponsor Marquee Footer with Large Images */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 px-6 overflow-hidden relative">
        <div className="flex items-center gap-10 animate-marquee whitespace-nowrap">
          <span className="text-xs font-black uppercase text-amber-400 tracking-widest flex items-center gap-2 shrink-0">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Official Tournament Sponsors:
          </span>
          {sponsors.length > 0 ? (
            sponsors.concat(sponsors).map((sp, idx) => (
              <div key={idx} className="inline-flex items-center gap-4 px-5 py-2.5 rounded-2xl bg-slate-950/90 border border-slate-800 shrink-0 shadow-lg">
                {sp["Logo URL"] || sp["Image URL"] ? (
                  <img 
                    src={sp["Logo URL"] || sp["Image URL"]} 
                    alt={sp.Title} 
                    className="h-14 md:h-16 w-auto max-w-[220px] object-contain inline-block filter brightness-110" 
                  />
                ) : null}
                <span className="text-white font-black text-base md:text-lg tracking-tight">{sp.Title}</span>
              </div>
            ))
          ) : (
            <span className="text-slate-400 text-sm italic">GR Sitara Tournament 2026</span>
          )}
        </div>
      </footer>
    </div>
  );
}
