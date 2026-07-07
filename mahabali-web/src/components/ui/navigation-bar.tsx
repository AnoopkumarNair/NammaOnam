"use client";

import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Home",       href: "#" },
  { label: "Activities", href: "#activities" },
  { label: "Walkathon",  href: "#walkathon" },
  { label: "Badminton",  href: "#badminton" },
  { label: "Schedule",  href: "#schedule" },
  { label: "Gallery",    href: "#gallery" },
];

interface NavigationBarProps {
  brandTitle?: string;
  registrationHref?: string;
}

export function NavigationBar({
  brandTitle = "Namma Onam 2.0",
  registrationHref = "#activities",
}: NavigationBarProps) {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled]           = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hidden, setHidden]                   = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setIsScrolled(latest > 60);
    setHidden(latest > previous && latest > 200);
  });

  return (
    <>
      <motion.nav
        variants={{ visible: { y: 0 }, hidden: { y: "-110%" } }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 inset-x-0 z-50"
      >
        {/* Bar */}
        <div
          className="transition-all duration-500"
          style={
            isScrolled
              ? {
                  background: "rgba(20, 8, 2, 0.80)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  borderBottom: "1px solid rgba(212, 175, 55, 0.25)",
                  boxShadow: "0 4px 32px rgba(0,0,0,0.3)",
                }
              : {
                  background: "transparent",
                }
          }
        >
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            {/* Logo */}
            <div className="flex flex-col leading-none" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.8))" }}>
              <span
                className="text-lg md:text-xl font-bold gold-shimmer"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {brandTitle}
              </span>
              <span
                className="text-[10px] uppercase tracking-[0.2em] font-medium mt-0.5"
                style={{ color: "rgba(212,175,55,0.95)" }}
              >
                G R Sitara
              </span>
            </div>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-7">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium transition-all duration-200 hover:opacity-100 relative group"
                  style={{ color: isScrolled ? "rgba(248,243,231,0.75)" : "rgba(248,243,231,0.85)" }}
                >
                  {link.label}
                  {/* Gold underline on hover */}
                  <span
                    className="absolute -bottom-1 left-0 w-0 h-px group-hover:w-full transition-all duration-300"
                    style={{ background: "var(--color-temple-gold)" }}
                  />
                </a>
              ))}

              {/* CTA pill */}
              <a
                href={registrationHref}
                target={registrationHref.startsWith("http") ? "_blank" : undefined}
                rel={registrationHref.startsWith("http") ? "noreferrer" : undefined}
                className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-px"
                style={{
                  background: "var(--gradient-gold)",
                  color: "#1E0F08",
                  boxShadow: "0 4px 16px rgba(212,175,55,0.3)",
                }}
              >
                Register
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ color: "#F8F3E7" }}
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[65]"
              style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              className="fixed top-0 right-0 bottom-0 z-[70] w-80 flex flex-col p-8"
              style={{
                background: "rgba(20, 8, 2, 0.95)",
                backdropFilter: "blur(24px)",
                borderLeft: "1px solid rgba(212, 175, 55, 0.2)",
              }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 200 }}
            >
              <div className="flex justify-between items-start mb-10">
                <div>
                  <p
                    className="text-xl font-bold gold-shimmer"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {brandTitle}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "rgba(212,175,55,0.6)" }}>G R Sitara</p>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg"
                  style={{ color: "rgba(248,243,231,0.6)" }}
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {NAV_LINKS.map((link, i) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="text-lg font-medium py-4 px-4 rounded-xl transition-all duration-200"
                    style={{
                      color: "rgba(248,243,231,0.8)",
                      borderBottom: "1px solid rgba(212,175,55,0.1)",
                    }}
                  >
                    {link.label}
                  </motion.a>
                ))}
              </div>

              <div className="mt-auto">
                <a
                  href={registrationHref}
                  target={registrationHref.startsWith("http") ? "_blank" : undefined}
                  rel={registrationHref.startsWith("http") ? "noreferrer" : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center px-6 py-4 rounded-full font-semibold"
                  style={{
                    background: "var(--gradient-gold)",
                    color: "#1E0F08",
                  }}
                >
                  Register Now
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
