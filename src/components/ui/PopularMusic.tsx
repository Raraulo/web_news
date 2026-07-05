"use client";

import { ChevronLeft, ChevronRight, Pause, Play, Music2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MusicTrack {
  position: number;
  title: string;
  artist: string;
  album: string;
  cover: string;
  preview: string;
  duration: number;
}

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

function EqualizerBars({ active }: { active: boolean }) {
  return (
    <div className="flex items-end gap-[3px] h-4">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`w-[3px] rounded-full bg-current ${active ? "animate-eq" : "h-1.5"}`}
          style={active ? { animationDelay: `${i * 0.15}s` } : undefined}
        />
      ))}
    </div>
  );
}

export function PopularMusic() {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTrack, setActiveTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const loadTracks = async () => {
      try {
        const res = await fetch("/api/music");
        if (!res.ok) throw new Error("No se pudo cargar la lista");
        const data = await res.json();
        setTracks(Array.isArray(data) ? data : []);
      } catch {
        setTracks([]);
      } finally {
        setLoading(false);
      }
    };

    loadTracks();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!activeTrack?.preview) {
      audio.pause();
      audio.currentTime = 0;
      return;
    }

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    const playPreview = async () => {
      audio.src = activeTrack.preview;
      audio.load();
      try {
        await audio.play();
        setIsPlaying(true);
        setProgress(0);
      } catch {
        setIsPlaying(false);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    void playPreview();

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [activeTrack]);

  const togglePlayback = (track: MusicTrack) => {
    if (!track.preview) return;

    const isCurrentTrack =
      activeTrack?.title === track.title && activeTrack?.artist === track.artist;

    if (isCurrentTrack) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
        setProgress(0);
      } else {
        audioRef.current?.play().catch(() => setIsPlaying(false));
        setIsPlaying(true);
      }
      return;
    }

    setActiveTrack(track);
    setCurrentIndex(tracks.findIndex((item) => item.title === track.title && item.artist === track.artist));
  };

  const visibleTrack = tracks[currentIndex] ?? activeTrack ?? tracks[0];

  const isVisibleTrackPlaying =
    isPlaying &&
    activeTrack?.title === visibleTrack?.title &&
    activeTrack?.artist === visibleTrack?.artist;

  const goToPrevious = () => {
    const nextIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
    setCurrentIndex(nextIndex);
    setActiveTrack(tracks[nextIndex]);
    setProgress(0);
  };

  const goToNext = () => {
    const nextIndex = currentIndex === tracks.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(nextIndex);
    setActiveTrack(tracks[nextIndex]);
    setProgress(0);
  };

  return (
    <section className="mt-16 border-t border-black/10 pt-10 dark:border-white/10">
      <style jsx global>{`
        @keyframes eq-bounce {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        .animate-eq {
          animation: eq-bounce 0.9s ease-in-out infinite;
        }
        @keyframes fade-scale-in {
          from { opacity: 0; transform: scale(1.04); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-cover-in {
          animation: fade-scale-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes list-item-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-list-item {
          animation: list-item-in 0.4s ease-out both;
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(0,0,0,0.15); }
          70% { box-shadow: 0 0 0 10px rgba(0,0,0,0); }
          100% { box-shadow: 0 0 0 0 rgba(0,0,0,0); }
        }
        .animate-pulse-ring {
          animation: pulse-ring 1.8s ease-out infinite;
        }
        /* Zoom lento y continuo estilo "Ken Burns", como YouTube Music */
        @keyframes slow-zoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.12); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 18s ease-in-out infinite alternate;
        }
        .animate-slow-zoom-paused {
          animation-play-state: paused;
        }
      `}</style>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-black/40 dark:text-white/40">
            Música
          </p>
          <h2
            className="text-3xl font-black tracking-tight sm:text-4xl"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Las 10 más escuchadas
          </h2>
        </div>
        <div className="rounded-full border border-black/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-black/50 dark:border-white/10 dark:text-white/50">
          Preview de 30s
        </div>
      </div>

      {loading ? (
        <div className="rounded-[2rem] border border-black/10 p-8 text-sm text-black/60 dark:border-white/10 dark:text-white/60 animate-pulse">
          Cargando canciones...
        </div>
      ) : tracks.length === 0 ? (
        <div className="rounded-[2rem] border border-black/10 p-8 text-sm text-black/60 dark:border-white/10 dark:text-white/60">
          No hay canciones disponibles por ahora.
        </div>
      ) : (
        <div className="rounded-[2rem] border border-black/10 bg-gradient-to-br from-white via-white to-black/[0.03] p-4 shadow-sm dark:border-white/10 dark:from-white/5 dark:via-white/5 dark:to-black/20 sm:p-6 transition-shadow duration-500">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="w-full lg:w-[38%]">
              <div className="relative overflow-hidden rounded-[1.5rem] border border-black/10 bg-black/5 p-2 dark:border-white/10 dark:bg-white/10">
                <div key={currentIndex} className="animate-cover-in overflow-hidden rounded-[1.2rem]">
                  <img
                    src={
                      visibleTrack?.cover ||
                      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80"
                    }
                    alt={`${visibleTrack?.title ?? "Canción"} cover`}
                    className={`h-[360px] w-full rounded-[1.2rem] object-cover sm:h-[460px] animate-slow-zoom ${
                      isVisibleTrackPlaying ? "" : "animate-slow-zoom-paused"
                    }`}
                  />
                </div>
                <div className="absolute inset-0 flex items-end rounded-[1.2rem] bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 sm:p-6">
                  <div className="text-white">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/70">
                      #{visibleTrack?.position ?? 1}
                    </p>
                    <h3 className="mt-1 text-2xl font-black sm:text-3xl">{visibleTrack?.title}</h3>
                    <p className="text-sm text-white/90">{visibleTrack?.artist}</p>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-white/70">
                      {visibleTrack?.album || "Sin álbum"} • {formatDuration(visibleTrack?.duration ?? 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Barra de progreso sincronizada con el audio */}
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-black transition-[width] duration-150 ease-linear dark:bg-white"
                  style={{
                    width: `${isVisibleTrackPlaying || progress > 0 ? progress : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex-1">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-black/40 dark:text-white/40">
                    Reproduciendo ahora
                    {isVisibleTrackPlaying && <EqualizerBars active />}
                  </p>
                  <p className="text-lg font-semibold">{visibleTrack?.title}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={goToPrevious}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-black transition-all duration-200 hover:scale-110 active:scale-95 dark:border-white/10 dark:bg-black dark:text-white"
                    aria-label="Canción anterior"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={goToNext}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-black transition-all duration-200 hover:scale-110 active:scale-95 dark:border-white/10 dark:bg-black dark:text-white"
                    aria-label="Siguiente canción"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {tracks.map((track, index) => {
                  const isCurrentTrack =
                    activeTrack?.title === track.title && activeTrack?.artist === track.artist;
                  const isVisible = index === currentIndex;
                  const isCurrentlyPlaying = isCurrentTrack && isPlaying;

                  return (
                    <button
                      key={`${track.title}-${track.artist}`}
                      type="button"
                      onClick={() => {
                        setCurrentIndex(index);
                        togglePlayback(track);
                      }}
                      style={{ animationDelay: `${index * 0.05}s` }}
                      className={`animate-list-item flex items-center gap-3 rounded-2xl border p-3 text-left transition-all duration-300 ${
                        isVisible
                          ? "border-black/20 bg-black text-white scale-[1.02] shadow-md dark:border-white/20 dark:bg-white dark:text-black"
                          : "border-black/10 bg-white/70 hover:scale-[1.01] hover:border-black/20 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
                      }`}
                    >
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black/5 text-black/40 dark:bg-white/10 dark:text-white/40">
                        {track.cover ? (
                          <img src={track.cover} alt={`${track.title} cover`} className="h-full w-full rounded-xl object-cover" />
                        ) : (
                          <Music2 size={18} />
                        )}
                        {isCurrentlyPlaying && (
                          <span className="absolute inset-0 rounded-xl animate-pulse-ring" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-70">
                            #{track.position}
                          </span>
                          <p className="truncate text-sm font-semibold">{track.title}</p>
                        </div>
                        <p className="truncate text-sm opacity-70">{track.artist}</p>
                      </div>
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-current/20 transition-transform duration-200 hover:scale-110">
                        {isCurrentlyPlaying ? (
                          <Pause size={14} />
                        ) : (
                          <Play size={14} className="ml-0.5" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}