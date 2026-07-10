"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

// ─── Cinematic scenes ───────────────────────────────────────────────────────
// Each scene: image, duration in ms, Ken Burns direction, title overlay
const SCENES = [
  {
    img: "/intro-dawn.png",
    duration: 2800,
    scale: { from: 1.08, to: 1.0 },
    translate: { from: "0% 0%", to: "0% 0%" },
    caption: null,
  },
  {
    img: "/intro-lamp.png",
    duration: 2600,
    scale: { from: 1.0, to: 1.08 },
    translate: { from: "0% 0%", to: "-2% 1%" },
    caption: "ഓണാശംസകൾ",  // "Onam Wishes" in Malayalam
  },
  {
    img: "/intro-pookalam.png",
    duration: 2600,
    scale: { from: 1.1, to: 1.02 },
    translate: { from: "2% 0%", to: "0% 0%" },
    caption: null,
  },
  {
    img: "/intro-gate.png",
    duration: 2800,
    scale: { from: 1.0, to: 1.06 },
    translate: { from: "0% 2%", to: "0% 0%" },
    caption: null,
  },
] as const;

const TOTAL_DURATION = SCENES.reduce((s, sc) => s + sc.duration, 0);

// ─── Component ──────────────────────────────────────────────────────────────
export function IntroScreen() {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  const [sceneIdx, setSceneIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    
    // Detect iOS devices (iPhone, iPad, iPod, and iPads disguised as Macs)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
    
    const params = new URLSearchParams(window.location.search);
    const force  = params.get("forceIntro") === "true";
    const seen   = sessionStorage.getItem("hasSeenNammaOnamIntro");
    
    if (force || (!seen && !isIOS)) {
      setShow(true);
      document.body.style.overflow = "hidden";
    }
  }, []);

  // Scene sequencer
  useEffect(() => {
    if (!show) return;

    // Show festival title after 2nd scene starts
    const titleTimer = setTimeout(() => setTitleVisible(true), SCENES[0].duration + 400);

    // Advance scenes
    let elapsed = 0;
    const timers: ReturnType<typeof setTimeout>[] = [titleTimer];

    SCENES.forEach((sc, i) => {
      if (i === 0) { elapsed += sc.duration; return; }
      const t = setTimeout(() => setSceneIdx(i), elapsed);
      timers.push(t);
      elapsed += sc.duration;
    });

    // End intro
    const endTimer = setTimeout(() => dismiss(), TOTAL_DURATION + 600);
    timers.push(endTimer);

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  function dismiss() {
    sessionStorage.setItem("hasSeenNammaOnamIntro", "1");
    document.body.style.overflow = "";
    setDone(true);
  }

  if (!mounted || !show || done) return null;

  const scene = SCENES[sceneIdx];

  return (
    <AnimatePresence>
      <motion.div
        key="intro-overlay"
        className="fixed inset-0 z-[200] overflow-hidden bg-black"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        {/* ── Cinematic image with Ken Burns ── */}
        <AnimatePresence mode="sync">
          <motion.div
            key={sceneIdx}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
          >
            <motion.div
              className="w-full h-full"
              initial={{ scale: scene.scale.from }}
              animate={{ scale: scene.scale.to }}
              transition={{ duration: scene.duration / 1000 + 0.4, ease: "linear" }}
            >
              <Image
                src={scene.img}
                alt=""
                fill
                priority
                className="object-cover"
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* ── Cinematic bars (top & bottom) ── */}
        <div
          className="absolute inset-x-0 top-0 h-16 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)" }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)" }}
        />

        {/* ── Letterbox bars ── */}
        <div className="absolute inset-x-0 top-0 h-[5vh] bg-black pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-[5vh] bg-black pointer-events-none" />

        {/* ── Scene caption (brief text on lamp scene) ── */}
        <AnimatePresence>
          {scene.caption && (
            <motion.p
              key={`caption-${sceneIdx}`}
              className="absolute bottom-[12vh] inset-x-0 text-center text-lg md:text-2xl font-light tracking-[0.25em]"
              style={{ color: "rgba(212,175,55,0.85)", fontFamily: "'Playfair Display', serif" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              {scene.caption}
            </motion.p>
          )}
        </AnimatePresence>

        {/* ── Festival title reveal (after scene 1) ── */}
        <AnimatePresence>
          {titleVisible && (
            <motion.div
              key="main-title"
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2 }}
            >
              {/* Eyebrow */}
              <motion.p
                initial={{ opacity: 0, y: 12, letterSpacing: "0.05em" }}
                animate={{ opacity: 1, y: 0, letterSpacing: "0.3em" }}
                transition={{ duration: 1.2, delay: 0.2 }}
                className="text-xs md:text-sm uppercase font-semibold mb-5"
                style={{ color: "rgba(212,175,55,0.85)" }}
              >
                G R Sitara · August 15 &amp; 16, 2026
              </motion.p>

              {/* Main title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl md:text-8xl font-bold mb-4"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "#F8F3E7",
                  textShadow: "0 4px 40px rgba(0,0,0,0.7)",
                }}
              >
                Namma Onam 2.0
              </motion.h1>

              {/* Gold rule */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.9 }}
                className="h-px w-48 md:w-72 mb-4"
                style={{ background: "var(--gradient-gold)", transformOrigin: "center" }}
              />

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.1 }}
                className="text-base md:text-lg font-light"
                style={{ color: "rgba(248,243,231,0.65)" }}
              >
                A grand Onam celebration
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Scene progress bar ── */}
        <div className="absolute top-[5vh] inset-x-0 flex gap-1 px-6 z-10">
          {SCENES.map((sc, i) => (
            <div
              key={i}
              className="flex-1 h-[2px] rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              {i < sceneIdx && (
                <div className="h-full w-full" style={{ background: "rgba(212,175,55,0.8)" }} />
              )}
              {i === sceneIdx && (
                <motion.div
                  className="h-full"
                  style={{ background: "rgba(212,175,55,0.9)" }}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: sc.duration / 1000, ease: "linear" }}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── Skip button ── */}
        <motion.button
          onClick={dismiss}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute top-[5vh] right-6 mt-4 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest transition-all duration-200 hover:bg-white/10 z-20"
          style={{
            color: "rgba(248,243,231,0.7)",
            border: "1px solid rgba(248,243,231,0.2)",
          }}
        >
          Skip
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}
