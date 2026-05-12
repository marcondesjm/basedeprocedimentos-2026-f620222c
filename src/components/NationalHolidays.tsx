import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  type: string;
}

const CACHE_KEY = "national_holidays_cache_v1";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

const formatDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
};

const weekday = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
};

const daysUntil = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const fetchHolidays = async (year: number): Promise<Holiday[]> => {
  const res = await fetch(`https://brasilapi.com.br/api/feriados/v1/${year}`);
  if (!res.ok) throw new Error("Falha ao buscar feriados");
  return res.json();
};

export const NationalHolidays = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as { ts: number; data: Holiday[] };
          if (Date.now() - parsed.ts < CACHE_TTL_MS) {
            setHolidays(parsed.data);
            setLoading(false);
            return;
          }
        }
        const year = new Date().getFullYear();
        const [curr, next] = await Promise.all([
          fetchHolidays(year),
          fetchHolidays(year + 1).catch(() => [] as Holiday[]),
        ]);
        const all = [...curr, ...next];
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: all }));
        setHolidays(all);
      } catch (e) {
        console.error("Erro ao carregar feriados nacionais:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const upcoming = holidays
    .filter((h) => daysUntil(h.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  return (
    <Card className="p-4 md:p-5 bg-gradient-to-br from-emerald-500/5 to-primary/5 border-emerald-500/10">
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays className="w-5 h-5 text-emerald-500" />
        <h3 className="text-sm md:text-base font-semibold text-foreground/90">
          Próximos Feriados Nacionais
        </h3>
        <span className="text-[10px] text-muted-foreground ml-auto">
          fonte: BrasilAPI
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando feriados…</p>
      ) : upcoming.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          Não foi possível carregar os feriados.
        </p>
      ) : (
        <ul className="space-y-2">
          {upcoming.map((h) => {
            const days = daysUntil(h.date);
            const label =
              days === 0 ? "hoje" : days === 1 ? "amanhã" : `em ${days} dias`;
            return (
              <li
                key={h.date + h.name}
                className="flex items-center gap-3 text-sm"
              >
                <div className="flex flex-col items-center justify-center w-12 shrink-0 rounded-md bg-emerald-500/10 border border-emerald-500/20 py-1">
                  <span className="text-[10px] uppercase text-emerald-500 leading-none">
                    {weekday(h.date)}
                  </span>
                  <span className="text-sm font-bold text-foreground leading-tight">
                    {formatDate(h.date)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{h.name}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};
