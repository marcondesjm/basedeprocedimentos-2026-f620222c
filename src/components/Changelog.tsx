import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, ChevronDown, ChevronUp, Download, ArrowUp, ArrowDown } from "lucide-react";
import { format } from "date-fns";

interface VersionEntry {
  version: string;
  date: string;
  changes: string[];
}

const versions: VersionEntry[] = [
  {
    version: "v2.7.0",
    date: "05/03/2026",
    changes: [
      "Página de Documentação completa integrada ao sistema (Alt+7)",
      "Menu lateral com opção de esconder/mostrar (offcanvas)",
      "Correção das setas de rolagem no Log de Atividades e Changelog",
      "README técnico, manual do usuário e documentação do banco de dados",
      "Novo item 'Documentação' no menu lateral com ícone dedicado",
    ],
  },
  {
    version: "v2.6.0",
    date: "04/03/2026",
    changes: [
      "Prefixo WO00000 fixo no campo e badge de ordens de serviço",
      "Validação numérica com beep sonoro e pop-up ao digitar letras",
      "Bloqueio de clique direito com beep e mensagem do desenvolvedor",
      "Histórico agrupado por mês e dia com setas colapsáveis",
      "Versão e data de atualização sincronizadas automaticamente com o build",
      "Log automático de atividades no banco de dados",
      "Changelog visual de modificações",
    ],
  },
  {
    version: "v2.5.0",
    date: "03/03/2026",
    changes: [
      "Timer de ordens de serviço com contagem progressiva",
      "Alarme contínuo ao atingir 40 minutos",
      "Histórico de chamados com arquivamento por dia",
      "Exportação e importação de backup em JSON",
      "Cabeçalho com versão e status de sincronização",
      "Limpeza de cache integrada",
    ],
  },
];

export const Changelog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const getViewport = () => scrollRef.current?.querySelector<HTMLDivElement>('[data-radix-scroll-area-viewport]');
  const scrollToTop = () => getViewport()?.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToBottom = () => {
    const vp = getViewport();
    if (vp) vp.scrollTo({ top: vp.scrollHeight, behavior: 'smooth' });
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
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">Log de Modificações</h2>
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
          <div ref={scrollRef}>
          <ScrollArea className="max-h-[400px]">
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
          </ScrollArea>
          </div>
          {/* Scroll buttons */}
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
