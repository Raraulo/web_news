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