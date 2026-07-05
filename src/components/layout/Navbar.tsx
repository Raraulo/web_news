"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "../ThemeToggle";

const CATEGORIES = [
  { name: "Inicio", path: "/" },
  { name: "Tecnología", path: "/tecnologia" },
  { name: "Deportes", path: "/deportes" },
  { name: "Cocina", path: "/cocina" },
  { name: "Clima", path: "/clima" },
  { name: "Moda", path: "/moda" },
];

export function Navbar() {
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 80) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setVisible(false);
      } else {
        setVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <nav
      className={`sticky top-0 z-50 w-full bg-white/98 dark:bg-black/98 backdrop-blur-md font-serif text-black dark:text-white transition-transform duration-300 ${visible ? "translate-y-0" : "-translate-y-full"
        }`}
    >
      {/* Masthead: nombre centrado, grande */}
      <div className="border-b border-black/10 dark:border-white/10 py-6">
        <Link href="/" className="block text-center group w-fit mx-auto">
          <span className="text-3xl md:text-5xl font-black tracking-tight leading-none">
            The Quito Grid
          </span>
          <span className="block h-px w-0 group-hover:w-full bg-black dark:bg-white transition-all duration-300 mx-auto mt-1" />
        </Link>
      </div>

      {/* Navegación por categorías + toggle de tema */}
      <div className="border-b-2 border-black dark:border-white/70">
        <div className="container mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex-1" />

          <div
            className="flex gap-8 items-center overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {CATEGORIES.map((category) => (
              <Link
                key={category.path}
                href={category.path}
                className="group relative font-sans text-xs font-semibold uppercase tracking-[0.12em] text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors py-1"
              >
                {category.name}
                <span className="absolute left-0 -bottom-0.5 h-px w-0 group-hover:w-full bg-black dark:bg-white transition-all duration-300" />
              </Link>
            ))}
          </div>

          <div className="flex-1 flex justify-end">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}