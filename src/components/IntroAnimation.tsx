"use client";

import { useEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";

// --- Timings -----------------------------------------------------------
const TEXT_STAGGER = 45;
const CHAR_DURATION = 550;
const HOLD_AFTER_TEXT = 650;
const FADE_MS = 550;

const WORDMARK = "The Quito Grid";

export function IntroAnimation() {
  const [visible, setVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const textRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const handle = window.requestAnimationFrame(() => setVisible(true));
    return () => window.cancelAnimationFrame(handle);
  }, []);

  useEffect(() => {
    if (!visible || !textRef.current) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const letters = textRef.current.querySelectorAll<HTMLSpanElement>(".letter");

    if (reduceMotion) {
      animate(letters, { opacity: [0, 1], duration: 300 });
      const t = window.setTimeout(() => setFadingOut(true), 700);
      const t2 = window.setTimeout(() => setVisible(false), 700 + FADE_MS);
      return () => {
        window.clearTimeout(t);
        window.clearTimeout(t2);
      };
    }

    animate(letters, {
      opacity: [0, 1],
      translateY: [16, 0],
      filter: ["blur(6px)", "blur(0px)"],
      ease: "outQuad",
      duration: CHAR_DURATION,
      delay: stagger(TEXT_STAGGER),
    });

    const textTotal = (letters.length - 1) * TEXT_STAGGER + CHAR_DURATION;

    const fadeTimer = window.setTimeout(
      () => setFadingOut(true),
      textTotal + HOLD_AFTER_TEXT
    );
    const removeTimer = window.setTimeout(
      () => setVisible(false),
      textTotal + HOLD_AFTER_TEXT + FADE_MS
    );

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-black transition-opacity ease-out ${
        fadingOut ? "opacity-0" : "opacity-100"
      }`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      <h1
        ref={textRef}
        className="select-none text-4xl sm:text-6xl font-black tracking-tight text-black dark:text-white"
        style={{ fontFamily: "var(--font-playfair)" }}
      >
        {WORDMARK.split("").map((char, i) => (
          <span key={i} className="letter inline-block opacity-0">
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </h1>
    </div>
  );
}