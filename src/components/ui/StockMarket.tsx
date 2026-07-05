"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import {
  Smartphone,
  Cloud,
  Search,
  CarFront,
  Users,
  Cpu,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
} from "lucide-react";

// Iconos genéricos por sector (no logos de marca) para no usar IP de terceros.
const COMPANIES: Record<string, { name: string; icon: typeof Smartphone }> = {
  AAPL: { name: "Apple", icon: Smartphone },
  MSFT: { name: "Microsoft", icon: Cloud },
  GOOGL: { name: "Google", icon: Search },
  TSLA: { name: "Tesla", icon: CarFront },
  META: { name: "Meta", icon: Users },
  NVDA: { name: "Nvidia", icon: Cpu },
};

const RANGES = [
  { key: "7", label: "Última semana", days: 7 },
  { key: "30", label: "Último mes", days: 30 },
] as const;

export function StockMarket() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [symbol, setSymbol] = useState("AAPL");
  const [meta, setMeta] = useState<any>(null);
  const [range, setRange] = useState<typeof RANGES[number]["key"]>("30");

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/api/stocks?symbol=${symbol}`)
      .then(async (res) => {
        const resData = await res.json();
        if (!res.ok) throw new Error(resData.error || `Error ${res.status}`);
        return resData;
      })
      .then((resData) => {
        setData(resData.values || []);
        setMeta(resData.meta || { symbol });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("No pudimos cargar esta información. Intenta de nuevo en un momento.");
        setData([]);
        setMeta(null);
        setLoading(false);
      });
  }, [symbol]);

  const activeDays = RANGES.find((r) => r.key === range)?.days ?? 30;
  const visibleData = useMemo(() => data.slice(-activeDays), [data, activeDays]);

  const hasData = visibleData.length > 0;
  const firstPrice = hasData ? visibleData[0].close : null;
  const lastPrice = hasData ? visibleData[visibleData.length - 1].close : null;

  const wentUp = hasData && firstPrice <= lastPrice;
  const changeAmount = hasData ? lastPrice - firstPrice : 0;
  const changePercent = hasData && firstPrice !== 0 ? (changeAmount / firstPrice) * 100 : 0;

  const color = wentUp ? "#0d9488" : "#dc2626";
  const company = COMPANIES[symbol] || { name: symbol, icon: Smartphone };
  const CompanyIcon = company.icon;
  const TrendIcon = wentUp ? ArrowUpRight : ArrowDownRight;
  const rangeLabel = RANGES.find((r) => r.key === range)?.label.toLowerCase() || "este período";

  return (
    <div className="mb-16">
      <div className="border-b-2 border-black dark:border-white pb-2 mb-2">
        <h2
          className="text-2xl font-black tracking-tight"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          Mercados
        </h2>
      </div>
      <p className="text-sm italic text-black/50 dark:text-white/50 mb-6">
        Precio de referencia de las principales tecnológicas.
      </p>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-black/5 dark:border-white/5 shadow-sm overflow-hidden">
        {/* Selector de empresa */}
        <div className="flex gap-2 px-6 pt-5 flex-wrap">
          {Object.entries(COMPANIES).map(([sym, info]) => {
            const Icon = info.icon;
            return (
              <button
                key={sym}
                onClick={() => setSymbol(sym)}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-full transition-colors ${symbol === sym
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-black/5 text-black/60 hover:bg-black/10 dark:bg-white/10 dark:text-white/60 dark:hover:bg-white/20"
                  }`}
              >
                <Icon size={15} strokeWidth={2.25} />
                {info.name}
              </button>
            );
          })}
        </div>

        {error ? (
          <div className="h-[300px] w-full flex items-center justify-center text-sm text-red-500 dark:text-red-400 text-center px-6">
            {error}
          </div>
        ) : (
          <>
            {/* Precio y variación */}
            <div className="px-6 pt-5 pb-3">
              {loading ? (
                <div className="h-16 flex items-center gap-2 text-black/40 dark:text-white/40 text-sm">
                  <CompanyIcon size={16} />
                  Consultando {company.name}...
                </div>
              ) : hasData ? (
                <>
                  <div className="flex items-center gap-2 text-black/40 dark:text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">
                    <CompanyIcon size={14} strokeWidth={2.25} />
                    {company.name}
                  </div>

                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-5xl font-black tabular-nums">
                      ${lastPrice.toFixed(2)}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-bold ${wentUp
                          ? "bg-teal-600/10 text-teal-700 dark:text-teal-400"
                          : "bg-red-600/10 text-red-700 dark:text-red-400"
                        }`}
                    >
                      <TrendIcon size={16} strokeWidth={2.5} />
                      {Math.abs(changePercent).toFixed(1)}%
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-black/40 dark:text-white/40">
                    Variación de {Math.abs(changeAmount).toFixed(2)} dólares en {rangeLabel}.
                  </p>
                </>
              ) : (
                <div className="h-16 flex items-center text-black/40 dark:text-white/40 text-sm">
                  No hay información disponible.
                </div>
              )}

              {meta?.isFallback && (
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 rounded-lg px-3 py-1.5">
                  <AlertTriangle size={14} strokeWidth={2.25} />
                  Datos de referencia — la fuente en vivo no está disponible en este momento.
                </div>
              )}
            </div>

            {/* Gráfico */}
            <div className="h-[220px] w-full px-2">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center animate-pulse bg-black/5 dark:bg-white/5 rounded-lg mx-4">
                  Cargando...
                </div>
              ) : !hasData ? (
                <div className="w-full h-full flex items-center justify-center text-sm text-black/40 dark:text-white/40">
                  Sin datos para mostrar.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={visibleData} margin={{ top: 10, right: 16, left: 16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11 }}
                      minTickGap={50}
                      className="text-black/40 dark:text-white/40"
                      stroke="currentColor"
                    />
                    <YAxis hide domain={["auto", "auto"]} />
                    <Tooltip
                      cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "4 4" }}
                      contentStyle={{
                        backgroundColor: "var(--bg)",
                        borderRadius: "10px",
                        border: "1px solid rgba(0,0,0,0.08)",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                      }}
                      itemStyle={{ color, fontWeight: 700 }}
                      labelStyle={{ color: "var(--fg)", opacity: 0.6, marginBottom: 4, fontSize: 12 }}
                      formatter={(value) => [`$${Number(value ?? 0).toFixed(2)}`, "Precio"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="close"
                      stroke={color}
                      strokeWidth={2.5}
                      fill="url(#stockGradient)"
                      dot={false}
                      activeDot={{ r: 5, fill: color, strokeWidth: 2, stroke: "#fff" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Selector de periodo */}
            <div className="flex items-center justify-center gap-2 px-6 py-5 border-t border-black/5 dark:border-white/5">
              {RANGES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setRange(r.key)}
                  disabled={loading}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors disabled:opacity-40 ${range === r.key
                      ? "bg-black/10 text-black dark:bg-white/15 dark:text-white"
                      : "text-black/50 hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/10"
                    }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}