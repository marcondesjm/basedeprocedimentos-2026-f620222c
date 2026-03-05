import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, ChevronDown, ChevronUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LogEntry {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

const actionLabels: Record<string, string> = {
  create: "Criado",
  update: "Atualizado",
  delete: "Excluído",
  complete: "Concluído",
  archive: "Arquivado",
  restore: "Restaurado",
};

const entityLabels: Record<string, string> = {
  procedure: "Procedimento",
  work_order: "Ordem de Serviço",
};

const actionColors: Record<string, string> = {
  create: "bg-emerald-100 text-emerald-800 border-emerald-200",
  update: "bg-blue-100 text-blue-800 border-blue-200",
  delete: "bg-red-100 text-red-800 border-red-200",
  complete: "bg-violet-100 text-violet-800 border-violet-200",
  archive: "bg-amber-100 text-amber-800 border-amber-200",
  restore: "bg-cyan-100 text-cyan-800 border-cyan-200",
};

export const ActivityLog = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchLogs();

    const channel = supabase
      .channel("activity_logs_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_logs" },
        () => fetchLogs()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLogs = async () => {
    const { data } = await supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) setLogs(data as unknown as LogEntry[]);
  };

  return (
    <Card className="p-4 md:p-6 bg-gradient-to-br from-muted/30 to-muted/50 border-muted-foreground/10">
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">Log de Atividades</h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{logs.length} registros</Badge>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </div>

      {isOpen && (
        <ScrollArea className="mt-4 max-h-[400px]">
          {logs.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-4">
              Nenhuma atividade registrada ainda
            </p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center gap-2 p-2 rounded-md bg-background/50 text-sm"
                >
                  <Badge
                    variant="outline"
                    className={actionColors[log.action] || ""}
                  >
                    {actionLabels[log.action] || log.action}
                  </Badge>
                  <span className="text-muted-foreground">
                    {entityLabels[log.entity_type] || log.entity_type}
                  </span>
                  {log.entity_id && (
                    <Badge variant="secondary" className="font-mono text-xs">
                      {log.entity_type === "work_order" ? `WO00000${log.entity_id}` : log.entity_id}
                    </Badge>
                  )}
                  {log.details && (log.details as any).title && (
                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                      "{(log.details as any).title}"
                    </span>
                  )}
                  <span className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(log.created_at), "dd/MM HH:mm", { locale: ptBR })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      )}
    </Card>
  );
};
