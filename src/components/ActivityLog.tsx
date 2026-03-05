import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Activity, ChevronDown, ChevronUp, Download, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getActivityLogs, type LocalLogEntry } from "@/lib/activityLogger";

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
  const [logs, setLogs] = useState<LocalLogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToBottom = () => {
    const vp = scrollRef.current;
    if (vp) vp.scrollTo({ top: vp.scrollHeight, behavior: 'smooth' });
  };

  const refreshLogs = () => {
    setLogs(getActivityLogs());
  };

  useEffect(() => {
    refreshLogs();

    const handleUpdate = () => refreshLogs();
    window.addEventListener("activity_log_updated", handleUpdate);
    return () => window.removeEventListener("activity_log_updated", handleUpdate);
  }, []);

  const handleDownloadLog = () => {
    if (logs.length === 0) return;
    const lines = logs.map((log) => {
      const date = format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR });
      const action = actionLabels[log.action] || log.action;
      const entity = entityLabels[log.entity_type] || log.entity_type;
      const id = log.entity_id || "";
      const title = (log.details as any)?.title || "";
      return `${date} | ${action} | ${entity} | ${id} | ${title}`;
    });
    const content = "DATA | AÇÃO | TIPO | ID | TÍTULO\n" + lines.join("\n");
    const blob = new Blob(["\ufeff" + content], { type: "text/plain;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `log_atividades_${format(new Date(), "yyyy-MM-dd_HHmm")}.txt`;
    link.click();
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
          {isOpen && logs.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1"
              onClick={(e) => { e.stopPropagation(); handleDownloadLog(); }}
            >
              <Download className="w-3 h-3" />
              Salvar
            </Button>
          )}
          <Badge variant="outline">{logs.length} registros</Badge>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="relative mt-4">
          <div ref={scrollRef} className="max-h-[400px] overflow-y-auto pr-2">
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
                        {log.entity_id}
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
          </div>
          {logs.length > 3 && (
            <div className="absolute right-2 bottom-2 flex flex-col gap-1">
              <Button
                variant="secondary"
                size="icon"
                className="h-7 w-7 rounded-full shadow-md opacity-70 hover:opacity-100"
                onClick={scrollToTop}
                aria-label="Rolar para o topo"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="h-7 w-7 rounded-full shadow-md opacity-70 hover:opacity-100"
                onClick={scrollToBottom}
                aria-label="Rolar para o final"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
