export interface FestivalConfig {
  "Festival Name"?: string;
  "Festival Year"?: string;
  "Apartment Name"?: string;
  "Countdown Date"?: string;
  "Primary Color"?: string;
  "Secondary Color"?: string;
  "Logo"?: string;
  "Maveli Asset Pack"?: string;
  "Intro Enabled"?: boolean;
  "Festival Live Date"?: string;
  "Enable Walkathon"?: boolean;
  "Enable Badminton"?: boolean;
  "Enable Gallery"?: boolean;
  "Enable AI Assistant"?: boolean;
  "Enable Fireworks"?: boolean;
  "Enable Easter Eggs"?: boolean;
  "Enable Push Notifications"?: boolean;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface Activity {
  Id: string | number;
  Title: string;
  Description: string;
  Status: string;
  "Display Order"?: number;
  "Image URL"?: string;
  "QR Code URL"?: string;
  "Registration URL"?: string;
  "Registration Link"?: string;
  "Form URL"?: string;
  "Button Label"?: string;
  Time?: string;
  Location?: string;
  Active: boolean;
}

export interface WalkathonEntry {
  Rank: number;
  "Participant Name": string;
  Steps: number;
  Active: boolean;
}

export interface BadmintonFixture {
  "Match Name": string;
  Date: string;
  Status: string;
  "Team A": string;
  "Team B": string;
  Winner?: string;
  Category?: string;
  Active: boolean;
}

export interface Sponsor {
  Title: string;
  "Image URL"?: string;
  "Logo URL"?: string;
  "Website URL"?: string;
  Description?: string;
  Tier: string;
  "Display Order"?: number;
  Active: boolean;
}

export interface Stall {
  Title: string;
  Description: string;
  "Image URL"?: string;
  Location: string;
  "Display Order"?: number;
  Active: boolean;
}

export interface Announcement {
  Title: string;
  Priority: string;
  Active: boolean;
}

export interface CommitteeMember {
  Name: string;
  Role?: string;
  Contact?: string;
  Avatar?: string;
  "Display Order"?: string | number;
  Active?: string | boolean;
}

export interface CulturalEvent {
  Date?: string;
  Track?: string;
  Time: string;
  Title: string;
  Description?: string;
  Icon?: string;
  Active?: string | boolean;
  "Display Order"?: string | number;
}

export interface FAQItem {
  Question: string;
  Answer: string;
  Category?: string;
  Active?: string | boolean;
  "Display Order"?: string | number;
}
