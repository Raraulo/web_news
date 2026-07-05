import { fetchNewsByCategory } from "@/lib/api";
import { NewsCard } from "@/components/ui/NewsCard";
import { notFound } from "next/navigation";

const CATEGORIES_MAP: Record<string, { apiCat: string; label: string; keywords?: string }> = {
  tecnologia: { apiCat: "technology", label: "Tecnología" },
  deportes: { apiCat: "sports", label: "Deportes" },
  cocina: { apiCat: "food", label: "Cocina y Salud" },
  clima: { apiCat: "science", label: "Clima y Ciencia" },
  moda: { apiCat: "entertainment", label: "Moda y Entretenimiento" },
  // Nueva categoría: newsdata.io no tiene "cine" o "música" como categorías propias,
  // así que reutilizamos "entertainment" pero afinamos con keywords para que salgan
  // resultados de cine/música en vez de moda/celebridades genéricas.
  "cine-musica": {
    apiCat: "entertainment",
    label: "Cine y Música",
    keywords: "cine OR película OR música OR concierto OR álbum OR estreno",
  },
};

export function generateStaticParams() {
  return Object.keys(CATEGORIES_MAP).map((category) => ({ category }));
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const config = CATEGORIES_MAP[category];

  if (!config) notFound();

  const news = await fetchNewsByCategory(config.apiCat, config.label, config.keywords);

  const lead = news[0];
  const rightGrid = news.slice(1, 5);
  const row2 = news.slice(5, 9);
  const row3 = news.slice(9);

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="mb-16">
        {/* Encabezado de sección */}
        <div className="border-b-2 border-black dark:border-white pb-4 mb-10">
          <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">
            Sección
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mt-1" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
            {config.label}
          </h1>
          <p className="text-black/50 dark:text-white/50 mt-2 text-sm italic font-sans">
            Las últimas noticias sobre {config.label.toLowerCase()}.
          </p>
        </div>

        {!lead ? (
          <p className="font-sans text-black/50 dark:text-white/50">No hay noticias en esta categoría aún.</p>
        ) : (
          <>
            {/* FILA 1: Noticia principal + 4 secundarias */}
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

            {/* FILA 2: 4-pack */}
            {row2.length > 0 && (
              <div className="border-b border-black/10 dark:border-white/10 pb-8 mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-black/10 dark:divide-white/10">
                  {row2.map((article, i) => (
                    <div key={article.id} className={`${i === 0 ? "sm:pr-6" : "sm:px-6"} py-6 sm:py-0`}>
                      <NewsCard article={article} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FILA 3: 3 columnas con dividers */}
            {row3.length > 0 && (
              <>
                <div className="font-sans text-[11px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40 mb-6 border-b border-black/10 dark:border-white/10 pb-2">
                  Más en {config.label}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-black/10 dark:divide-white/10">
                  <div className="md:pr-8 divide-y divide-black/10 dark:divide-white/10">
                    {row3.filter((_, i) => i % 3 === 0).map((article) => (
                      <div key={article.id} className="py-6 first:pt-0">
                        <NewsCard article={article} />
                      </div>
                    ))}
                  </div>
                  <div className="md:px-8 divide-y divide-black/10 dark:divide-white/10 pt-6 md:pt-0">
                    {row3.filter((_, i) => i % 3 === 1).map((article) => (
                      <div key={article.id} className="py-6 first:pt-0">
                        <NewsCard article={article} />
                      </div>
                    ))}
                  </div>
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
          </>
        )}
      </section>
    </div>
  );
}