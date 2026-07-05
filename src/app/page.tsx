import { fetchNewsByCategory } from "@/lib/api";
import { NewsCard } from "@/components/ui/NewsCard";
import { LiveWeather } from "@/components/ui/LiveWeather";
import { PopularMusic } from "@/components/ui/PopularMusic";
import { YouTubeVideoGrid } from "@/components/ui/YouTubeVideoGrid";
import { StockMarket } from "@/components/ui/StockMarket";

export default async function Home() {
  const news = await fetchNewsByCategory("top", "Inicio");

  const lead = news[0];           // Noticia principal — imagen grande
  const rightGrid = news.slice(1, 5); // 4 secundarias en grid 2x2
  const row2 = news.slice(5, 9);      // Segunda fila: 4 artículos
  const row3 = news.slice(9, 20);     // Tercera fila: resto

  const today = new Date().toLocaleDateString("es-EC", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <LiveWeather />

      <section className="mb-16">
        {/* ── Encabezado ── */}
        <div className="flex items-center justify-between border-b-2 border-black dark:border-white pb-2 mb-8">
          <h1 className="text-2xl font-black tracking-tight" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
            Titulares
          </h1>
        </div>

        {/* ── FILA 1: Noticia principal + 4 secundarias ── */}
        {lead && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-b border-black/10 dark:border-white/10 pb-8 mb-8">
            {/* Principal — 7 columnas */}
            <div className="lg:col-span-7 lg:pr-8 lg:border-r border-black/10 dark:border-white/10">
              <NewsCard article={lead} isFeatured />
            </div>

            {/* 4 secundarias en grid 2x2 — 5 columnas */}
            {rightGrid.length > 0 && (
              <div className="lg:col-span-5 lg:pl-8">
                <div className="grid grid-cols-2 gap-x-6 gap-y-8">
                  {rightGrid.map((article) => (
                    <div key={article.id}>
                      <NewsCard article={article} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SECCIÓN DE VIDEO CON YOUTUBE API ── */}
        <YouTubeVideoGrid />

        {/* ── FILA 2: 4 artículos en columnas iguales (NYT "4-pack") ── */}
        {row2.length > 0 && (
          <div className="border-b border-black/10 dark:border-white/10 pb-8 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-black/10 dark:divide-white/10">
              {row2.map((article, i) => (
                <div key={article.id} className={`${i === 0 ? "pr-0 sm:pr-6" : "px-0 sm:px-6"} py-6 sm:py-0`}>
                  <NewsCard article={article} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── FILA 3: 3 columnas tipo "continuation" (NYT estilo) ── */}
        {row3.length > 0 && (
          <>
            <div className="font-sans text-[11px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40 mb-6 border-b border-black/10 dark:border-white/10 pb-2">
              Más noticias
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-black/10 dark:divide-white/10">
              {/* Columna A */}
              <div className="md:pr-8 divide-y divide-black/10 dark:divide-white/10">
                {row3.filter((_, i) => i % 3 === 0).map((article) => (
                  <div key={article.id} className="py-6 first:pt-0">
                    <NewsCard article={article} />
                  </div>
                ))}
              </div>
              {/* Columna B */}
              <div className="md:px-8 divide-y divide-black/10 dark:divide-white/10 pt-6 md:pt-0">
                {row3.filter((_, i) => i % 3 === 1).map((article) => (
                  <div key={article.id} className="py-6 first:pt-0">
                    <NewsCard article={article} />
                  </div>
                ))}
              </div>
              {/* Columna C */}
              <div className="md:pl-8 divide-y divide-black/10 dark:divide-white/10 pt-6 md:pt-0">
                {row3.filter((_, i) => i % 3 === 2).map((article) => (
                  <div key={article.id} className="py-6 first:pt-0">
                    <NewsCard article={article} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <StockMarket />
        <PopularMusic />
      </section>
    </div>
  );
}