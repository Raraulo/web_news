import { NewsArticle } from "@/components/ui/NewsCard";

const API_KEY = "pub_25e3612e97354c12bd1e2c6a39c35478";

function getMockData(displayCategory: string): NewsArticle[] {
  return [
    {
      id: "mock-1",
      title: `Noticia destacada de ${displayCategory} (Fallback por límite de API)`,
      excerpt: "Esta es una noticia de respaldo porque se ha excedido el límite de peticiones de la API (Error 429). Prueba de nuevo más tarde.",
      category: displayCategory,
      imageUrl: null,
      author: "Sistema",
      date: new Date().toLocaleDateString('es-ES')
    },
    {
      id: "mock-2",
      title: `Última hora en ${displayCategory}`,
      excerpt: "Segunda noticia de respaldo para mantener el diseño visual tipo Bento Grid.",
      category: displayCategory,
      imageUrl: null,
      author: "Sistema",
      date: new Date().toLocaleDateString('es-ES')
    },
    {
      id: "mock-3",
      title: `Actualidad: ${displayCategory} en el mundo`,
      excerpt: "Tercera noticia de respaldo para la vista.",
      category: displayCategory,
      imageUrl: null,
      author: "Sistema",
      date: new Date().toLocaleDateString('es-ES')
    },
    {
      id: "mock-4",
      title: `Novedades sobre ${displayCategory}`,
      excerpt: "",
      category: displayCategory,
      imageUrl: null,
      author: "Sistema",
      date: new Date().toLocaleDateString('es-ES')
    },
    {
      id: "mock-5",
      title: `Resumen de la semana en ${displayCategory}`,
      excerpt: "",
      category: displayCategory,
      imageUrl: null,
      author: "Sistema",
      date: new Date().toLocaleDateString('es-ES')
    }
  ];
}

const CATEGORY_TRANSLATIONS: Record<string, string> = {
  technology: "Tecnología",
  sports: "Deportes",
  food: "Cocina",
  science: "Ciencia",
  entertainment: "Entretenimiento",
  top: "Destacado",
  world: "Mundo",
  business: "Negocios",
  health: "Salud",
  politics: "Política",
  environment: "Ambiente",
  tourism: "Turismo"
};

function getCategoryName(apiCategories: string[] | undefined, fallback: string): string {
  if (!apiCategories || apiCategories.length === 0) return fallback;
  const mainCat = apiCategories.find(c => c !== "top") || apiCategories[0];
  return CATEGORY_TRANSLATIONS[mainCat] || fallback;
}

export async function fetchNewsByCategory(category: string, displayCategory: string): Promise<NewsArticle[]> {
  try {
    // Ecuador, UK (gb), Rusia, China
    const countries = "ec,gb,ru,cn"; 

    // Solo en español ("obvio en español")
    const url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&language=es&category=${category}&country=${countries}`;
    const response = await fetch(url, {
      next: { revalidate: 3600 }
    });
    
    if (!response.ok) {
      console.warn(`[News API] Status ${response.status} - Usando datos de respaldo.`);
      return getMockData(displayCategory);
    }

    const data = await response.json();
    
    if (!data.results) return getMockData(displayCategory);

    return data.results
      .filter((article: any) => {
        // Filtrar obligatoriamente política como pidió el usuario al principio y verificar título
        if (article.category && article.category.includes("politics")) return false;
        return article.title;
      })
      .map((article: any) => ({
        id: article.link || article.article_id,
        title: article.title,
        excerpt: article.description || "",
        category: getCategoryName(article.category, displayCategory),
        imageUrl: article.image_url || null,
        author: article.source_name || article.creator?.[0] || "Desconocido",
        date: article.pubDate ? new Date(article.pubDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : ""
      }));
  } catch (error) {
    console.warn("[News API] Error de red - Usando datos de respaldo.");
    return getMockData(displayCategory);
  }
}
