import Papa from "papaparse";
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

export async function getWalkathonLeaderboard(): Promise<WalkathonEntry[]> {
  const data = await fetchSheetData<WalkathonEntry>("Walkathon");
  return data
    .filter(row => row.Active === "TRUE")
    .sort((a, b) => (Number(a.Rank) || 999) - (Number(b.Rank) || 999));
}

export async function getBadmintonFixtures(): Promise<BadmintonFixture[]> {
  const data = await fetchSheetData<BadmintonFixture>("Badminton");
  return data
    .filter(row => row.Active === "TRUE");
}

export async function getSponsors(): Promise<Sponsor[]> {
  const data = await fetchSheetData<Sponsor>("Sponsors");
  return data
    .filter(row => row.Active === "TRUE")
    .sort((a, b) => (Number(a['Display Order']) || 0) - (Number(b['Display Order']) || 0));
}

export async function getStalls(): Promise<Stall[]> {
  const data = await fetchSheetData<Stall>("Stalls");
  return data
    .filter(row => row.Active === "TRUE")
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
