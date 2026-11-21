import { NextResponse } from "next/server";

interface DeezerTrack {
  position: number;
  title: string;
  artist: string;
  album: string;
  cover: string;
  preview: string;
  duration: number;
}

// Buscamos cada canción por nombre real en Deezer para traer su carátula
// y preview de audio verdaderos, en vez de placeholders.
const SEARCH_QUERIES = [
  "Python GOT7",
  "Bad Michael Jackson",
  "Caperuza Fuerza Regida",
  "Hold the Line Toto",
  "dead in your arms nightcore",
  "Acurrucar Ed Maverick",
  "Mamichula Trueno",
  "Mi Religion Jesse & Joy",
  "Devil Town Cavetown",
  "Less Than Zero The Weeknd",
];

async function searchTrack(query: string, position: number): Promise<DeezerTrack | null> {
  try {
    const res = await fetch(
      `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=1`,
      { next: { revalidate: 3600 } } // cache 1 hora
    );

    if (!res.ok) return null;

    const data = await res.json();
    const track = data?.data?.[0];

    if (!track || !track.preview) return null;

    return {
      position,
      title: track.title,
      artist: track.artist?.name ?? "Desconocido",
      album: track.album?.title ?? "",
      cover: track.album?.cover_big || track.album?.cover_medium || "",
      preview: track.preview,
      duration: track.duration ?? 30,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const results = await Promise.all(
    SEARCH_QUERIES.map((query, index) => searchTrack(query, index + 1))
  );

  const tracks = results.filter((t): t is DeezerTrack => t !== null);

  return NextResponse.json(tracks);
}