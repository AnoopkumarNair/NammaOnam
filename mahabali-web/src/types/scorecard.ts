export type ActionCategory = 'power' | 'precision' | 'funny' | 'epic' | 'celebrate' | 'bonus' | 'smash' | 'out' | 'placement' | 'rally' | 'ace';
export type ScoreboardDisplayMode = 'live' | 'attract' | 'upcoming' | 'sponsors';

export interface ActionClip {
  id: string;
  category: ActionCategory;
  title: string;
  url: string;
}

export interface SetScore {
  setNumber: number;
  scoreA: number;
  scoreB: number;
  winner: 'A' | 'B';
}

export interface LiveScoreState {
  matchName: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  currentSet: number;
  setHistory: SetScore[];
  isBestOf3: boolean;
  server: 'A' | 'B';
  serverCourt: 'L' | 'R';
  muted: boolean;
  pin: string;
  displayMode: ScoreboardDisplayMode;
  lastAction?: {
    category: ActionCategory;
    team: 'A' | 'B';
    timestamp: number;
    clipUrl?: string;
  };
  winner?: {
    team: 'A' | 'B';
    name: string;
    finalScores: string;
  };
  status: 'Ongoing' | 'Completed' | 'Upcoming' | 'Idle';
  updatedAt: number;
}

export const DEFAULT_LIVE_STATE: LiveScoreState = {
  matchName: "Quarter Final 1",
  teamA: "Block A Strikers",
  teamB: "Block C Smashers",
  scoreA: 0,
  scoreB: 0,
  currentSet: 1,
  setHistory: [],
  isBestOf3: false,
  server: 'A',
  serverCourt: 'R',
  muted: false,
  pin: typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SCOREKEEPER_PIN ? process.env.NEXT_PUBLIC_SCOREKEEPER_PIN : "1981",
  displayMode: 'live',
  status: "Ongoing",
  updatedAt: Date.now()
};

export function checkBadmintonSetWinner(scoreA: number, scoreB: number): 'A' | 'B' | null {
  if (scoreA >= 30) return 'A';
  if (scoreB >= 30) return 'B';

  if (scoreA >= 21 && scoreA - scoreB >= 2) return 'A';
  if (scoreB >= 21 && scoreB - scoreA >= 2) return 'B';

  return null;
}

export function getBadmintonBadge(scoreA: number, scoreB: number, isMatchPoint: boolean): string | null {
  if (scoreA >= 20 && scoreB >= 20) {
    if (scoreA === scoreB) return "DEUCE (20-ALL)";
    if (scoreA === scoreB + 1) return isMatchPoint ? "MATCH POINT TEAM A" : "SET POINT TEAM A";
    if (scoreB === scoreA + 1) return isMatchPoint ? "MATCH POINT TEAM B" : "SET POINT TEAM B";
  }
  if (scoreA >= 20 && scoreA > scoreB) return isMatchPoint ? "MATCH POINT TEAM A" : "SET POINT TEAM A";
  if (scoreB >= 20 && scoreB > scoreA) return isMatchPoint ? "MATCH POINT TEAM B" : "SET POINT TEAM B";
  return null;
}
