import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ChevronDown, ChevronUp, Download, ArrowUp, ArrowDown } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

declare const __APP_VERSION__: string;
declare const __BUILD_TIMESTAMP__: string;

interface VersionEntry {
  version: string;
  date: string;
  changes: string[];
}

export const Changelog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentBuildLabel = `${String(__APP_VERSION__)} • ${format(new Date(__BUILD_TIMESTAMP__), "dd/MM/yyyy HH:mm")}`;

  useEffect(() => {
    const fetchVersions = async () => {
      const { data, error } = await supabase
        .from("changelog_versions" as any)
        .select("version, release_date, changes")
        .order("release_date", { ascending: false });

      if (data && !error) {
        setVersions(
          (data as any[]).map((v) => ({
            version: v.version,
            date: format(new Date(v.release_date), "dd/MM/yyyy"),
            changes: v.changes || [],
          }))
        );
      }
    };

    fetchVersions();
  }, []);

  const scrollToTop = () => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  const scrollToBottom = () => {
    const vp = scrollRef.current;
    if (vp) vp.scrollTo({ top: vp.scrollHeight, behavior: "smooth" });
  };

  const handleDownloadChangelog = () => {
    const lines = versions.map((v) => {
      const header = `${v.version} - ${v.date}`;
      const changes = v.changes.map((c) => `  • ${c}`).join("\n");
      return `${header}\n${changes}`;
    });
    const content = "LOG DE MODIFICAÇÕES\n\n" + lines.join("\n\n");
    const blob = new Blob(["\ufeff" + content], { type: "text/plain;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `changelog_${format(new Date(), "yyyy-MM-dd_HHmm")}.txt`;
    link.click();
  };

  return (
    <Card className="p-4 md:p-6 bg-gradient-to-br from-muted/30 to-muted/50 border-muted-foreground/10">
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">Log de Modificações</h2>
          </div>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            Build atual: {currentBuildLabel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isOpen && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1"
              onClick={(e) => { e.stopPropagation(); handleDownloadChangelog(); }}
            >
              <Download className="w-3 h-3" />
              Salvar
            </Button>
          )}
          <Badge variant="outline">{versions.length} versões</Badge>
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
            {versions.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Carregando versões...</p>
            ) : (
              <div className="space-y-4">
                {versions.map((v) => (
                  <div key={v.version} className="border-l-2 border-primary/40 pl-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">{v.version}</Badge>
                      <span className="text-sm text-muted-foreground">{v.date}</span>
                    </div>
                    <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                      {v.changes.map((change, idx) => (
                        <li key={idx}>{change}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
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
        </div>
      )}
    </Card>
  );
};
