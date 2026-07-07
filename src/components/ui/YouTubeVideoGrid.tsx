"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

// Cascada de calidad de miniatura: si la más alta no existe, cae a la siguiente
const THUMB_QUALITIES = ["maxresdefault", "sddefault", "hqdefault", "mqdefault"];

// Recordamos globalmente qué videoIds ya sabemos que tienen el embed bloqueado,
// así no volvemos a intentar cargar el player cada vez que se hace hover.
const blockedEmbeds = new Set<string>();

// Carga la API de YouTube una sola vez para toda la página (singleton)
let ytApiPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT && window.YT.Player) return Promise.resolve();
  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise((resolve) => {
    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prevCallback?.();
      resolve();
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });

  return ytApiPromise;
}

interface VideoCardProps {
  videoId: string;
  title: string;
  onClick: (id: string) => void;
}

function YouTubeHoverCard({ videoId, title, onClick }: VideoCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [thumbLevel, setThumbLevel] = useState(0);
  const [embedBlocked, setEmbedBlocked] = useState(blockedEmbeds.has(videoId));

  const thumbSrc = `https://i.ytimg.com/vi/${videoId}/${THUMB_QUALITIES[thumbLevel]}.jpg`;

  const handleImgError = () => {
    setThumbLevel((prev) => Math.min(prev + 1, THUMB_QUALITIES.length - 1));
  };

  useEffect(() => {
    if (!isHovered || embedBlocked) return;

    let destroyed = false;

    loadYouTubeApi().then(() => {
      if (destroyed || !containerRef.current) return;

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          mute: 1,
          playsinline: 1,
          rel: 0,
          loop: 1,
          playlist: videoId, // necesario para que loop:1 funcione en un solo video
        },
        events: {
          onReady: (e: any) => {
            if (destroyed) return;
            e.target.playVideo();
          },
          onStateChange: (e: any) => {
            if (e.data === 1) setPreviewPlaying(true);
          },
          onError: (e: any) => {
            // 101 y 150 = el dueño del video desactivó la reproducción externa
            if (e.data === 101 || e.data === 150) {
              blockedEmbeds.add(videoId);
              setEmbedBlocked(true);
            }
          },
        },
      });
    });

    return () => {
      destroyed = true;
      setPreviewPlaying(false);
      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [isHovered, embedBlocked, videoId]);

  const handleClick = () => {
    if (embedBlocked) {
      window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank");
      return;
    }
    onClick(videoId);
  };

  return (
    <div
      className={`relative aspect-[9/16] rounded-lg overflow-hidden group cursor-pointer transition-transform duration-500 ease-out ${isHovered ? "scale-105 z-10 shadow-2xl" : "scale-100 z-0"
        }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setPreviewPlaying(false);
      }}
      onClick={handleClick}
    >
      {/* Miniatura, siempre presente como base */}
      <img
        src={thumbSrc}
        onError={handleImgError}
        alt={title}
        loading="lazy"
        className={`absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-300 ${previewPlaying && !embedBlocked ? "opacity-0" : "opacity-100"
          }`}
      />

      {/* Preview real, solo si el embed no está bloqueado */}
      {isHovered && !embedBlocked && (
        <div className="absolute inset-0 bg-black overflow-hidden z-0">
          <div
            className={`w-full h-full scale-[1.3] transition-opacity duration-300 ${previewPlaying ? "opacity-100" : "opacity-0"
              }`}
          >
            <div ref={containerRef} className="w-full h-full pointer-events-none" />
          </div>
        </div>
      )}

      {/* Spinner mientras carga el preview */}
      {isHovered && !embedBlocked && !previewPlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/20">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Overlay limpio cuando el embed está bloqueado, en vez del error feo de YouTube */}
      {isHovered && embedBlocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-20 bg-black/70 text-white text-center px-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
          <p className="text-xs font-semibold">No disponible aquí</p>
          <p className="text-[11px] text-white/70">Toca para verlo en YouTube</p>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none transition-opacity duration-300 group-hover:opacity-60 z-30" />

      <div className="absolute bottom-0 left-0 right-0 p-4 text-white pointer-events-none z-30">
        <div className="flex items-center gap-1 text-xs font-semibold mb-2 text-red-500">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          EN VIVO / SHORTS
        </div>
        <h3 className="font-bold text-sm leading-tight line-clamp-3 shadow-black drop-shadow-md">
          {title}
        </h3>
      </div>
    </div>
  );
}

export function YouTubeVideoGrid() {
  const [videos, setVideos] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/youtube")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setVideos(data);
        } else {
          setVideos([
            { id: "nK7VKTVlJ9A", title: "#ENVIVO | Noticiero de Ecuador, Emisión Central" },
            { id: "Sr39HMTo31E", title: "Refugio del volcán Guagua Pichincha, Quito" },
          ]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando videos", err);
        setLoading(false);
      });
  }, []);

  const handleCardClick = (id: string) => {
    if (blockedEmbeds.has(id)) {
      window.open(`https://www.youtube.com/watch?v=${id}`, "_blank");
      return;
    }
    setActiveVideoId(id);
  };

  return (
    <div className="mb-12">
      <h2
        className="text-2xl font-black mb-6"
        style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
      >
        Videos - Últimas Noticias
      </h2>

      {loading ? (
        <div className="flex gap-4 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-1 aspect-[9/16] bg-black/10 dark:bg-white/10 rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {videos.map((video) => (
            <YouTubeHoverCard
              key={video.id}
              videoId={video.id}
              title={video.title}
              onClick={handleCardClick}
            />
          ))}
        </div>
      )}

      {/* Modal para ver video completo con sonido */}
      {activeVideoId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setActiveVideoId(null)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
              onClick={() => setActiveVideoId(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&mute=0&modestbranding=1&rel=0`}
              allow="autoplay; encrypted-media; fullscreen"
              className="w-full h-full border-0"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
// =================================================================
// The Metropolitan Museum of Art — Collection API
// Imagen grande a la izquierda con efecto Ken Burns, ficha editorial a la derecha
// Docs: https://metmuseum.github.io/
// =================================================================

interface MetObject {
  objectID: number;
  title: string;
  artistDisplayName: string;
  objectDate: string;
  medium: string;
  department: string;
  primaryImage: string;
  creditLine: string;
  objectURL: string;
}

const MET_SEARCH_URL =
  "https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=painting";
const MET_OBJECT_URL = "https://collectionapi.metmuseum.org/public/collection/v1/objects";

async function fetchRandomMetObject(attempts = 6): Promise<MetObject | null> {
  try {
    const searchRes = await fetch(MET_SEARCH_URL);
    const searchData = await searchRes.json();
    const ids: number[] = searchData.objectIDs ?? [];
    if (ids.length === 0) return null;

    for (let i = 0; i < attempts; i++) {
      const randomId = ids[Math.floor(Math.random() * ids.length)];
      const objRes = await fetch(`${MET_OBJECT_URL}/${randomId}`);
      if (!objRes.ok) continue;
      const obj: MetObject = await objRes.json();
      if (obj.primaryImage) return obj;
    }
    return null;
  } catch (e) {
    console.error("Error cargando obra del Met", e);
    return null;
  }
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 17L17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

export function MetMuseumHighlight() {
  const [artwork, setArtwork] = useState<MetObject | null>(null);
  const [loading, setLoading] = useState(true);
  // Primero mostramos la obra completa, sin recortar (object-contain).
  // Recién después de un momento pasamos al modo Ken Burns (object-cover + zoom).
  const [kenBurnsActive, setKenBurnsActive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchRandomMetObject().then((obj) => {
      if (!cancelled) {
        setArtwork(obj);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!artwork) return;
    setKenBurnsActive(false);
    // Le damos tiempo al usuario de ver la obra completa antes de animar
    const timer = setTimeout(() => setKenBurnsActive(true), 2200);
    return () => clearTimeout(timer);
  }, [artwork]);

  if (loading) {
    return (
      <div className="mb-16 flex flex-col md:flex-row gap-10 animate-pulse">
        <div className="w-full md:w-3/5 aspect-[4/5] bg-black/10 dark:bg-white/10 rounded-xl" />
        <div className="w-full md:w-2/5 space-y-4 pt-4">
          <div className="h-3 w-1/3 bg-black/10 dark:bg-white/10 rounded" />
          <div className="h-9 w-3/4 bg-black/10 dark:bg-white/10 rounded" />
          <div className="h-5 w-1/2 bg-black/10 dark:bg-white/10 rounded" />
          <div className="h-4 w-1/4 bg-black/10 dark:bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  if (!artwork) {
    return null;
  }

  return (
    <div className="mb-16">
      {/* Encabezado de sección con línea editorial, igual patrón que "Más noticias" */}
      <div className="flex items-center justify-between border-b-2 border-black dark:border-white pb-2 mb-8">
        <h2
          className="text-2xl font-black tracking-tight"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          Arte
        </h2>
        <span className="text-[11px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">
          The Metropolitan Museum of Art
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-10 items-stretch">
        {/* Imagen grande con efecto Ken Burns: zoom lento in/out en loop */}
        <a
          href={artwork.objectURL}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative w-full md:w-3/5 shrink-0 overflow-hidden rounded-xl border border-black/10 dark:border-white/10 shadow-md bg-black/5 dark:bg-white/5"
        >
          <div className="relative w-full aspect-[4/5] md:aspect-[16/11] overflow-hidden bg-black/5 dark:bg-white/5">
            {/* Paso 1: la obra completa, tal cual viene de la API, sin recortar */}
            <img
              src={artwork.primaryImage}
              alt={artwork.title || "Obra del Met"}
              className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-[1200ms] ease-in-out ${kenBurnsActive ? "opacity-0" : "opacity-100"
                }`}
            />
            {/* Paso 2: recién después de mostrarla completa, pasamos al Ken Burns
                (solo escala, sin traslación, para que nunca se asomen bordes vacíos) */}
            <img
              src={artwork.primaryImage}
              alt={artwork.title || "Obra del Met"}
              className={`met-kenburns absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ease-in-out ${kenBurnsActive ? "opacity-100" : "opacity-0"
                }`}
              style={{ animationPlayState: kenBurnsActive ? "running" : "paused" }}
            />
            {/* Degradado inferior para legibilidad si se superpone texto en móvil */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          </div>

          {/* Overlay de acción, aparece sutil al hover */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-white bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Ver en The Met
            <ArrowIcon />
          </div>
        </a>

        {/* Ficha editorial a la derecha */}
        <div className="w-full md:w-2/5 flex flex-col justify-center py-2">
          {artwork.department && (
            <span className="inline-block w-fit text-[11px] font-bold uppercase tracking-[0.2em] text-red-600 dark:text-red-500 mb-3">
              {artwork.department}
            </span>
          )}

          <h3
            className="text-3xl md:text-[2.15rem] font-black leading-[1.1] mb-3 text-black dark:text-white"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            {artwork.title || "Sin título"}
          </h3>

          <p
            className="text-lg text-black/75 dark:text-white/75 mb-1 italic"
            style={{ fontFamily: "var(--font-garamond), Georgia, serif" }}
          >
            {artwork.artistDisplayName || "Artista desconocido"}
          </p>

          <p className="text-sm font-semibold text-black/50 dark:text-white/50 mb-6 tracking-wide">
            {artwork.objectDate}
          </p>

          <div className="border-t border-black/10 dark:border-white/10 pt-5 space-y-2">
            {artwork.medium && (
              <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed">
                <span className="font-semibold text-black/40 dark:text-white/40 uppercase text-[10px] tracking-wider block mb-1">
                  Técnica
                </span>
                {artwork.medium}
              </p>
            )}
            {artwork.creditLine && (
              <p className="text-xs text-black/40 dark:text-white/40 italic leading-relaxed pt-2">
                {artwork.creditLine}
              </p>
            )}
          </div>

          <a
            href={artwork.objectURL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 w-fit text-sm font-semibold text-black dark:text-white border-b-2 border-black dark:border-white pb-0.5 hover:gap-3 transition-all duration-200"
          >
            Explorar la colección
            <ArrowIcon />
          </a>
        </div>
      </div>

      {/* Animación Ken Burns: zoom lento hacia adentro y hacia afuera en loop, como YouTube Music */}
      <style jsx global>{`
        @keyframes met-kenburns-anim {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.08);
          }
          100% {
            transform: scale(1);
          }
        }
        .met-kenburns {
          transform-origin: center center;
          animation: met-kenburns-anim 18s ease-in-out infinite;
          animation-play-state: paused;
          will-change: transform;
        }
      `}</style>
    </div>
  );
}