"use client";

import { useEffect, useState } from "react";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Moon,
  CloudMoon,
} from "lucide-react";

// Detecta si es de noche (entre 7pm y 6am)
function isNighttime(): boolean {
  const hour = new Date().getHours();
  return hour >= 19 || hour < 6;
}

// Mapea el código WMO de Open-Meteo a un ícono + etiqueta
// Respeta si es de día o de noche
function getWeatherInfo(code: number, night?: boolean) {
  const atNight = night ?? isNighttime();

  if (code === 0) return { Icon: atNight ? Moon : Sun, label: atNight ? "Noche despejada" : "Despejado" };
  if ([1, 2].includes(code)) return { Icon: atNight ? CloudMoon : CloudSun, label: "Parcialmente nublado" };
  if (code === 3) return { Icon: Cloud, label: "Nublado" };
  if ([45, 48].includes(code)) return { Icon: CloudFog, label: "Niebla" };
  if ([51, 53, 55, 56, 57].includes(code)) return { Icon: CloudDrizzle, label: "Llovizna" };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { Icon: CloudRain, label: "Lluvia" };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { Icon: CloudSnow, label: "Nieve" };
  if ([95, 96, 99].includes(code)) return { Icon: CloudLightning, label: "Tormenta" };
  return { Icon: Cloud, label: "Nublado" };
}

const DEFAULT_LAT = -0.2298;
const DEFAULT_LON = -78.525;
const DEFAULT_CITY = "Quito";

export function LiveWeather() {
  const [weather, setWeather] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number, city: string) => {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode&hourly=temperature_2m,weathercode&timezone=America%2FGuayaquil&forecast_days=2`
      );
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setWeather({ ...data, city });
    };

    const loadWeather = async () => {
      try {
        await fetchWeather(DEFAULT_LAT, DEFAULT_LON, DEFAULT_CITY);

        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              try {
                const { latitude, longitude } = pos.coords;
                const geoRes = await fetch(
                  `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=es`
                );
                const geoData = await geoRes.json();
                const city = geoData.city || geoData.locality || DEFAULT_CITY;
                await fetchWeather(latitude, longitude, city);
              } catch {
                // mantiene Quito
              }
            },
            () => {},
            { timeout: 5000, maximumAge: 300000 }
          );
        }
      } catch {
        setError(true);
      }
    };

    loadWeather();
  }, []);

  if (error) return null;

  if (!weather || !weather.current) {
    return (
      <div className="w-full mb-12 border-y border-black/20 dark:border-white/20 py-6 animate-pulse">
        <div className="h-16 w-full bg-black/5 dark:bg-white/5" />
      </div>
    );
  }

  const night = isNighttime();
  const currentTemp = Math.round(weather.current.temperature_2m);
  const { Icon: CurrentIcon, label: currentLabel } = getWeatherInfo(weather.current.weathercode, night);

  const hourly = weather.hourly;
  const next5Hours: { time: string; temp: number; Icon: any; hourNum: number }[] = [];
  const now = new Date();

  let currentIndex = hourly.time.findIndex((t: string) => new Date(t) >= now);
  if (currentIndex < 0) currentIndex = 0;

  for (let i = 0; i < 5; i++) {
    const idx = currentIndex + i;
    if (idx < hourly.time.length) {
      const forecastDate = new Date(hourly.time[idx]);
      const hourNum = forecastDate.getHours();
      const isHourNight = hourNum >= 19 || hourNum < 6;
      const { Icon } = getWeatherInfo(hourly.weathercode[idx], isHourNight);
      next5Hours.push({
        time: forecastDate.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" }),
        temp: Math.round(hourly.temperature_2m[idx]),
        Icon,
        hourNum,
      });
    }
  }

  const today = new Date().toLocaleDateString("es-EC", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="w-full mb-12 font-serif text-black dark:text-white">
      {/* Regla superior estilo masthead */}
      <div className="border-t-2 border-b border-black dark:border-white/70 py-3 flex items-center justify-between">
        <span className="text-[11px] tracking-[0.2em] uppercase font-sans font-semibold">
          El Tiempo
        </span>
        <span className="text-[11px] tracking-[0.15em] uppercase font-sans text-black/60 dark:text-white/60">
          {today}
        </span>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 py-6 border-b border-black/15 dark:border-white/15">
        {/* Ciudad + temperatura */}
        <div className="flex items-center gap-5">
          <CurrentIcon className="w-11 h-11 text-black dark:text-white" strokeWidth={1} />
          <div>
            <p className="text-xs tracking-[0.15em] uppercase font-sans text-black/60 dark:text-white/60 mb-1">
              {weather.city}
            </p>
            <div className="flex items-baseline gap-3">
              <span className="text-6xl font-black tracking-tight leading-none">{currentTemp}°</span>
              <span className="text-base italic text-black/70 dark:text-white/70">{currentLabel}</span>
            </div>
          </div>
        </div>

        <div className="hidden md:block w-px self-stretch bg-black/15 dark:bg-white/15" />

        {/* Próximas 5 horas */}
        <div className="flex gap-6 md:gap-8 w-full md:w-auto overflow-x-auto">
          {next5Hours.map((h, i) => (
            <div key={i} className="flex flex-col items-center min-w-[52px]">
              <span className="text-[11px] font-sans tracking-wide text-black/50 dark:text-white/50 mb-2">{h.time}</span>
              <h.Icon className="w-5 h-5 mb-2 text-black/80 dark:text-white/80" strokeWidth={1.25} />
              <span className="text-sm font-sans font-semibold">{h.temp}°</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}