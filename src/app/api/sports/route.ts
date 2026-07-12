// app/api/sports/route.ts
import { NextResponse } from "next/server";

const EC_TZ = "America/Guayaquil";

const ESPN_LEAGUES = [
  "ecu.1",
  "conmebol.libertadores",
  "conmebol.sudamericana",
  "fifa.world",
];

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

function translateStatus(state: string, detail: string): string {
  if (state === "pre") return "Por jugar";
  if (state === "post") return "Finalizado";
  if (state === "in") {
    if (detail.toLowerCase().includes("half")) return "Descanso";
    return "En vivo";
  }
  return detail;
}

async function fetchEspnLeague(leagueCode: string, dateStr: string): Promise<Match[]> {
  const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${leagueCode}/scoreboard?dates=${dateStr}`;
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) {
      console.error(`ESPN API responded ${res.status} for ${url}`);
      return [];
    }
    const data = await res.json();
    if (!data.events || !data.leagues) return [];

    const leagueName = data.leagues[0]?.name || "Fútbol";
    const leagueLogo = data.leagues[0]?.logos?.[0]?.href || "";

    return data.events.map((event: any): Match => {
      const comp = event.competitions[0];
      const homeTeam = comp.competitors.find((c: any) => c.homeAway === "home");
      const awayTeam = comp.competitors.find((c: any) => c.homeAway === "away");
      
      const statusType = comp.status.type;
      const isLive = statusType.state === "in";
      const timestamp = new Date(event.date).getTime() / 1000;

      const isPre = statusType.state === "pre";
      const homeScore = homeTeam?.score ? parseInt(homeTeam.score, 10) : null;
      const awayScore = awayTeam?.score ? parseInt(awayTeam.score, 10) : null;

      return {
        league: leagueName,
        leagueLogo,
        country: "",
        countryFlag: null,
        home: homeTeam?.team?.name || "Local",
        away: awayTeam?.team?.name || "Visitante",
        homeLogo: homeTeam?.team?.logo || "",
        awayLogo: awayTeam?.team?.logo || "",
        statusCode: statusType.state,
        status: translateStatus(statusType.state, statusType.shortDetail),
        isLive,
        elapsed: isLive ? comp.status.displayClock : null,
        score: {
          home: isPre || isNaN(homeScore as any) ? null : homeScore,
          away: isPre || isNaN(awayScore as any) ? null : awayScore,
        },
        time: new Intl.DateTimeFormat("en-US", {
          timeZone: EC_TZ,
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).format(new Date(event.date)) + " (EC)",
        timestamp,
      };
    });
  } catch (err) {
    console.error("Error fetching ESPN league", leagueCode, err);
    return [];
  }
}

export async function GET() {
  try {
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: EC_TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .format(new Date())
      .replace(/-/g, ""); // Returns YYYYMMDD

    const promises = ESPN_LEAGUES.map((league) => fetchEspnLeague(league, today));
    const results = await Promise.all(promises);
    
    // Flatten and sort by time
    const matches = results.flat().sort((a, b) => a.timestamp - b.timestamp);

    return NextResponse.json(matches);
  } catch (error) {
    console.error("Error fetching sports:", error);
    return NextResponse.json({ error: "Failed to fetch sports" }, { status: 500 });
  }
}