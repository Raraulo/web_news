// components/SportsTicker.tsx
"use client";

import { useEffect, useState } from "react";

interface Match {
  league: string;
  leagueLogo?: string;
  country?: string;
  countryFlag?: string | null;
  home: string;
  away: string;
  homeLogo?: string;
  awayLogo?: string;
  statusCode: string; // <-- faltaba esto
  status: string;
  isLive: boolean;
  elapsed: string | null;
  score: { home: number | null; away: number | null };
  time: string;
}

// Ícono de reloj (SVG, no emoji) para partidos por jugar
function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-3 h-3 text-white/40"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

// Ícono de "finalizado" (check dentro de círculo)
function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-3 h-3 text-white/40"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </svg>
  );
}

function TeamCrest({ src, alt }: { src?: string; alt: string }) {
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={18}
      height={18}
      className="w-[18px] h-[18px] object-contain shrink-0"
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  );
}

export function SportsTicker() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const res = await fetch("/api/sports");
        const data: unknown = await res.json();
        if (Array.isArray(data)) {
          setMatches(data as Match[]);
          setError(false);
        } else {
          setError(true);
        }
      } catch (e) {
        console.error(e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSports();
    const interval = setInterval(fetchSports, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading || error || matches.length === 0) return null;

  const renderMatch = (m: Match, key: string) => {
    const hasScore = m.score.home !== null && m.score.away !== null;

    return (
      <div key={key} className="flex items-center gap-3.5 shrink-0">
        {/* Liga: escudo/ícono + bandera del país + nombre en versalitas */}
        <div className="flex items-center gap-1.5">
          {m.countryFlag && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={m.countryFlag}
              alt={m.country ?? ""}
              width={14}
              height={10}
              className="w-3.5 h-2.5 object-cover rounded-[1px] shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <span className="font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
            {m.league}
          </span>
        </div>

        <span className="h-3 w-px bg-white/15" />

        {/* Equipo local */}
        <div className="flex items-center gap-2">
          <TeamCrest src={m.homeLogo} alt={m.home} />
          <span className="font-serif font-semibold text-[13px] text-white/90 tracking-wide">
            {m.home}
          </span>
        </div>

        {/* Marcador o próxima hora */}
        <div className="flex items-center px-3.5 mx-0.5 border-x border-white/15">
          {hasScore ? (
            <span className="font-serif text-[15px] font-bold text-white tabular-nums tracking-wider">
              {m.score.home} — {m.score.away}
            </span>
          ) : (
            <span className="font-sans text-[13px] font-semibold text-white/80 tabular-nums">
              {m.time}
            </span>
          )}
        </div>

        {/* Equipo visitante */}
        <div className="flex items-center gap-2">
          <span className="font-serif font-semibold text-[13px] text-white/90 tracking-wide">
            {m.away}
          </span>
          <TeamCrest src={m.awayLogo} alt={m.away} />
        </div>

        {/* Estado del partido */}
        <div className="flex items-center gap-1.5 font-sans text-[10px] font-semibold tracking-[0.15em] text-white/50 uppercase ml-0.5">
          {m.isLive ? (
            <span className="w-1.5 h-1.5 rounded-full bg-[#cc0000] animate-pulse" />
          ) : m.statusCode === "FT" || m.statusCode === "AET" || m.statusCode === "PEN" ? (
            <CheckIcon />
          ) : (
            <ClockIcon />
          )}
          {m.elapsed ? `${m.elapsed} · ${m.status}` : m.status}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-black text-white overflow-hidden flex items-center border-y border-white/15 h-11 relative z-20">
      <div className="font-sans px-5 h-full flex items-center whitespace-nowrap z-10 border-r border-white/15 gap-2 shrink-0 bg-black">
        <span className="w-1.5 h-1.5 rounded-full bg-[#cc0000] animate-pulse" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em]">
          Deportes hoy
        </span>
      </div>

      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        <div className="animate-ticker whitespace-nowrap flex gap-12 px-8 items-center h-full hover:[animation-play-state:paused] cursor-default">
          {matches.map((m, i) => renderMatch(m, `${i}`))}
          {matches.map((m, i) => renderMatch(m, `dup-${i}`))}
        </div>
      </div>
    </div>
  );
}