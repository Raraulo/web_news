import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  const sections = [
    { title: "Secciones", links: ["Politica", "Economia", "Mundo", "Deportes", "Opinion"] },
    { title: "Compania", links: ["Quienes somos", "Contacto", "Trabaja con nosotros", "Anunciate"] },
    { title: "Legal", links: ["Terminos de uso", "Privacidad", "Cookies"] },
  ];

  const social = ["Twitter", "Facebook", "Instagram"];

  return (
    <footer className="border-t-2 border-black dark:border-white/20 bg-white dark:bg-black mt-auto font-serif text-black dark:text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center text-center mb-10">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <span className="text-3xl font-black tracking-tight">The Quito Grid</span>
          </Link>
          <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-black/50 dark:text-white/50 mt-2">
            Informacion con criterio, desde {year}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 border-t border-black/15 dark:border-white/15 pt-10 max-w-3xl mx-auto">
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="font-sans text-[11px] font-semibold uppercase tracking-[0.15em] text-black/50 dark:text-white/50 mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-black/80 dark:text-white/80 hover:underline decoration-1 underline-offset-4 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-10 pt-6 border-t border-black/15 dark:border-white/15 font-sans">
          <p className="text-xs text-black/50 dark:text-white/50 tracking-wide">
            (c) {year} The Quito Grid. derechos reservados.
          </p>
          <div className="flex gap-6">
            {social.map((name) => (
              <a key={name} href="#" className="text-xs font-semibold uppercase tracking-[0.1em] text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors">
                {name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}