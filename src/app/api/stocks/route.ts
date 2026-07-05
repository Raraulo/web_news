import { NextResponse } from "next/server";

const TWELVEDATA_API_KEY = "a51aee1834d841a8a150435b15045c55";

// Lista blanca: solo estos símbolos pueden consultarse. Evita que alguien
// pegue /api/stocks?symbol=LOQUESEA y gaste tu cuota diaria de Twelve Data.
const ALLOWED_SYMBOLS = ["AAPL", "MSFT", "GOOGL", "TSLA", "META", "NVDA"];

export const revalidate = 3600; // Cache de 1 hora

function getFallbackData(symbol: string) {
  return {
    meta: { symbol, currency: "USD", isFallback: true },
    values: [
      { date: "1 Ene", close: 150 },
      { date: "2 Ene", close: 152 },
      { date: "3 Ene", close: 149 },
      { date: "4 Ene", close: 155 },
      { date: "5 Ene", close: 158 },
    ],
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedSymbol = (searchParams.get("symbol") || "AAPL").toUpperCase();

  // Validación: si el símbolo no está en la lista blanca, no llamamos a la API externa
  if (!ALLOWED_SYMBOLS.includes(requestedSymbol)) {
    return NextResponse.json(
      { error: `Símbolo no permitido. Usa uno de: ${ALLOWED_SYMBOLS.join(", ")}` },
      { status: 400 }
    );
  }

  const symbol = requestedSymbol;

  try {
    const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=30&apikey=${TWELVEDATA_API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) {
      throw new Error(`Failed to fetch stocks: ${res.status}`);
    }

    const data = await res.json();

    if (data.status === "error") {
      throw new Error(data.message);
    }

    // Transformar los datos para recharts: queremos orden cronológico (de más antiguo a más reciente)
    const reversedValues = data.values ? [...data.values].reverse() : [];

    const formattedData = reversedValues.map((v: any) => ({
      date: new Date(v.datetime).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
      close: parseFloat(v.close)
    }));

    if (formattedData.length === 0) {
      throw new Error("La API devolvió una lista vacía de valores.");
    }

    return NextResponse.json({
      meta: { ...data.meta, isFallback: false },
      values: formattedData
    });
  } catch (error) {
    console.warn(`[Stocks API] Error al obtener datos de bolsa para ${symbol} - usando datos de respaldo:`, error);
    // Datos de respaldo, marcados explícitamente como simulados
    return NextResponse.json(getFallbackData(symbol));
  }
}