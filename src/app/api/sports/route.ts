// app/api/sports/route.ts
import { NextResponse } from "next/server";

const SPORTS_API_KEY = "abfbc518c90c5b93903b6033fbdab836";

const EC_TZ = "America/Guayaquil";
const WORLD_CUP_LEAGUE_ID = 1;
const WORLD_CUP_SEASON = 2026;

const RELEVANT_COMPETITIONS = [
  "copa libertadores",
  "copa sudamericana",
  "recopa sudamericana",
];

const STATUS_ES: Record<string, string> = {
  TBD: "Por confirmar",
  NS: "Por jugar",
  "1H": "En vivo",
  HT: "Descanso",
  "2H": "En vivo",
  ET: "Tiempo extra",
  BT: "Descanso (ET)",
  P: "Penales",
  SUSP: "Suspendido",
  INT: "Interrumpido",
  FT: "Finalizado",
  AET: "Finalizado (ET)",
  PEN: "Finalizado (penales)",
  PST: "Aplazado",
  CANC: "Cancelado",
  ABD: "Abandonado",
  AWD: "Adjudicado",
  WO: "Walkover",
  LIVE: "En vivo",
};

const LIVE_CODES = new Set(["1H", "HT", "2H", "ET", "BT", "P", "LIVE"]);

interface ApiFixtureStatus {
  short: string;
  elapsed: number | null;
}

interface ApiFixture {
  fixture: {
    id: number;
    date: string;
    timestamp: number;
    status: ApiFixtureStatus;
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string; // escudo/ícono de la competición
    flag: string | null; // bandera del país (null en competiciones internacionales)
  };
  teams: {
    home: { name: string; logo: string };
    away: { name: string; logo: string };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

interface ApiFootballResponse {
  errors?: Record<string, string> | string[];
  response: ApiFixture[];
}

export interface Match {
  league: string;
  leagueLogo: string;
  country: string;
  countryFlag: string | null;
  home: string;
  away: string;
  homeLogo: string;
  awayLogo: string;
  statusCode: string;
  status: string;
  isLive: boolean;
  elapsed: string | null;
  score: { home: number | null; away: number | null };
  time: string;
  timestamp: number;
}

async function fetchFixtures(url: string): Promise<ApiFixture[]> {
  const res = await fetch(url, {
    headers: { "x-apisports-key": SPORTS_API_KEY },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`API respondió ${res.status} para ${url}`);
  }

  const data: ApiFootballResponse = await res.json();

  if (data.errors && Object.keys(data.errors).length > 0) {
    console.error("API-Football error:", data.errors, url);
    return [];
  }

  return data.response ?? [];
}

function toMatch(fixture: ApiFixture): Match {
  const statusShort = fixture.fixture.status.short;
  const isLive = LIVE_CODES.has(statusShort);
  const elapsed = fixture.fixture.status.elapsed;

  return {
    league: fixture.league.name,
    leagueLogo: fixture.league.logo,
    country: fixture.league.country,
    countryFlag: fixture.league.flag,
    home: fixture.teams.home.name,
    away: fixture.teams.away.name,
    homeLogo: fixture.teams.home.logo,
    awayLogo: fixture.teams.away.logo,
    statusCode: statusShort,
    status: STATUS_ES[statusShort] ?? statusShort,
    isLive,
    elapsed: isLive && elapsed ? `${elapsed}'` : null,
    score: { home: fixture.goals.home, away: fixture.goals.away },
    time: new Intl.DateTimeFormat("es-EC", {
      timeZone: EC_TZ,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(fixture.fixture.date)),
    timestamp: fixture.fixture.timestamp,
  };
}

export async function GET() {
  try {
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: EC_TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    const [dailyFixtures, worldCupFixtures] = await Promise.all([
      fetchFixtures(
        `https://v3.football.api-sports.io/fixtures?date=${today}&timezone=${EC_TZ}`
      ),
      fetchFixtures(
        `https://v3.football.api-sports.io/fixtures?league=${WORLD_CUP_LEAGUE_ID}&season=${WORLD_CUP_SEASON}&date=${today}&timezone=${EC_TZ}`
      ),
    ]);

    const seen = new Set<number>();
    const allFixtures: ApiFixture[] = [];
    for (const f of [...dailyFixtures, ...worldCupFixtures]) {
      if (!seen.has(f.fixture.id)) {
        seen.add(f.fixture.id);
        allFixtures.push(f);
      }
    }

    const filtered = allFixtures.filter((match) => {
      const country = (match.league.country || "").toLowerCase();
      const leagueName = (match.league.name || "").toLowerCase();
      const isWorldCup = match.league.id === WORLD_CUP_LEAGUE_ID;
      return (
        country === "ecuador" ||
        isWorldCup ||
        RELEVANT_COMPETITIONS.some((c) => leagueName.includes(c))
      );
    });

    const matches = filtered.map(toMatch).sort((a, b) => a.timestamp - b.timestamp);

    return NextResponse.json(matches);
  } catch (error) {
    console.error("Error fetching sports:", error);
    return NextResponse.json({ error: "Failed to fetch sports" }, { status: 500 });
  }
}