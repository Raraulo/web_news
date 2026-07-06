import { NewsArticle } from "@/components/ui/NewsCard";

const API_KEY = "pub_25e3612e97354c12bd1e2c6a39c35478";

/**
 * Fuentes permitidas.
 *
 * Usamos `domainurl` (con TLD completo, ej. "elcomercio.com") en vez de
 * `domain` (slug corto). Esto es CLAVE: descubrimos que el slug corto
 * "elcomercio" en newsdata.io está asignado a El Comercio de PERÚ
 * (source_id=elcomercio, country=peru), no al de Ecuador. Usando
 * `domainurl=elcomercio.com` apuntamos al dominio exacto y evitamos esa
 * colisión.
 *
 * `requireCountry` sigue como red de seguridad extra para los medios
 * ecuatorianos, por si igual se cuela algo con el dominio equivocado.
 */
const ALLOWED_SOURCES = [
  { domainurl: "bbc.com", aliases: ["bbc", "bbc.com", "bbc.co.uk", "bbc news", "bbc mundo"] },
  { domainurl: "cnnespanol.cnn.com", aliases: ["cnn", "cnn.com", "cnnespanol", "cnn en español", "cnn español"] },
  { domainurl: "reuters.com", aliases: ["reuters", "reuters.com"] },
  { domainurl: "apnews.com", aliases: ["apnews", "ap news", "associated press", "apnews.com"] },
  { domainurl: "dw.com", aliases: ["dw", "dw.com", "deutsche welle"] },
  {
    domainurl: "eluniverso.com",
    aliases: ["eluniverso.com"], // sin alias corto "el universo" para no matchear por nombre solamente
    requireCountry: ["ec", "ecuador"]
  },
  {
    domainurl: "elcomercio.com",
    aliases: ["elcomercio.com"], // sin alias corto "el comercio" - eso es lo que causaba la colisión con Perú
    requireCountry: ["ec", "ecuador"]
  }
];

const MAX_DOMAINS_PER_REQUEST = 5; // límite del plan Free/Basic de newsdata.io

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

const DOMAIN_BATCHES = chunk(ALLOWED_SOURCES.map((s) => s.domainurl), MAX_DOMAINS_PER_REQUEST);

type NewsDataArticle = {
  link?: string;
  article_id?: string;
  title?: string;
  description?: string;
  category?: string[];
  image_url?: string;
  source_name?: string;
  source_id?: string;
  creator?: string[];
  pubDate?: string;
  language?: string;
  country?: string[];
};

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

function normalizeSearchTokens(keywords?: string): string[] {
  if (!keywords) return [];
  return keywords
    .split(/\s+OR\s+/i)
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
}

function articleMatchesKeywords(article: NewsDataArticle, tokens: string[]): boolean {
  const text = [article.title, article.description]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return tokens.some((token) => text.includes(token));
}

function articleMatchesCategory(article: NewsDataArticle, categories: string[]): boolean {
  if (!article.category) return false;
  const lowered = article.category.map((c) => c.toLowerCase());
  return categories.some((category) => lowered.includes(category.toLowerCase()));
}

function passesStrictFilter(article: NewsDataArticle, allowAnySource: boolean = false): boolean {
  const sourceId = (article.source_id || "").toLowerCase();
  const sourceName = (article.source_name || "").toLowerCase();
  const link = (article.link || "").toLowerCase();
  const language = (article.language || "").toLowerCase();
  const countryField: string[] = (article.country || []).map((c: string) => c.toLowerCase());

  if (language && language !== "spanish" && language !== "es") return false;
  if (allowAnySource) return true;

  const matchedSource = ALLOWED_SOURCES.find(({ aliases }) =>
    aliases.some(
      (alias) =>
        sourceId.includes(alias) ||
        sourceName.includes(alias) ||
        link.includes(alias)
    )
  );

  if (!matchedSource) return false;

  if (matchedSource.requireCountry) {
    const isFromRequiredCountry = countryField.some((c) =>
      matchedSource.requireCountry!.includes(c)
    );
    if (!isFromRequiredCountry) return false;
  }

  return true;
}

function splitKeywordQueries(keywords: string, maxLength: number = 100): string[] {
  const tokens = keywords.split(/\s+OR\s+/i).map((token) => token.trim()).filter(Boolean);
  const queries: string[] = [];
  let current = "";

  for (const token of tokens) {
    const candidate = current ? `${current} OR ${token}` : token;
    const encodedLength = encodeURIComponent(candidate).length;

    if (encodedLength > maxLength) {
      if (current) {
        queries.push(current);
        current = token;
      } else {
        queries.push(token);
      }
    } else {
      current = candidate;
    }
  }

  if (current) {
    queries.push(current);
  }

  return queries;
}

/**
 * Hace una sola petición a newsdata.io con un lote de hasta 5 domainurl.
 * NOTA: para la categoría "top" NO mandamos el parámetro `category`, porque
 * combinar domainurl (fuentes muy específicas) + category=top + language=es
 * da una intersección casi siempre vacía (top es una categoría curada de
 * newsdata sobre miles de fuentes; exigir que además sea de tus 7 fuentes
 * puntuales y en español, en el mismo instante, suele dar 0 resultados).
 * Para el resto de categorías (deportes, tecnología, etc.) sí lo mandamos,
 * porque ahí category sí filtra por el tema real de la noticia.
 */
// Categorías donde NO mandamos `category=` a newsdata.io porque la
// intersección con domainurl (nuestras 7 fuentes) + language=es da
// prácticamente 0 resultados: son fuentes de noticias duras que casi
// nunca taguean su contenido bajo estas categorías internamente.
// En estos casos confiamos en `keywords` (parámetro q) para encontrar
// lo poco que sí publican sobre el tema.
const SKIP_CATEGORY_PARAM = ["top", "food"];
// Categorías donde buscamos en todas las fuentes (no limitamos por domainurl)
const BROAD_SEARCH_CATEGORIES = ["food"];

async function fetchBatch(
  category: string,
  domainBatch: string[],
  keywords?: string
): Promise<NewsDataArticle[]> {
  const isBroad = BROAD_SEARCH_CATEGORIES.includes(category);
  const baseUrl = isBroad
    ? `https://newsdata.io/api/1/news?apikey=${API_KEY}&language=es`
    : `https://newsdata.io/api/1/news?apikey=${API_KEY}&domainurl=${domainBatch.join(",")}&language=es`;
  const categoryParam = SKIP_CATEGORY_PARAM.includes(category) ? "" : `&category=${category}`;
  const keywordQueries = keywords ? splitKeywordQueries(keywords, 100) : [undefined];

  if (keywordQueries.length > 1) {
    console.warn(
      `[News API] keywords demasiado largos, se usan ${keywordQueries.length} consultas parciales para categoría=${category}`
    );
  }

  const queryResults = await Promise.all(
    keywordQueries.map(async (keywordQuery) => {
      let url = `${baseUrl}${categoryParam}`;
      if (keywordQuery) {
        url += `&q=${encodeURIComponent(keywordQuery)}`;
      }

      console.log(`[News API] Pidiendo tanda [${isBroad ? "(todas las fuentes)" : domainBatch.join(",")}] categoría=${category} q=${keywordQuery ?? "(ninguna)"}`);

      const response = await fetch(url, { next: { revalidate: 3600 } });
      if (!response.ok) {
        const body = await response.text().catch(() => "");
        console.error(
          `[News API] Falló la tanda [${domainBatch.join(",")}] categoría=${category} q=${keywordQuery ?? "(ninguna)"} - Status ${response.status}: ${body}`
        );
        return [] as NewsDataArticle[];
      }

      const data = await response.json();
      const count = data.results?.length || 0;
      console.log(`[News API] Tanda [${isBroad ? "(todas las fuentes)" : domainBatch.join(",")}] devolvió ${count} artículos crudos.`);
      return data.results || [];
    })
  );

  return queryResults.flat();
}

export async function fetchNewsByCategory(
  category: string | string[],
  displayCategory: string,
  keywords?: string
): Promise<NewsArticle[]> {
  try {
    const categories = Array.isArray(category) ? category : [category];

    const fetchPromises: Promise<NewsDataArticle[]>[] = [];
    for (const cat of categories) {
      if (BROAD_SEARCH_CATEGORIES.includes(cat)) {
        // Para búsquedas amplias no iteramos por domain batches (sería redundante)
        fetchPromises.push(fetchBatch(cat, [], keywords));
      } else {
        fetchPromises.push(...DOMAIN_BATCHES.map((batch) => fetchBatch(cat, batch, keywords)));
      }
    }

    const batchResults = await Promise.all(fetchPromises);

    const allResults = batchResults.flat();
    console.log(
      `[News API] Total artículos crudos combinados (todas las tandas): ${allResults.length}`
    );

    if (allResults.length === 0) {
      console.warn(`[News API] Sin resultados crudos para categoría=${category}. Usando mock.`);
      return getMockData(displayCategory);
    }

    const seenTitles = new Set();
    let rejectedByPolitics = 0;
    let rejectedByFilter = 0;
    let rejectedByDuplicate = 0;

    const keywordTokens = normalizeSearchTokens(keywords);
    const allowAnySource = categories.some((cat) => BROAD_SEARCH_CATEGORIES.includes(cat));

    const filtered = allResults
      .filter((article: NewsDataArticle) => {
        if (article.category && article.category.includes("politics")) {
          rejectedByPolitics++;
          return false;
        }
        if (!article.title) return false;

        if (!passesStrictFilter(article, allowAnySource)) {
          rejectedByFilter++;
          return false;
        }

        if (seenTitles.has(article.title)) {
          rejectedByDuplicate++;
          return false;
        }
        seenTitles.add(article.title);

        return true;
      })
      .filter((article: NewsDataArticle) => {
        if (!keywordTokens.length || categories.includes("top")) return true;
        return (
          articleMatchesCategory(article, categories) ||
          articleMatchesKeywords(article, keywordTokens)
        );
      })
      .map((article: NewsDataArticle) => ({
        id: article.link || article.article_id || "",
        title: article.title || "",
        excerpt: article.description || "",
        category: getCategoryName(article.category, displayCategory),
        imageUrl: article.image_url || null,
        author: article.source_name || article.creator?.[0] || "Desconocido",
        date: article.pubDate ? new Date(article.pubDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : ""
      }));

    console.log(
      `[News API] Resultado final: ${filtered.length} artículos. Rechazados -> política: ${rejectedByPolitics}, filtro estricto (idioma/fuente/país): ${rejectedByFilter}, duplicados: ${rejectedByDuplicate}.`
    );

    return filtered.length > 0 ? filtered : getMockData(displayCategory);
  } catch (error) {
    console.error("[News API] Error de red:", error);
    return getMockData(displayCategory);
  }
}

export async function fetchEntertainmentNews(
  displayCategory: string = "Cine y Música"
): Promise<NewsArticle[]> {
  return fetchNewsByCategory(
    "entertainment",
    displayCategory,
    "cine OR película OR música OR concierto OR álbum OR estreno"
  );
}

export async function fetchTopNews(
  displayCategory: string = "Destacado"
): Promise<NewsArticle[]> {
  return fetchNewsByCategory("top", displayCategory);
}

/**
 * BBC, CNN, Reuters, AP, DW, El Universo y El Comercio casi no publican
 * contenido de cocina/gastronomía bajo una categoría "food" propiamente
 * dicha. Por eso buscamos por palabras clave en vez de depender de la
 * categorización interna de newsdata.io. Es esperable que esta sección
 * tenga pocos resultados (a veces ninguno) comparada con Deportes o
 * Tecnología, justamente por el tipo de fuentes elegidas.
 */
export async function fetchFoodNews(
  displayCategory: string = "Cocina"
): Promise<NewsArticle[]> {
  return fetchNewsByCategory(
    "food",
    displayCategory,
    "receta OR gastronomía OR chef OR restaurante OR cocina"
  );
}