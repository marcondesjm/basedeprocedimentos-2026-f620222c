import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, ChevronDown, ChevronUp, Download } from "lucide-react";
import { format } from "date-fns";

interface VersionEntry {
  version: string;
  date: string;
  changes: string[];
}

const versions: VersionEntry[] = [
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
          <Badge variant="outline">{versions.length} versões</Badge>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </div>

      {isOpen && (
        <ScrollArea className="mt-4 max-h-[400px]">
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
      )}
    </Card>
  );
};
