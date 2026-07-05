"use client";

import { useEffect, useState } from "react";

export function SportsTicker() {
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const res = await fetch("/api/sports");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setMatches(data);
        } else {
          setMatches([
            { sport: "LIGA PRO", home: "LDU Quito", away: "Independiente", status: "LIVE", score: "2 - 1", time: "19:00" },
            { sport: "MUNDIAL", home: "Ecuador", away: "Brasil", status: "NEXT", score: "- - -", time: "16:00" },
            { sport: "LIBERTADORES", home: "River Plate", away: "Flamengo", status: "FT", score: "1 - 0", time: "Ayer" },
            { sport: "SUDAMERICANA", home: "LDU Quito", away: "Boca Juniors", status: "NEXT", score: "- - -", time: "20:00" },
          ]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchSports();
  }, []);

  if (matches.length === 0) return null;

  const renderMatch = (m: any, key: string) => (
    <div key={key} className="flex items-center gap-3 font-serif">
      <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-white/45 mr-1">
        {m.league || m.sport}
      </span>
      <span className="font-semibold text-white/90 tracking-wide">{m.home}</span>
      <span className="text-sm font-bold text-white border-x border-white/20 px-3">
        {m.score !== "- - -" ? m.score : m.time}
      </span>
      <span className="font-semibold text-white/90 tracking-wide">{m.away}</span>
      <span className="flex items-center gap-1.5 font-sans text-[10px] font-semibold tracking-[0.15em] text-white/50 uppercase">
        {m.status === "LIVE" && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#cc0000] animate-pulse" />
        )}
        {m.status}
      </span>
    </div>
  );

  return (
    <div className="w-full bg-black text-white overflow-hidden flex items-center border-y border-white/15 h-11 relative z-20">
      <div className="font-sans px-5 h-full flex items-center whitespace-nowrap z-10 border-r border-white/15 gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#cc0000] animate-pulse" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em]">En vivo</span>
      </div>

      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        <div className="animate-ticker whitespace-nowrap flex gap-10 px-8 items-center h-full hover:[animation-play-state:paused] cursor-default">
          {matches.map((m, i) => renderMatch(m, `${i}`))}
          {/* Duplicado para el loop infinito del marquee */}
          {matches.map((m, i) => renderMatch(m, `dup-${i}`))}
        </div>
      </div>
    </div>
  );
}