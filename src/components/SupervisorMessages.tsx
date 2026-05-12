import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Megaphone, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface SupervisorMessage {
  id: string;
  message: string;
  details: string | null;
  created_at: string;
  isHoliday?: boolean;
}

interface Holiday {
  date: string;
  name: string;
  type: string;
}

const HOLIDAYS_CACHE_KEY = "national_holidays_cache_v1";
const HOLIDAYS_TTL_MS = 24 * 60 * 60 * 1000;

const fmtBR = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
};

const daysUntil = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
};

const loadHolidays = async (): Promise<Holiday[]> => {
  try {
    const cached = localStorage.getItem(HOLIDAYS_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as { ts: number; data: Holiday[] };
      if (Date.now() - parsed.ts < HOLIDAYS_TTL_MS) return parsed.data;
    }
    const year = new Date().getFullYear();
    const fetchYear = async (y: number) => {
      const r = await fetch(`https://brasilapi.com.br/api/feriados/v1/${y}`);
      if (!r.ok) throw new Error("falha");
      return (await r.json()) as Holiday[];
    };
    const [a, b] = await Promise.all([
      fetchYear(year),
      fetchYear(year + 1).catch(() => [] as Holiday[]),
    ]);
    const all = [...a, ...b];
    localStorage.setItem(HOLIDAYS_CACHE_KEY, JSON.stringify({ ts: Date.now(), data: all }));
    return all;
  } catch {
    return [];
  }
};

const holidayToMessage = (h: Holiday): SupervisorMessage => {
  const days = daysUntil(h.date);
  const when = days === 0 ? "hoje" : days === 1 ? "amanhã" : `em ${days} dias`;
  return {
    id: `holiday-${h.date}`,
    message: `Feriado Nacional - ${fmtBR(h.date)} - ${h.name} (${when})`,
    details: `Feriado nacional brasileiro: ${h.name}\nData: ${fmtBR(h.date)}\nFalta: ${when}\n\nFonte oficial: BrasilAPI (calendário nacional).`,
    created_at: new Date().toISOString(),
    isHoliday: true,
  };
};

const playNotificationSound = () => {
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = 880;
    oscillator.type = "sine";
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
    // Second beep
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.value = 1100;
    osc2.type = "sine";
    gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.6);
  } catch {}
};

export const SupervisorMessages = () => {
  const [messages, setMessages] = useState<SupervisorMessage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<SupervisorMessage | null>(null);
  const knownIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

  const fetchMessages = useCallback(async () => {
    const { data } = await supabase
      .from("supervisor_messages")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(20);
    const supMsgs = (data ?? []) as any as SupervisorMessage[];

    const holidays = await loadHolidays();
    const upcomingHolidays = holidays
      .filter((h) => daysUntil(h.date) >= 0)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 4)
      .map(holidayToMessage);

    const merged = [...supMsgs, ...upcomingHolidays];

    if (isFirstLoadRef.current) {
      knownIdsRef.current = new Set(merged.map((m) => m.id));
      isFirstLoadRef.current = false;
    } else {
      const hasNew = merged.some((m) => !knownIdsRef.current.has(m.id) && !m.isHoliday);
      if (hasNew) playNotificationSound();
      knownIdsRef.current = new Set(merged.map((m) => m.id));
    }

    setMessages(merged);
  }, []);

  useEffect(() => {
    fetchMessages();
    const refreshTimer = setInterval(fetchMessages, 2 * 60 * 1000);
    return () => clearInterval(refreshTimer);
  }, [fetchMessages]);
  useEffect(() => {
    if (messages.length <= 1) return;
    const timer = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % messages.length);
        setIsVisible(true);
      }, 800);
    }, 15000);
    return () => clearInterval(timer);
  }, [messages.length]);

  const current = messages[currentIndex];

  return (
    <>
      <Card className="p-4 md:p-5 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10 flex items-center gap-3 overflow-hidden">
        <div className="shrink-0 text-primary">
          <Megaphone className="w-6 h-6" />
        </div>
        {current ? (
          <>
            <p
              className="text-sm md:text-base font-medium text-foreground/80 flex-1 min-w-0"
              style={{
                transition: "opacity 0.8s ease-in-out, transform 0.8s ease-in-out",
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateX(0)" : "translateX(-8px)",
              }}
            >
              📢 {current.message}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1 text-primary hover:text-primary shrink-0"
              style={{
                transition: "opacity 0.8s ease-in-out",
                opacity: isVisible ? 1 : 0,
              }}
              onClick={() => setSelectedMessage(current)}
            >
              <Info className="w-3.5 h-3.5" />
              Saiba mais
            </Button>
          </>
        ) : (
          <p className="text-sm md:text-base text-muted-foreground italic">
            Nenhum aviso dos supervisores no momento.
          </p>
        )}
        {messages.length > 1 && (
          <span className="text-[10px] text-muted-foreground shrink-0">
            {currentIndex + 1}/{messages.length}
          </span>
        )}
      </Card>

      <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Megaphone className="w-5 h-5" />
              Aviso do Supervisor
            </DialogTitle>
            <DialogDescription className="sr-only">Detalhes do aviso</DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="font-semibold text-foreground">📢 {selectedMessage.message}</p>
              </div>
              {selectedMessage.details && (
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedMessage.details}</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Publicado em: {format(new Date(selectedMessage.created_at), "dd/MM/yyyy 'às' HH:mm")}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
