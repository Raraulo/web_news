import { fetchNewsByCategory } from "@/lib/api";
import { BentoNewsGrid } from "@/components/ui/BentoNewsGrid";
import { LiveWeather } from "@/components/ui/LiveWeather";
import { PopularMusic } from "@/components/ui/PopularMusic";
import { YouTubeVideoGrid } from "@/components/ui/YouTubeVideoGrid";
import { MetMuseumHighlight } from "@/components/ui/YouTubeVideoGrid";
import { StockMarket } from "@/components/ui/StockMarket";

export default async function Home() {
  const news = await fetchNewsByCategory("top", "Inicio");

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

        {/* ── BENTO GRID DE NOTICIAS ── */}
        {news.length > 0 && (
          <div className="mb-12">
            <BentoNewsGrid articles={news} />
          </div>
        )}

        {/* ── SECCIÓN DE VIDEO CON YOUTUBE API ── */}
        <YouTubeVideoGrid />

        {/* ── OBRA DESTACADA — THE MET ── */}
        <MetMuseumHighlight />

        <StockMarket />
        <PopularMusic />
      </section>
    </div>
  );
}