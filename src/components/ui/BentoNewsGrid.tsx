"use client";

import { NewsArticle } from "./NewsCard";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";

interface BentoNewsGridProps {
  articles: NewsArticle[];
}

interface BentoCardProps {
  article: NewsArticle;
  span?: "small" | "medium" | "large";
  index?: number;
}

export function BentoNewsGrid({ articles }: BentoNewsGridProps) {
  if (!articles.length) return null;

  // Define el patrón del layout: small, medium, large
  // small = col-span-1, medium = col-span-2, large = col-span-2 row-span-2
  const spanPattern: Array<"small" | "medium" | "large"> = [
    "large",  // 0: Principal (2x2)
    "small",  // 1: Derecha arriba
    "small",  // 2: Derecha abajo
    "medium", // 3: Segunda fila izq
    "medium", // 4: Segunda fila der
    "small",  // 5: Tercera fila
    "small",  // 6: Tercera fila
    "small",  // 7: Tercera fila
    "small",  // 8: Cuarta fila
    "small",  // 9: Cuarta fila
    "small",  // 10: Cuarta fila
    "small",  // 11: Cuarta fila
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-max">
        {articles.map((article, index) => {
          const span = spanPattern[index % spanPattern.length];
          return (
            <motion.div
              key={article.id}
              variants={itemVariants}
              className={`${
                span === "large"
                  ? "lg:col-span-2 lg:row-span-2 md:col-span-2"
                  : span === "medium"
                  ? "md:col-span-2 lg:col-span-2"
                  : "md:col-span-1 lg:col-span-1"
              }`}
            >
              <BentoCard
                article={article}
                span={span}
                index={index}
              />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function BentoCard({ article, span = "small", index }: BentoCardProps) {
  const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80&auto=format&fit=crop";
  const displayImage = article.imageUrl || FALLBACK_IMAGE;

  const isLarge = span === "large";
  const isMedium = span === "medium";

  const imageHeight = isLarge
    ? "h-48 md:h-80"
    : isMedium
    ? "h-40 md:h-56"
    : "h-32 md:h-48";

  const titleSize = isLarge
    ? "text-2xl md:text-4xl font-black leading-tight"
    : isMedium
    ? "text-lg md:text-2xl font-bold leading-snug"
    : "text-base md:text-lg font-bold leading-snug";

  const excerptSize = isLarge
    ? "text-base line-clamp-3"
    : isMedium
    ? "text-sm line-clamp-2"
    : "text-xs md:text-sm line-clamp-2";

  return (
    <article
      className="group relative flex flex-col h-full overflow-hidden bg-transparent transition-all duration-300"
      style={{ fontFamily: "var(--font-garamond), Georgia, serif" }}
    >
      {/* Imagen con zoom sutil en hover */}
      <div className="relative w-full overflow-hidden bg-zinc-200 dark:bg-zinc-900">
        <img
          src={displayImage}
          alt={article.title}
          loading="lazy"
          className={`${imageHeight} w-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out`}
        />
        {/* Overlay sutil de oscuridad en hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />

        {/* Badge de categoría en la esquina superior */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-black/80 dark:bg-white/80 text-white dark:text-black backdrop-blur-sm"
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            {article.category}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex flex-col flex-1 mt-3">
        <h3
          className={`${titleSize} text-black dark:text-white group-hover:text-black/75 dark:group-hover:text-white/85 transition-colors duration-300 mb-2`}
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          <a
            href={`#${article.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="line-clamp-3 group-hover:underline decoration-black/20 dark:decoration-white/20 decoration-1 underline-offset-2 transition-all duration-300"
          >
            {article.title}
          </a>
        </h3>

        {article.excerpt && (isLarge || isMedium) && (
          <p
            className={`${excerptSize} text-black/65 dark:text-white/60 mb-3 flex-1 group-hover:text-black/75 dark:group-hover:text-white/70 transition-colors duration-300`}
            style={{ fontFamily: "var(--font-garamond), Georgia, serif" }}
          >
            {article.excerpt}
          </p>
        )}

        {/* Footer: autor y fecha */}
        <div
          className="flex items-center justify-between text-[10px] md:text-xs text-black/40 dark:text-white/40 group-hover:text-black/50 dark:group-hover:text-white/50 transition-colors duration-300 mt-auto pt-2 border-t border-black/5 dark:border-white/5 group-hover:border-black/10 dark:group-hover:border-white/10"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          <span className="font-semibold uppercase tracking-wide truncate max-w-[120px]">
            {article.author}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <Clock size={10} className="opacity-70" />
            <span className="hidden sm:inline">{article.date}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
