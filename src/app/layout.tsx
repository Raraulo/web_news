import type { Metadata } from "next";
import { Playfair_Display, EB_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SportsTicker } from "@/components/ui/SportsTicker";
import { IntroAnimation } from "@/components/IntroAnimation";

// Fuente principal serif — estilo NYT/Times
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

// Fuente para cuerpo de texto largo — estilo editorial
const garamond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

// Fuente sans-serif para etiquetas, UI, metadatos
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "The Quito Grid | Últimas Noticias",
  description: "Portal moderno de noticias sobre tecnología, deportes, cocina, clima y moda.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={`${playfair.variable} ${garamond.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col antialiased bg-white dark:bg-black text-black dark:text-white">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <div className="page-content-wrapper flex flex-col min-h-screen">
            <IntroAnimation />
            <Navbar />
            <SportsTicker />
            <main className="flex-1 relative">
              {/* Bordes decorativos con crosshatch solo en el contenido */}
              <div className="page-border-left" aria-hidden="true" />
              <div className="page-border-right" aria-hidden="true" />
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
