import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { LiveScoreState, DEFAULT_LIVE_STATE } from '@/types/scorecard';
import { getBadmintonFixtures } from './google-sheets';

const STORAGE_KEY = 'badminton_live_scorecard_v1';
const CHANNEL_NAME = 'badminton-live-room';

// Initialize Supabase if env variables exist
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

let localState: LiveScoreState = { ...DEFAULT_LIVE_STATE };

// Load initial state from localStorage if available in browser
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      localState = { ...DEFAULT_LIVE_STATE, ...parsed };
    }
  } catch (e) {
    console.error("Failed to load local live state:", e);
  }
}

const subscribers = new Set<(state: LiveScoreState) => void>();

function notifySubscribers() {
  subscribers.forEach(cb => cb(localState));
}

function applyStateUpdate(incoming: LiveScoreState) {
  if (!incoming || typeof incoming !== 'object') return;
  // Strictly enforce timestamp monotonicity to prevent stale race condition overwrites
  if (!incoming.updatedAt || incoming.updatedAt > localState.updatedAt) {
    localState = incoming;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(localState));
      } catch (e) {
        console.error("Failed to save local state:", e);
      }
    }
    notifySubscribers();
  }
}

let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  broadcastChannel.addEventListener('message', (event: MessageEvent) => {
    if (event.data && typeof event.data === 'object') {
      applyStateUpdate(event.data as LiveScoreState);
    }
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        applyStateUpdate(JSON.parse(e.newValue));
      } catch (err) {
        console.error(err);
      }
    }
  });
}

// Singleton Supabase Realtime Channel
let realtimeChannel: RealtimeChannel | null = null;

if (supabase && typeof window !== 'undefined') {
  realtimeChannel = supabase.channel(CHANNEL_NAME);
  realtimeChannel
    .on('broadcast', { event: 'score_update' }, ({ payload }) => {
      if (payload) {
        applyStateUpdate(payload as LiveScoreState);
      }
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log("Connected to Supabase Realtime Badminton Channel");
      }
    });
}

export function getLiveState(): LiveScoreState {
  return localState;
}

export function saveLiveState(state: LiveScoreState) {
  localState = state;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save local state:", e);
    }
    if (broadcastChannel) {
      broadcastChannel.postMessage(state);
    }
  }
  
  notifySubscribers();

  if (realtimeChannel) {
    realtimeChannel.send({
      type: 'broadcast',
      event: 'score_update',
      payload: state
    }).catch(err => console.warn("Supabase broadcast error:", err));
  }
}

export function updateLiveState(partial: Partial<LiveScoreState>): LiveScoreState {
  const updated: LiveScoreState = {
    ...localState,
    ...partial,
    updatedAt: Date.now()
  };
  saveLiveState(updated);
  return updated;
}

export function subscribeToLiveState(callback: (state: LiveScoreState) => void): () => void {
  subscribers.add(callback);
  callback(localState);

  return () => {
    subscribers.delete(callback);
  };
}

export async function fetchOngoingMatchFromSheets(): Promise<Partial<LiveScoreState> | null> {
  try {
    const fixtures = await getBadmintonFixtures();
    if (!fixtures || fixtures.length === 0) return null;

    // 1. Try to find a match explicitly marked as ONGOING / LIVE
    let target = fixtures.find(f => {
      const st = String(f.Status || "").trim().toUpperCase();
      return st === "ONGOING" || st === "LIVE" || st === "PLAYING" || st === "IN PROGRESS" || st === "IN_PROGRESS";
    });

    // 2. Fallback: Find the first UPCOMING match with valid team names
    if (!target) {
      target = fixtures.find(f => {
        const st = String(f.Status || "").trim().toUpperCase();
        const teamA = String(f["Team A"] || "").trim().toLowerCase();
        const teamB = String(f["Team B"] || "").trim().toLowerCase();
        const isUpcoming = st === "UPCOMING" || st === "SCHEDULED" || (st !== "COMPLETE" && st !== "COMPLETED");
        const validTeams = teamA !== "" && teamB !== "" && !teamA.startsWith("winner") && !teamB.startsWith("winner");
        return isUpcoming && validTeams;
      });
    }

    // 3. Ultimate Fallback: First non-completed fixture
    if (!target) {
      target = fixtures.find(f => {
        const st = String(f.Status || "").trim().toUpperCase();
        return st !== "COMPLETE" && st !== "COMPLETED";
      });
    }

    if (target) {
      const matchLabel = target.Category ? `${target.Category} · ${target["Match Name"]}` : (target["Match Name"] || "Live Match");
      return {
        matchName: matchLabel,
        teamA: target["Team A"] || "Team A",
        teamB: target["Team B"] || "Team B",
        status: "Ongoing",
        displayMode: "live"
      };
    }
  } catch (error) {
    console.error("Error fetching ongoing match from Google Sheets:", error);
  }
  return null;
}
