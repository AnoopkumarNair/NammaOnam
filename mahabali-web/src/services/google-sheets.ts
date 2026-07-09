import Papa from "papaparse";
import { getDriveAssetsMap } from "./drive-assets";
import { 
  FestivalConfig, 
  Activity, 
  WalkathonEntry, 
  BadmintonFixture, 
  Sponsor, 
  Stall, 
  Announcement,
  CommitteeMember,
  CulturalEvent,
  FAQItem
} from "@/types/festival";

const SPREADSHEET_ID = "1vwnoxdyrzXcajB0ff_vnbzQNcGNRA86K-laLT5X3OY0";

export async function fetchSheetData<T>(sheetName: string): Promise<T[]> {
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${sheetName}&headers=1`;
  
  try {
    const response = await fetch(url, { next: { revalidate: 60 } }); // Cache for 60 seconds (Next.js App Router feature)
    if (!response.ok) {
      throw new Error(`Failed to fetch sheet: ${sheetName}`);
    }
    const csvText = await response.text();
    
    // Parse CSV to JSON
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
    });
    
    return (parsed.data || []) as T[];
  } catch (error) {
    console.error("Error fetching Google Sheet:", error);
    return [];
  }
}

export async function getConfig(): Promise<FestivalConfig> {
  const data = await fetchSheetData<Record<string, any>>("Configuration");
  const config: FestivalConfig = {};
  data.forEach((row) => {
    if (row.Key) {
      const key = String(row.Key);
      let val = row.Value;
      if (typeof val === "string") {
        const lower = val.toLowerCase();
        if (lower === "true") val = true;
        else if (lower === "false") val = false;
      }
      config[key] = val;
    }
  });
  return config;
}

export async function getActivities(): Promise<Activity[]> {
  const data = await fetchSheetData<Activity>("Activities");
  return data
    .filter(row => row.Active === "TRUE")
    .sort((a, b) => (Number(a['Display Order']) || 0) - (Number(b['Display Order']) || 0));
}

function resolveAssetUrl(url: string | undefined, driveAssets: Map<string, string>): string | undefined {
  if (!url || typeof url !== 'string') return url;
  const filename = url.split('/').pop() || "";
  return driveAssets.has(filename) ? driveAssets.get(filename) : url;
}

export async function getWalkathonLeaderboard(): Promise<WalkathonEntry[]> {
  try {
    const url = "https://www.mypacer.com/api/v1/web/main/competitions/6a48a83aba0a86217eac1f30/leaderboard?tab_id=global&page=1&page_size=10";
    const response = await fetch(url, { cache: 'no-store' }); // Always fetch strictly live data
    const json = await response.json();
    
    const leaderboard: WalkathonEntry[] = [];
    
    if (json.success && json.data && json.data.leaderboards && json.data.leaderboards.length > 0) {
      const rows = json.data.leaderboards[0].rows;
      
      rows.forEach((row: any) => {
        const rank = parseInt(row[0].text, 10);
        const name = row[1]?.display_text?.main?.trim() || "Unknown";
        const rawSteps = row[2]?.text || "0";
        const steps = parseInt(rawSteps.replace(/,/g, ""), 10);
        
        if (!isNaN(rank) && !isNaN(steps)) {
          leaderboard.push({
            Rank: rank,
            "Participant Name": name,
            Steps: steps,
            Active: true
          });
        }
      });
    }

    return leaderboard;
  } catch (error) {
    console.error("Error fetching Pacer JSON API:", error);
    return [];
  }
}

export async function getBadmintonFixtures(): Promise<BadmintonFixture[]> {
  const data = await fetchSheetData<BadmintonFixture>("Badminton");
  return data
    .filter(row => row.Active === "TRUE");
}

export async function getSponsors(): Promise<Sponsor[]> {
  const [data, driveAssets] = await Promise.all([
    fetchSheetData<Sponsor>("Sponsors"),
    getDriveAssetsMap()
  ]);
  return data
    .filter(row => row.Active === "TRUE")
    .map(row => ({
      ...row,
      "Image URL": resolveAssetUrl(row["Image URL"], driveAssets),
      "Logo URL": resolveAssetUrl(row["Logo URL"], driveAssets)
    }))
    .sort((a, b) => (Number(a['Display Order']) || 0) - (Number(b['Display Order']) || 0));
}

export async function getStalls(): Promise<Stall[]> {
  const [data, driveAssets] = await Promise.all([
    fetchSheetData<Stall>("Stalls"),
    getDriveAssetsMap()
  ]);
  return data
    .filter(row => row.Active === "TRUE")
    .map(row => ({
      ...row,
      "Image URL": resolveAssetUrl(row["Image URL"], driveAssets)
    }))
    .sort((a, b) => (Number(a['Display Order']) || 0) - (Number(b['Display Order']) || 0));
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const data = await fetchSheetData<Announcement>("Announcements");
  return data
    .filter(row => row.Active === "TRUE");
}

export async function getCommittee(): Promise<CommitteeMember[]> {
  const data = await fetchSheetData<CommitteeMember>("Committe");
  return data
    .filter((s) => s.Active === "TRUE")
    .sort((a, b) => {
      const orderA = parseInt(a["Display Order"] as string) || 999;
      const orderB = parseInt(b["Display Order"] as string) || 999;
      return orderA - orderB;
    });
}

export async function getCulturalEvents(): Promise<CulturalEvent[]> {
  const data = await fetchSheetData<CulturalEvent>("Festival Schedule");
  return data
    .filter((s) => s.Active === "TRUE")
    .sort((a, b) => {
      const orderA = parseInt(a["Display Order"] as string) || 999;
      const orderB = parseInt(b["Display Order"] as string) || 999;
      return orderA - orderB;
    });
}

export async function getFaqs(): Promise<FAQItem[]> {
  const data = await fetchSheetData<FAQItem>("FAQ");
  return data
    .filter((s) => s.Active === "TRUE")
    .sort((a, b) => {
      const orderA = parseInt(a["Display Order"] as string) || 999;
      const orderB = parseInt(b["Display Order"] as string) || 999;
      return orderA - orderB;
    });
}
