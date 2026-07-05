import { NextResponse } from "next/server";

const SPORTS_API_KEY = "abfbc518c90c5b93903b6033fbdab836";

export async function GET() {
  try {
    const headers = {
      "x-apisports-key": SPORTS_API_KEY,
    };

    const today = new Date().toISOString().split("T")[0];

    // Solo fútbol según lo solicitado
    const footballRes = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}`, { headers, next: { revalidate: 300 } });
    const footballData = await footballRes.json();

    const matches: any[] = [];

    if (footballData.response) {
      // Filtros estrictos para que no colisione con otras ligas (como "champions" con "championship" o "pro" con "MLS Next Pro")
      const allowedLeagues = [
        "ecuador", "liga pro", // Serie A Ecuador / Liga Pro
        "world cup", "mundial", // Mundial
        "libertadores", // Libertadores
        "sudamericana" // Sudamericana
      ];
      
      const filteredMatches = footballData.response.filter((match: any) => {
        const leagueName = match.league.name.toLowerCase();
        return allowedLeagues.some(l => leagueName.includes(l));
      });

      // Tomamos hasta 10 partidos para el ticker
      filteredMatches.slice(0, 10).forEach((match: any) => {
        matches.push({
          sport: "Fútbol",
          league: match.league.name,
          home: match.teams.home.name,
          away: match.teams.away.name,
          status: match.fixture.status.short,
          score: `${match.goals.home ?? "-"} - ${match.goals.away ?? "-"}`,
          time: new Date(match.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      });
    }

    return NextResponse.json(matches);
  } catch (error) {
    console.error("Error fetching sports:", error);
    return NextResponse.json({ error: "Failed to fetch sports" }, { status: 500 });
  }
}
