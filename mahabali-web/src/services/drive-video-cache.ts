import { ActionCategory, ActionClip } from "@/types/scorecard";

// Direct Google Drive direct stream URLs for all 17 uploaded Badminton Scorecard videos
const DRIVE_RAW_CLIPS: Record<string, ActionClip[]> = {
  power: [
    { id: "power-boom", category: "power", title: "💥 BOOM! Thunderbolt Smash", url: "https://drive.google.com/file/d/1HMOaE_Uv6vok1-zt-3jEHAlEhef5zzrT/preview?autoplay=1" },
    { id: "power-power", category: "power", title: "💥 Maximum Power Attack", url: "https://drive.google.com/file/d/1ajLNPS2xgMouJY25znFEujzC84O5v0Do/preview?autoplay=1" },
    { id: "power-unstoppable", category: "power", title: "💥 Unstoppable Hammer Smash", url: "https://drive.google.com/file/d/1zPesbHFVffuPzxTA3iqRmzbroI_hu8Iz/preview?autoplay=1" },
  ],
  precision: [
    { id: "precision-pinpoint", category: "precision", title: "🎯 Pinpoint Drop Shot", url: "https://drive.google.com/file/d/1K0MzoqtMLW5oxlN0aoeDbDVJOJiYV3Mn/preview?autoplay=1" },
    { id: "precision-perfect", category: "precision", title: "🎯 Picture Perfect Corner Placement", url: "https://drive.google.com/file/d/1m0aIuWJd0dAfhcv3DoFBZIH9q7m-GZ4c/preview?autoplay=1" },
    { id: "precision-bullseye", category: "precision", title: "🎯 Bullseye Hairpin Net Drop", url: "https://drive.google.com/file/d/1dl5zBBSLVL6iCPciasPuh-06fSIPWgzi/preview?autoplay=1" },
  ],
  funny: [
    { id: "funny-surprise", category: "funny", title: "🤪 Surprising Out-of-Bounds!", url: "https://drive.google.com/file/d/12UImeouJ2eXd1JX0dHbBz0t7GFZOY5eR/preview?autoplay=1" },
    { id: "funny-whoa", category: "funny", title: "🤪 Whoa! Wild Mishit", url: "https://drive.google.com/file/d/1YRkKniWSumJsKq7aOOQfRA2A2XLo0BE4/preview?autoplay=1" },
    { id: "funny-boing", category: "funny", title: "🤪 Boing! Net Clip Wobble", url: "https://drive.google.com/file/d/1DV91naue3pKivI3Aa8ZRPdo6ebUCVNiv/preview?autoplay=1" },
  ],
  epic: [
    { id: "epic-legendary", category: "epic", title: "⚡ Legendary Rally exchange!", url: "https://drive.google.com/file/d/1cHZudasr4Jk4maSwgU1Pzzn-GvvIWO4f/preview?autoplay=1" },
    { id: "epic-toofast", category: "epic", title: "⚡ Lightning Fast Reflexes", url: "https://drive.google.com/file/d/1zTq11pKIGN5Z1aQXeZAsPQ7uvhHCxuTU/preview?autoplay=1" },
    { id: "epic-epic", category: "epic", title: "⚡ Epic Marathon Rally!", url: "https://drive.google.com/file/d/1-VGIoGrU88IY-6AqqYtPuK_95V2fhjaA/preview?autoplay=1" },
  ],
  celebrate: [
    { id: "celebrate-glorious", category: "celebrate", title: "🏆 Glorious Winner Point!", url: "https://drive.google.com/file/d/11p5ru-DqaFDUezQqQwHKt2NUCpAp8r2y/preview?autoplay=1" },
    { id: "celebrate-magnificent", category: "celebrate", title: "🏆 Magnificent Point Celebration", url: "https://drive.google.com/file/d/1O_eLPNmoCorcnfyqlaZP-n6VbVP_6VcE/preview?autoplay=1" },
    { id: "celebrate-bravo", category: "celebrate", title: "🏆 Bravo! Masterclass Finish", url: "https://drive.google.com/file/d/1QPCyX1VqvW0Isl9O9sYd0SQ4wBMGVvA7/preview?autoplay=1" },
  ],
  bonus: [
    { id: "bonus-nice", category: "bonus", title: "✨ Nice Trick Shot!", url: "https://drive.google.com/file/d/1VA17psnGQboa3t2jkwtAwl1U2LA_2Tj7/preview?autoplay=1" },
    { id: "bonus-unbelievable", category: "bonus", title: "✨ Unbelievable Bonus Point!", url: "https://drive.google.com/file/d/1aiTvhuhH8Ys8FlSoxfw6Ykr047G2YJcS/preview?autoplay=1" },
  ],
};

// Aliases for legacy categories
DRIVE_RAW_CLIPS.smash = DRIVE_RAW_CLIPS.power;
DRIVE_RAW_CLIPS.out = DRIVE_RAW_CLIPS.funny;
DRIVE_RAW_CLIPS.placement = DRIVE_RAW_CLIPS.precision;
DRIVE_RAW_CLIPS.rally = DRIVE_RAW_CLIPS.epic;
DRIVE_RAW_CLIPS.ace = DRIVE_RAW_CLIPS.celebrate;

// Dynamic runtime store that gets updated if Google Drive introduces new files
let activeClipsStore: Record<string, ActionClip[]> = { ...DRIVE_RAW_CLIPS };

// Track last played video per category so no video plays twice in a row
const lastPlayedMap = new Map<string, string>();

// In-memory Blob URL store for 0ms instant local playback
const blobMap = new Map<string, string>();

/**
 * Returns instant Blob URL if cached, or direct high-speed CDN streaming URL
 */
export function getFastVideoUrl(url: string): string {
  if (!url) return "";
  
  // 1. Check if we have an in-memory blob URL ready (0ms instant playback)
  if (blobMap.has(url)) {
    return blobMap.get(url)!;
  }

  // 2. Extract Drive File ID and convert to direct high-speed CDN stream URL
  const idMatch = url.match(/[?&]id=([^&]+)/) || url.match(/\/file\/d\/([^/]+)/);
  if (idMatch && idMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
  }

  return url;
}

/**
 * Background preloader: Fetches all video MP4 files into memory Blobs & CacheStorage for 0ms instant playback
 */
export async function preloadVideoClips(): Promise<{ cachedCount: number; total: number }> {
  let cachedCount = 0;
  let total = 0;

  try {
    const scriptUrl = "https://script.google.com/macros/s/AKfycbyHWq-VhpMpP8XuS_z1GsAm1jJlfgOyWN2MHLd2ajy4kroiVo6ffLOvHwsovACJCK3N/exec";
    const res = await fetch(scriptUrl, { signal: AbortSignal.timeout(10000) }).catch(() => null);
    
    if (res && res.ok) {
      const data = await res.json().catch(() => null);
      if (data && data.files && Array.isArray(data.files)) {
        data.files.forEach((file: { name: string; id: string }) => {
          if (!file.name || !file.id || !file.name.toLowerCase().endsWith('.mp4')) return;
          
          const prefix = file.name.split('_')[0].toLowerCase();
          if (['power', 'precision', 'funny', 'epic', 'celebrate', 'bonus'].includes(prefix)) {
            if (!activeClipsStore[prefix]) activeClipsStore[prefix] = [];
            const fileUrl = `https://drive.google.com/uc?export=download&id=${file.id}`;
            const exists = activeClipsStore[prefix].some(c => c.url === fileUrl || c.id === file.id);
            
            if (!exists) {
              const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
              activeClipsStore[prefix].push({
                id: file.id,
                category: prefix as ActionCategory,
                title: cleanTitle,
                url: fileUrl
              });
            }
          }
        });
      }
    }
  } catch (err) {
    console.warn("Dynamic Drive video lookup fallback to static clips:", err);
  }

  // Preload all clips into Blob memory for instant 0ms playback
  const allClips: ActionClip[] = [];
  Object.values(activeClipsStore).forEach(list => {
    if (Array.isArray(list)) allClips.push(...list);
  });
  total = allClips.length;

  for (const clip of allClips) {
    if (!clip.url || blobMap.has(clip.url)) {
      cachedCount++;
      continue;
    }

    try {
      const cdnUrl = getFastVideoUrl(clip.url);
      const resp = await fetch(cdnUrl, { signal: AbortSignal.timeout(15000) });
      if (resp.ok) {
        const blob = await resp.blob();
        const blobUrl = URL.createObjectURL(blob);
        blobMap.set(clip.url, blobUrl);
        cachedCount++;
      }
    } catch (e) {
      // Fallback to direct stream URL if single fetch fails
    }
  }

  return { cachedCount, total };
}

/**
 * Returns a random clip for category guaranteed to NEVER repeat the same video twice in a row
 */
export function getRandomClipForCategory(category: ActionCategory): ActionClip {
  const catKey = String(category).toLowerCase();
  const clips = activeClipsStore[catKey] || activeClipsStore.power || DRIVE_RAW_CLIPS.power;
  
  if (!clips || clips.length === 0) {
    return DRIVE_RAW_CLIPS.power[0];
  }

  if (clips.length === 1) {
    return clips[0];
  }

  const lastId = lastPlayedMap.get(catKey);
  const eligibleClips = clips.filter(c => c.id !== lastId);
  const randomIndex = Math.floor(Math.random() * eligibleClips.length);
  const selected = eligibleClips[randomIndex] || clips[0];

  lastPlayedMap.set(catKey, selected.id);
  return selected;
}
