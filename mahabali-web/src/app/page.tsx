import { Suspense } from "react";
import { BadmintonBracket } from "@/components/ui/badminton-bracket";
import { CommitteeGrid } from "@/components/ui/committee-grid";
import { CulturalTimeline } from "@/components/ui/cultural-timeline";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { FloatingNilavilakku } from "@/components/ui/nilavilakku";
import { Footer } from "@/components/ui/footer";
import { Gallery } from "@/components/ui/gallery";
import { HeroBanner } from "@/components/ui/hero-banner";
import { IntroScreen } from "@/components/ui/intro-screen";
import { MaveliWidget } from "@/components/ui/maveli-widget";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { PageTransition } from "@/components/ui/page-transition";
import { SequentialMedia } from "@/components/ui/sequential-media";
import { SponsorsMarquee } from "@/components/ui/sponsors-marquee";
import { StackedSection } from "@/components/ui/stacked-section";
import { StallsCarousel } from "@/components/ui/stalls-carousel";
import { WalkathonTracker } from "@/components/ui/walkathon-tracker";
import {
  getActivities,
  getAnnouncements,
  getBadmintonFixtures,
  getConfig,
  getSponsors,
  getStalls,
  getWalkathonLeaderboard,
  getCommittee,
  getCulturalEvents,
  getFaqs,
} from "@/services/google-sheets";
import type { Activity, Sponsor, Stall } from "@/types/festival";

const REGISTRATION_KEYS = [
  "Registration URL",
  "Registration Link",
  "QR Code URL",
  "Form URL",
  "Google Form URL",
  "Link URL",
  "URL",
];

const FESTIVAL_REELS = [
  {
    title: "Maveli Welcome",
    label: "Procession",
    src: "/King_Maveli_dancing_with_procession_202607062058.mp4",
  },
  {
    title: "Badminton Smash",
    label: "Sports",
    src: "/Man_leaping_for_badminton_smash_202607062058.mp4",
  },
  {
    title: "Tug of War",
    label: "Games",
    src: "/Men_and_women_playing_tug_202607062058.mp4",
  },
  {
    title: "Ona Sadhya",
    label: "Feast",
    src: "/King_Mahabali_eating_Onam_Sadhya_202607062205.mp4",
  },
  {
    title: "Walkathon",
    label: "Fitness",
    src: "/King_Mahabali_power-walking_event_202607062222.mp4",
    href: "#walkathon",
  },
  {
    title: "Festival Schedule",
    label: "Arts",
    src: "/Onam_festival_dance_performance_202607062225.mp4",
    href: "#schedule",
  },
];

function getText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getRegistrationUrl(record: Record<string, unknown>): string {
  for (const key of REGISTRATION_KEYS) {
    const url = getText(record[key]);
    if (url) return url;
  }
  return "";
}

function findActivityUrl(activities: Activity[], keyword: string): string {
  const match = activities.find(a => a.Title.toLowerCase().includes(keyword.toLowerCase()));
  return match ? getRegistrationUrl(match as unknown as Record<string, unknown>) : "";
}

function getActivityMedia(activity: Activity, index: number): string {
  const title = activity.Title.toLowerCase();
  if (title.includes("badminton")) return FESTIVAL_REELS[1].src;
  if (title.includes("maveli") || title.includes("procession")) return FESTIVAL_REELS[0].src;
  if (title.includes("tug") || title.includes("vadam") || title.includes("vali")) return FESTIVAL_REELS[2].src;
  if (title.includes("sadhya") || title.includes("feast") || title.includes("food")) return FESTIVAL_REELS[3].src;
  if (title.includes("walkathon") || title.includes("walk")) return FESTIVAL_REELS[4].src;
  if (title.includes("dance") || title.includes("cultural") || title.includes("thiruvathira")) return FESTIVAL_REELS[5].src;
  return index < FESTIVAL_REELS.length ? FESTIVAL_REELS[index].src : "";
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string; dot: string }> = {
    Open: { bg: "rgba(46,139,87,0.12)", text: "#1a6640", dot: "#2E8B57" },
    Upcoming: { bg: "rgba(212,175,55,0.15)", text: "#7a5c00", dot: "#D4AF37" },
    Closed: { bg: "rgba(74,46,31,0.08)", text: "#7a5c46", dot: "#9e7c5c" },
    Live: { bg: "rgba(180,30,30,0.12)", text: "#8b1a1a", dot: "#c0392b" },
  };
  const normalizedStatus = status?.trim() || "Upcoming";
  const color = colors[normalizedStatus] ?? colors.Upcoming;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold"
      style={{ background: color.bg, color: color.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color.dot }} />
      {normalizedStatus}
    </span>
  );
}

function FestivalReels() {
  return (
    <div className="mb-7 md:mb-10">
      <div className="flex items-end justify-between gap-4 mb-3 px-1">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] font-bold" style={{ color: "var(--color-onam-orange)" }}>
            Festival moments
          </p>
          <h3 className="text-xl md:text-2xl font-bold" style={{ color: "var(--color-deep-brown)" }}>
            Maveli, games, and energy
          </h3>
        </div>
      </div>
      <div className="-mx-4 md:mx-0 overflow-x-auto pb-2">
        <div className="flex md:grid md:grid-cols-3 gap-3 px-4 md:px-0 min-w-min">
          {FESTIVAL_REELS.map((reel) => {
            const inner = (
              <>
                <video src={reel.src} autoPlay loop muted playsInline preload="metadata" className="h-40 md:h-44 w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute left-4 right-4 bottom-4">
                  <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-yellow-200">{reel.label}</span>
                  <h4 className="text-white text-lg font-bold">{reel.title}</h4>
                </div>
              </>
            );

            const className = "relative shrink-0 w-[76vw] max-w-[300px] md:w-auto rounded-2xl overflow-hidden bg-black shadow-lg block transition-transform hover:-translate-y-1";

            if (reel.href) {
              return (
                <a key={reel.src} href={reel.href} className={className}>
                  {inner}
                </a>
              );
            }

            return (
              <article key={reel.src} className={className}>
                {inner}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ActivityCard({ activity, index }: { activity: Activity; index: number }) {
  const registrationUrl = getRegistrationUrl(activity as unknown as Record<string, unknown>);
  const sheetImage = typeof activity["Image URL"] === "string" ? activity["Image URL"].trim() : "";
  const mediaRaw = sheetImage || getActivityMedia(activity, index);
  const mediaUrls = mediaRaw.split(",").map((s) => s.trim()).filter(Boolean);
  const buttonLabel = getText(activity["Button Label"]) || "Register";

  return (
    <article
      className="relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "rgba(255,251,240,0.94)",
        border: "1px solid rgba(212,175,55,0.16)",
        boxShadow: "var(--shadow-2)",
      }}
    >
      {mediaUrls.length > 0 && (
        <SequentialMedia urls={mediaUrls} title={activity.Title} />
      )}
      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex items-start justify-between gap-3">
          {buttonLabel.toUpperCase() !== "NONE" ? (
            <StatusBadge status={activity.Status} />
          ) : (
            <div /> 
          )}
          {activity.Time && (
            <span className="text-[11px] font-bold text-right ml-auto" style={{ color: "rgba(74,46,31,0.62)" }}>
              {activity.Time}
            </span>
          )}
        </div>

        <div className="text-center">
          <h3 className="text-xl font-bold leading-tight" style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-deep-brown)" }}>
            {activity.Title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(74,46,31,0.72)" }}>
            {activity.Description}
          </p>
        </div>

        {activity.Location && (
          <div className="flex justify-center">
            <span
              className="w-fit text-xs font-semibold px-3 py-1 rounded-full"
              style={{ background: "rgba(212,175,55,0.12)", color: "var(--color-deep-brown)" }}
            >
              {activity.Location}
            </span>
          </div>
        )}

        {buttonLabel.toUpperCase() !== "NONE" && (
          registrationUrl ? (
            <a
              href={registrationUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-auto h-11 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200"
              style={{ background: "var(--gradient-gold)", color: "#1E0F08" }}
            >
              {buttonLabel}
            </a>
          ) : (
            <div
              className="mt-auto h-11 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: "rgba(74,46,31,0.07)", color: "rgba(74,46,31,0.5)" }}
            >
              Details soon
            </div>
          )
        )}
      </div>
    </article>
  );
}


async function WalkathonSection({ registrationUrl }: { registrationUrl?: string }) {
  const leaderboard = await getWalkathonLeaderboard();
  return <WalkathonTracker leaderboard={leaderboard} registrationUrl={registrationUrl} />;
}

export default async function Home() {
  const [config, activities, fixtures, sponsors, stalls, announcements, committee, culturals, faqs] = await Promise.all([
    getConfig(),
    getActivities(),
    getBadmintonFixtures(),
    getSponsors(),
    getStalls(),
    getAnnouncements(),
    getCommittee(),
    getCulturalEvents(),
    getFaqs(),
  ]);

  const title = getText(config["Festival Name"]) || "Namma Onam 2.0";
  const targetDate = getText(config["Countdown Date"]) || "2026-08-15T08:00:00";
  const eventDateLabel = getText(config["Event Dates"]) || getText(config["Event Date Label"]) || "August 15 & 16, 2026";
  const subtitle = getText(config["Hero Subtitle"]);
  const registrationHref =
    getRegistrationUrl(config) ||
    activities.map((activity) => getRegistrationUrl(activity as unknown as Record<string, unknown>)).find(Boolean) ||
    "#activities";
  const walkathonRegistrationUrl = findActivityUrl(activities, "walkathon");
  const badmintonRegistrationUrl = findActivityUrl(activities, "badminton");

  return (
    <PageTransition className="flex flex-col min-h-screen">
      {config["Intro Enabled"] !== false && <IntroScreen />}

      <NavigationBar brandTitle={title} registrationHref={registrationHref} />

      {announcements.length > 0 && (
        <div
          className="fixed top-[68px] md:top-[76px] z-[55] w-full py-2 overflow-hidden pointer-events-none"
          style={{
            background: "linear-gradient(90deg, #4A2E1F 0%, #7B1C1C 50%, #4A2E1F 100%)",
            borderBottom: "1px solid rgba(212,175,55,0.3)",
          }}
        >
          <div className="animate-marquee flex gap-16 whitespace-nowrap">
            {[...announcements, ...announcements].map((announcement, index) => (
              <span key={`${announcement.Title}-${index}`} className="text-xs font-semibold tracking-wide" style={{ color: "#F8F3E7" }}>
                {announcement.Priority === "High" ? "Important: " : "Update: "}
                {announcement.Title}
              </span>
            ))}
          </div>
        </div>
      )}

      <main className="flex-1 w-full">
        <HeroBanner
          title={title}
          subtitle={subtitle}
          targetDate={targetDate}
          eventDateLabel={eventDateLabel}
          registrationHref={registrationHref}
        />

        <SponsorsMarquee sponsors={sponsors} />

        <div className="relative z-10 -mt-6 md:-mt-[8vh] pb-24 md:pb-32" style={{ background: "var(--background)" }}>
          <StackedSection id="activities" title="Festival Highlights" index={1}>
            {activities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {activities.map((activity, index) => (
                  <ActivityCard key={`${activity.Id}-${activity.Title}`} activity={activity} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12" style={{ color: "rgba(74,46,31,0.45)" }}>
                <p className="text-lg font-medium">Activities coming soon</p>
              </div>
            )}
          </StackedSection>

          {stalls.length > 0 && (
            <StackedSection id="stalls" title="Festival Stalls" index={2}>
              <StallsCarousel stalls={stalls} />
            </StackedSection>
          )}

          {(config["Enable Walkathon"] === true || config["Enable Walkathon"] === "TRUE") && (
            <StackedSection id="walkathon" title="Walkathon Leaderboard" index={3}>
              <Suspense fallback={<div className="w-full max-w-4xl mx-auto p-8 rounded-2xl bg-white shadow-sm border border-orange-100 flex items-center justify-center min-h-[300px]"><div className="animate-pulse flex flex-col items-center gap-4"><div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div><p className="text-orange-800 font-medium">Fetching Live Leaderboard...</p></div></div>}>
                <WalkathonSection registrationUrl={walkathonRegistrationUrl} />
              </Suspense>
            </StackedSection>
          )}

          {(config["Enable Badminton"] === true || config["Enable Badminton"] === "TRUE") && (
            <StackedSection id="badminton" title="Badminton Tournament" index={4}>
              <BadmintonBracket fixtures={fixtures} registrationUrl={badmintonRegistrationUrl} />
            </StackedSection>
          )}

          <StackedSection id="schedule" title="Festival Schedule" index={5}>
            <CulturalTimeline events={culturals} />
          </StackedSection>

          {(config["Enable Gallery"] === true || config["Enable Gallery"] === "TRUE") && (
            <StackedSection id="gallery" title="Memories Gallery" index={6}>
              <Gallery />
            </StackedSection>
          )}

          <StackedSection id="faq" title="Common Questions" index={7}>
            <FaqAccordion faqs={faqs} />
          </StackedSection>

          <StackedSection id="committee" title="Organizing Committee" index={8}>
            <CommitteeGrid members={committee} />
          </StackedSection>
        </div>
      </main>

      <FloatingNilavilakku />
      <MaveliWidget initialMessage={`Welcome to ${title}.`} />
      <Footer committee={committee} config={config} />
    </PageTransition>
  );
}
