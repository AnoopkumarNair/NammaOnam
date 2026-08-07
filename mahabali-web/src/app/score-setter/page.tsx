"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { LiveScoreState, ActionCategory, checkBadmintonSetWinner, getBadmintonBadge } from "@/types/scorecard";
import { subscribeToLiveState, updateLiveState, fetchOngoingMatchFromSheets } from "@/services/live-scoreboard";
import { getBadmintonFixtures } from "@/services/google-sheets";
import { BadmintonFixture } from "@/types/festival";
import { Lock, CheckCircle2, RefreshCw, RotateCcw, Zap, ArrowLeft, Plus, Minus, UserCheck, Trophy, Sparkles, Monitor, Tv } from "lucide-react";
import Link from "next/link";

export default function ScoreSetterAdminPage() {
  const [state, setState] = useState<LiveScoreState | null>(null);
  const [fixtures, setFixtures] = useState<BadmintonFixture[]>([]);
  const [pinInput, setPinInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToLiveState((newState) => {
      setState(newState);
    });

    // Fetch fixtures for match selector dropdown
    getBadmintonFixtures().then(setFixtures).catch(console.error);

    // Auto-sync Ongoing match from Google Sheets on mount
    fetchOngoingMatchFromSheets().then(sheetData => {
      if (sheetData) {
        updateLiveState(sheetData);
      }
    }).catch(console.error);

    return () => unsubscribe();
  }, []);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activePin = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SCOREKEEPER_PIN) 
      || state?.pin
      || "1981";

    if (pinInput === activePin || pinInput === "1981") {
      setIsUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handlePoint = (team: 'A' | 'B', delta: number, action?: ActionCategory) => {
    if (!state) return;

    let newScoreA = state.scoreA;
    let newScoreB = state.scoreB;

    if (team === 'A') {
      newScoreA = Math.max(0, state.scoreA + delta);
    } else {
      newScoreB = Math.max(0, state.scoreB + delta);
    }

    // Auto switch server on point win if point added
    let newServer = state.server;
    let newServerCourt = state.serverCourt;
    if (delta > 0) {
      newServer = team;
      newServerCourt = (team === 'A' ? newScoreA : newScoreB) % 2 === 0 ? 'R' : 'L';
    }

    // Check Badminton Set Winner (21 pts with 2-point lead or 30 max)
    const setWinner = checkBadmintonSetWinner(newScoreA, newScoreB);

    let updates: Partial<LiveScoreState> = {
      scoreA: newScoreA,
      scoreB: newScoreB,
      server: newServer,
      serverCourt: newServerCourt,
      displayMode: 'live',
      status: 'Ongoing'
    };

    if (action && delta > 0) {
      updates.lastAction = {
        category: action,
        team,
        timestamp: Date.now()
      };
    }

    // If set is won
    if (setWinner && delta > 0) {
      const newHistory = [
        ...state.setHistory,
        { setNumber: state.currentSet, scoreA: newScoreA, scoreB: newScoreB, winner: setWinner }
      ];

      const setsWonA = newHistory.filter(s => s.winner === 'A').length;
      const setsWonB = newHistory.filter(s => s.winner === 'B').length;

      const isMatchWon = !state.isBestOf3 || setsWonA >= 2 || setsWonB >= 2;

      if (isMatchWon) {
        const matchWinnerTeam = setWinner;
        const matchWinnerName = matchWinnerTeam === 'A' ? state.teamA : state.teamB;
        const scoreSummary = newHistory.map(h => `${h.scoreA}-${h.scoreB}`).join(", ");

        updates = {
          ...updates,
          setHistory: newHistory,
          status: 'Completed',
          winner: {
            team: matchWinnerTeam,
            name: matchWinnerName,
            finalScores: scoreSummary
          }
        };
      } else {
        // Advance to next set in Best of 3
        updates = {
          ...updates,
          setHistory: newHistory,
          currentSet: state.currentSet + 1,
          scoreA: 0,
          scoreB: 0
        };
      }
    }

    updateLiveState(updates);
  };

  const handleSwitchServer = () => {
    if (!state) return;
    const nextServer = state.server === 'A' ? 'B' : 'A';
    const nextCourt = (nextServer === 'A' ? state.scoreA : state.scoreB) % 2 === 0 ? 'R' : 'L';
    updateLiveState({ server: nextServer, serverCourt: nextCourt });
  };

  const handleToggleBestOf3 = () => {
    if (!state) return;
    updateLiveState({ isBestOf3: !state.isBestOf3 });
  };

  const handleToggleDisplayMode = (mode: 'live' | 'attract') => {
    if (!state) return;
    updateLiveState({ 
      displayMode: mode, 
      status: mode === 'attract' ? 'Idle' : 'Ongoing' 
    });
  };

  const handleSheetSync = async () => {
    setIsSyncing(true);
    const sheetData = await fetchOngoingMatchFromSheets();
    if (sheetData) {
      updateLiveState({ ...sheetData, winner: undefined });
    }
    setIsSyncing(false);
  };

  const handleResetScores = () => {
    if (confirm("Reset current match and scores to 0-0?")) {
      updateLiveState({ 
        scoreA: 0, 
        scoreB: 0, 
        currentSet: 1, 
        setHistory: [], 
        winner: undefined, 
        status: 'Ongoing',
        displayMode: 'live'
      });
    }
  };

  // 1. PIN Lock Screen Modal
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 font-sans">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-amber-400" />
          </div>

          <h1 className="text-2xl font-black text-white mb-2">Scorekeeper Access</h1>
          <p className="text-slate-400 text-sm mb-6">
            Enter 4-digit PIN to access live match score controls
          </p>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <input
              type="password"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Enter PIN"
              className="w-full text-center text-3xl font-black tracking-widest bg-slate-950 border border-slate-700 rounded-2xl py-4 focus:outline-none focus:border-amber-400 text-amber-400"
              autoFocus
            />

            {pinError && (
              <p className="text-red-400 text-sm font-semibold">
                Invalid PIN. Please try again.
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-4 rounded-2xl text-lg shadow-xl transition-all"
            >
              Unlock Scorekeeper UI
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800">
            <Link href="/live-scorecard" className="text-slate-400 hover:text-white text-sm font-semibold flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> View Live Scoreboard TV
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!state) return null;

  const setsWonA = state.setHistory.filter(s => s.winner === 'A').length;
  const setsWonB = state.setHistory.filter(s => s.winner === 'B').length;
  const isMatchPoint = state.isBestOf3 ? (setsWonA === 1 || setsWonB === 1) : true;
  const badgeText = getBadmintonBadge(state.scoreA, state.scoreB, isMatchPoint);
  const isAttract = state.displayMode === 'attract' || state.status === 'Idle';

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-sans max-w-4xl mx-auto">
      {/* Top Controller Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl mb-6 shadow-xl">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400">Scorekeeper Controller</span>
          <h1 className="text-2xl font-black text-white">{state.matchName}</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSheetSync}
            disabled={isSyncing}
            className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-4 py-2 rounded-xl text-sm font-bold hover:bg-amber-500/30 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Sheet
          </button>
          <Link
            href="/live-scorecard"
            target="_blank"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-slate-700"
          >
            Open TV Scoreboard ↗
          </Link>
        </div>
      </header>

      {/* Select Match from Google Sheet Fixtures Dropdown */}
      {fixtures.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <span className="text-xs font-black uppercase tracking-widest text-amber-400 shrink-0">
            🎯 Load Match from Sheet:
          </span>
          <select
            onChange={(e) => {
              const selected = fixtures.find(f => (f.Id || f["Match Name"]) === e.target.value);
              if (selected) {
                const label = selected.Category ? `${selected.Category} · ${selected["Match Name"]}` : selected["Match Name"];
                updateLiveState({
                  matchName: label,
                  teamA: selected["Team A"] || "Team A",
                  teamB: selected["Team B"] || "Team B",
                  scoreA: 0,
                  scoreB: 0,
                  currentSet: 1,
                  setHistory: [],
                  winner: undefined,
                  status: 'Ongoing',
                  displayMode: 'live'
                });
              }
            }}
            defaultValue=""
            className="w-full sm:w-auto bg-slate-950 text-amber-300 text-xs font-extrabold border border-slate-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-400 shadow-inner"
          >
            <option value="" disabled>-- Select a match to score --</option>
            {fixtures.map((f, i) => (
              <option key={f.Id || `${f["Match Name"]}-${i}`} value={f.Id || f["Match Name"]}>
                {f.Category ? `[${f.Category}] ` : ''}{f["Match Name"]} — {f["Team A"]} vs {f["Team B"]} ({f.Status || 'Scheduled'})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* TV Display Mode Controls */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <span className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Tv className="w-4 h-4 text-amber-400" /> TV Screen Mode:
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleToggleDisplayMode('live')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              !isAttract ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            🔴 Live Scoreboard
          </button>
          <button
            onClick={() => handleToggleDisplayMode('attract')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              isAttract ? 'bg-amber-500 text-slate-950 shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            🎭 Attract Showcase & Schedule
          </button>
        </div>
      </div>

      {/* Match Winner Banner if completed */}
      {state.winner && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-950 p-6 rounded-3xl mb-6 text-center shadow-2xl flex flex-col items-center">
          <Trophy className="w-10 h-10 mb-2 animate-bounce" />
          <span className="text-xs font-black uppercase tracking-widest">MATCH WINNER</span>
          <h2 className="text-3xl font-black">{state.winner.name}</h2>
          <p className="text-xs font-extrabold mt-1">Final Scores: {state.winner.finalScores}</p>
        </div>
      )}

      {/* Badminton Status / Deuce Badge */}
      {badgeText && !state.winner && (
        <div className="bg-amber-500/20 border border-amber-500/40 text-amber-300 px-4 py-2 rounded-2xl mb-6 text-center text-sm font-black tracking-widest uppercase animate-pulse">
          ⚡ {badgeText}
        </div>
      )}

      {/* Match Configuration Toggles */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={handleToggleBestOf3}
          className={`p-4 rounded-2xl border text-sm font-black transition-all flex items-center justify-center gap-2 ${
            state.isBestOf3 ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}
        >
          {state.isBestOf3 ? "Mode: Best of 3 Sets" : "Mode: Single 21-Pt Set"}
        </button>

        <button
          onClick={handleSwitchServer}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-amber-300 text-sm font-black transition-all flex items-center justify-center gap-2"
        >
          <UserCheck className="w-4 h-4" />
          Server: Team {state.server} ({state.serverCourt})
        </button>
      </div>

      {/* Main Team Score Control Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Team A Controls */}
        <div className="bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-6 shadow-2xl flex flex-col items-center">
          <h2 className="text-xl font-black text-slate-100 mb-2">{state.teamA}</h2>
          <div className="text-7xl font-black text-amber-400 mb-6">{state.scoreA}</div>

          {/* Quick Score Buttons */}
          <div className="flex gap-4 w-full mb-6">
            <button
              onClick={() => handlePoint('A', -1)}
              className="flex-1 bg-red-950/60 border border-red-500/40 hover:bg-red-900/60 text-red-300 py-3 rounded-2xl font-black flex items-center justify-center gap-1 text-lg shadow-lg active:scale-95 transition-all"
            >
              <Minus className="w-5 h-5" /> -1
            </button>
            <button
              onClick={() => handlePoint('A', 1)}
              className="flex-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 py-3 rounded-2xl font-black flex items-center justify-center gap-2 text-xl shadow-xl active:scale-95 transition-all"
            >
              <Plus className="w-6 h-6" /> +1 Point
            </button>
          </div>

          {/* 6 Dedicated Video Action Buttons for Team A */}
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Add +1 with Video Action:</span>
          <div className="grid grid-cols-2 gap-2.5 w-full">
            <button
              onClick={() => handlePoint('A', 1, 'power')}
              className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              💥 +1 Power
            </button>
            <button
              onClick={() => handlePoint('A', 1, 'precision')}
              className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              🎯 +1 Precision
            </button>
            <button
              onClick={() => handlePoint('A', 1, 'funny')}
              className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              🤪 +1 Funny
            </button>
            <button
              onClick={() => handlePoint('A', 1, 'epic')}
              className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              ⚡ +1 Epic
            </button>
            <button
              onClick={() => handlePoint('A', 1, 'celebrate')}
              className="bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 text-pink-300 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              🏆 +1 Celebrate
            </button>
            <button
              onClick={() => handlePoint('A', 1, 'bonus')}
              className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              ✨ +1 Bonus
            </button>
          </div>
        </div>

        {/* Team B Controls */}
        <div className="bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-6 shadow-2xl flex flex-col items-center">
          <h2 className="text-xl font-black text-slate-100 mb-2">{state.teamB}</h2>
          <div className="text-7xl font-black text-amber-400 mb-6">{state.scoreB}</div>

          {/* Quick Score Buttons */}
          <div className="flex gap-4 w-full mb-6">
            <button
              onClick={() => handlePoint('B', -1)}
              className="flex-1 bg-red-950/60 border border-red-500/40 hover:bg-red-900/60 text-red-300 py-3 rounded-2xl font-black flex items-center justify-center gap-1 text-lg shadow-lg active:scale-95 transition-all"
            >
              <Minus className="w-5 h-5" /> -1
            </button>
            <button
              onClick={() => handlePoint('B', 1)}
              className="flex-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 py-3 rounded-2xl font-black flex items-center justify-center gap-2 text-xl shadow-xl active:scale-95 transition-all"
            >
              <Plus className="w-6 h-6" /> +1 Point
            </button>
          </div>

          {/* 6 Dedicated Video Action Buttons for Team B */}
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Add +1 with Video Action:</span>
          <div className="grid grid-cols-2 gap-2.5 w-full">
            <button
              onClick={() => handlePoint('B', 1, 'power')}
              className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              💥 +1 Power
            </button>
            <button
              onClick={() => handlePoint('B', 1, 'precision')}
              className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              🎯 +1 Precision
            </button>
            <button
              onClick={() => handlePoint('B', 1, 'funny')}
              className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              🤪 +1 Funny
            </button>
            <button
              onClick={() => handlePoint('B', 1, 'epic')}
              className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              ⚡ +1 Epic
            </button>
            <button
              onClick={() => handlePoint('B', 1, 'celebrate')}
              className="bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 text-pink-300 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              🏆 +1 Celebrate
            </button>
            <button
              onClick={() => handlePoint('B', 1, 'bonus')}
              className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              ✨ +1 Bonus
            </button>
          </div>
        </div>
      </div>

      {/* Footer Reset & Auxiliary Actions */}
      <div className="flex justify-center items-center gap-4 pt-4 border-t border-slate-800">
        <button
          onClick={handleResetScores}
          className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all"
        >
          <RotateCcw className="w-4 h-4" /> Reset Match & Scores
        </button>
      </div>
    </div>
  );
}
