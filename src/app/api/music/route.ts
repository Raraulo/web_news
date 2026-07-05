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
  "Die With A Smile Lady Gaga Bruno Mars",
  "APT. ROSÉ Bruno Mars",
  "Timeless The Weeknd Playboi Carti",
  "Birds of a Feather Billie Eilish",
  "Espresso Sabrina Carpenter",
  "Cruel Summer Taylor Swift",
  "Fuerza Regida TQM",
  "Python GOT7",
  "Doping Jossimar",
  "Blinding Lights The Weeknd",
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