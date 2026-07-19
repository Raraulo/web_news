import { fetchNewsByCategory } from "@/lib/api";
import { BentoNewsGrid } from "@/components/ui/BentoNewsGrid";
import { notFound } from "next/navigation";

const CATEGORIES_MAP: Record<string, { apiCat: string | string[]; label: string; keywords?: string }> = {
  tecnologia: { apiCat: "technology", label: "Tecnología" },
  deportes: { apiCat: "sports", label: "Deportes" },
  cocina: {
    apiCat: "food",
    label: "Cocina y Salud",
    keywords: "receta OR gastronomía OR chef OR restaurante OR cocina OR comida OR saludable OR nutrición OR dieta",
  },
  clima: {
    apiCat: ["science", "environment"],
    label: "Clima y Ciencia",
    keywords: "clima OR meteorología OR tiempo OR temperatura OR huracán OR ciclón OR sequía OR tormenta OR inundación OR sostenibilidad OR cambio climático",
  },
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

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="mb-16">
        {/* Encabezado de sección */}
        <div className="border-b-2 border-black dark:border-white pb-4 mb-10">
          <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">
            Sección
          </span>
          <h1 className="text-2xl font-black tracking-tight mt-1" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
            {config.label}
          </h1>
          <p className="text-black/50 dark:text-white/50 mt-2 text-sm italic font-sans">
            Las últimas noticias sobre {config.label.toLowerCase()}.
          </p>
        </div>

        {!news.length ? (
          <p className="font-sans text-black/50 dark:text-white/50">No hay noticias en esta categoría aún.</p>
        ) : (
          <BentoNewsGrid articles={news} />
        )}
      </section>
    </div>
  );
}