"use client";

import { motion } from "framer-motion";

import type { CommitteeMember } from "@/types/festival";

interface FooterProps {
  committee?: CommitteeMember[];
  config?: Record<string, unknown>;
}

export function Footer({ committee, config = {} }: FooterProps) {
  const currentYear = new Date().getFullYear();
  
  const helpEmail = typeof config["Help Email"] === "string" ? config["Help Email"].trim() : "onam@grsitara.in";
  const helpPhone = typeof config["Help Phone"] === "string" ? config["Help Phone"].trim() : "+91 98765 43210";
  const helpLocation = typeof config["Help Location"] === "string" ? config["Help Location"].trim() : "GR Sitara Clubhouse";

  return (
    <footer className="relative w-full bg-gradient-to-t from-[var(--color-brand-secondary)] to-[var(--color-brand-primary)] text-white pt-16 pb-8 px-6 mt-20">
      {/* Decorative Traditional Border (Nilavilakku glow concept) */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-300" />
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Brand & Festival Info */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold tracking-wide">GR Sitara</h3>
          <p className="text-sm opacity-80 leading-relaxed">
            Celebrating the spirit of Onam with joy, unity, and traditional grandeur. Maveli Swagatham!
          </p>
          <div className="flex items-center gap-2 text-yellow-300">
            <span className="text-xl">🌸</span>
            <span className="text-sm font-semibold">Onam Festival Platform</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold mb-4 text-yellow-200">Festival Navigation</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><a href="#" className="hover:text-yellow-300 transition-colors">Home</a></li>
            <li><a href="#activities" className="hover:text-yellow-300 transition-colors">Activities & Events</a></li>
            <li><a href="#walkathon" className="hover:text-yellow-300 transition-colors">Walkathon Leaderboard</a></li>
            <li><a href="#badminton" className="hover:text-yellow-300 transition-colors">Badminton Tournament</a></li>
            <li><a href="#gallery" className="hover:text-yellow-300 transition-colors">Memories Gallery</a></li>
          </ul>
        </div>

        {/* Committee & Coordinators */}
        <div>
          <h4 className="text-lg font-semibold mb-4 text-yellow-200">Organizing Committee</h4>
          <ul className="space-y-2 text-sm opacity-80">
            {committee && committee.length > 0 ? (
              committee.slice(0, 4).map((member, idx) => (
                <li key={idx}>
                  {member.Role}: <span className="font-semibold text-white">{member.Name}</span>
                </li>
              ))
            ) : (
              <>
                <li>Event Chair: <span className="font-semibold text-white">Suresh Kumar</span></li>
                <li>Sports Head: <span className="font-semibold text-white">Ramesh Nair</span></li>
                <li>Cultural Lead: <span className="font-semibold text-white">Priya Lakshmi</span></li>
                <li>Registrations: <span className="font-semibold text-white">Anil Joseph</span></li>
              </>
            )}
          </ul>
        </div>

        {/* Contacts & Support */}
        <div>
          <h4 className="text-lg font-semibold mb-4 text-yellow-200">Need Help?</h4>
          <p className="text-sm opacity-80 mb-2">
            Reach out to the helpdesk for event registrations or sponsorship queries.
          </p>
          <div className="text-sm space-y-1">
            <p>📧 <span className="opacity-90">{helpEmail}</span></p>
            <p>📞 <span className="opacity-90">{helpPhone}</span></p>
            <p>📍 <span className="opacity-90">{helpLocation}</span></p>
          </div>
        </div>
      </div>

      {/* Copyright & Divider */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4 text-xs opacity-70 text-center md:text-left">
        <div>
          <p>&copy; {currentYear} GR Sitara Residents Association. All Rights Reserved.</p>
        </div>
        <div className="flex gap-4 items-center">
          <span>Handcrafted with 💛 for Onam</span>
          <a 
            href="https://vercel.com/manavalanz/namma-onam/analytics" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="opacity-30 hover:opacity-100 transition-opacity" 
            title="View Analytics Dashboard"
          >
            📊
          </a>
        </div>
      </div>
    </footer>
  );
}
