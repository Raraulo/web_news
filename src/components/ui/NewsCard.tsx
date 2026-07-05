import { Clock } from "lucide-react";

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  imageUrl: string | null;
  author: string;
  date: string;
}

interface NewsCardProps {
  article: NewsArticle;
  isFeatured?: boolean;
}

export function NewsCard({ article, isFeatured = false }: NewsCardProps) {
  const titleClass = isFeatured
    ? "text-3xl md:text-4xl font-black mb-3 line-clamp-3 leading-[1.08]"
    : "text-xl font-bold mb-2 line-clamp-3 leading-snug";

  const clampClass = isFeatured
    ? "line-clamp-3 text-base leading-relaxed"
    : article.title.length > 60
    ? "line-clamp-2 text-sm leading-relaxed"
    : "line-clamp-3 text-sm leading-relaxed";

  const imgClass = isFeatured ? "w-full h-64 md:h-80 object-cover" : "w-full h-48 object-cover";

  const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80&auto=format&fit=crop";
  const displayImage = article.imageUrl || FALLBACK_IMAGE;

  return (
    <article className="group relative flex flex-col h-full" style={{ fontFamily: "var(--font-garamond), Georgia, serif" }}>
      {/* Imagen */}
      <div className="relative w-full overflow-hidden bg-zinc-200 dark:bg-zinc-900 mb-3">
        <img
          src={displayImage}
          alt={article.title}
          loading="lazy"
          className={`${imgClass} group-hover:scale-[1.02] transition-transform duration-500 ease-out`}
        />
      </div>

      {/* Contenido */}
      <div className="flex flex-col flex-1">
        {/* Categoría — estilo NYT rojo serif */}
        <span className="text-[11px] font-bold uppercase tracking-widest text-red-600 dark:text-red-500 mb-2" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
          {article.category}
        </span>

        {/* Título — Playfair Display */}
        <h3 className={`${titleClass} group-hover:underline decoration-1 underline-offset-4 text-black dark:text-white`} style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
          <a href={article.id} target="_blank" rel="noopener noreferrer">
            {article.title}
            <span className="absolute inset-0" />
          </a>
        </h3>

        {/* Extracto — EB Garamond */}
        {article.excerpt && (
          <p className={`text-black/65 dark:text-white/60 mb-4 flex-1 ${clampClass}`} style={{ fontFamily: "var(--font-garamond), Georgia, serif" }}>
            {article.excerpt}
          </p>
        )}

        {/* Footer — Inter */}
        <div className="flex items-center justify-between text-xs text-black/40 dark:text-white/40 mt-auto pt-3 border-t border-black/10 dark:border-white/10" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
          <span className="font-semibold uppercase tracking-wide truncate max-w-[150px]">
            {article.author}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <Clock size={12} className="opacity-70" />
            <span>{article.date}</span>
          </div>
        </div>
      </div>
    </article>
  );
}