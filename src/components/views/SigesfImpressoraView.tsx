import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Printer,
  Copy,
  Check,
  AlertTriangle,
  Settings2,
  FileCode,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";

const LINHA_INTERNA =
  "tipoImpressao=br.com.correios.gerenciadorImpressao.impressora.ImpressoraTermicaSIGESF";
const LINHA_EXTERNA =
  "tipoImpressao=br.com.correios.gerenciadorImpressao.impressora.ImpressoraTermicaEscPos";
const CAMINHO_C = "C:\\SIGESF\\aplicacao\\sigesfEmissorDeSenhas";
const CAMINHO_D = "D:\\SIGESF\\aplicacao\\sigesfEmissorDeSenhas";

const PASSOS_P1 = [
  "Inserir teclado e mouse e tirar o cabo HDMI do conversor (placa para TV).",
  "Abrir o Gerenciador de Tarefas e finalizar todas as instâncias do JavaW (fecha o SIGESF).",
  "Fechar o Explorer; em Arquivo > Nova tarefa, digitar Explorer.EXE para reabrir.",
  "Em Dispositivos e Impressoras, clicar em Adicionar uma impressora.",
  "Adicionar impressora local e usar uma porta existente (porta USB da impressora).",
  "Fabricante: Generic — Impressora: Generic / Text Only.",
  "Avançar e usar o driver já instalado.",
  'Definir o nome como "SIGESF".',
  "Não compartilhar a impressora.",
  "Definir como impressora padrão e concluir.",
];

const PASSOS_P2 = [
  "Acesse a pasta C:\\SIGESF\\aplicacao\\sigesfEmissorDeSenhas (ou D:).",
  "Botão direito em sigesfEmissorDeSenhas.jar > 7-Zip > Abrir arquivo compactado.",
  'Botão direito em config.properties > Editar (F4).',
  'Procure a linha que começa com "tipoImpressao=".',
  "Ajuste para Interna (SIGESF) ou Externa (Esc/POS) conforme a impressora.",
  "Salvar — o 7-Zip pedirá para atualizar, clicar em OK.",
  "Forçar logoff do perfil SIGESF para que as alterações tenham efeito.",
];

const ERROS = [
  {
    title: "7-Zip não atualiza o arquivo",
    solution:
      "O perfil SIGESF está em uso. Forçar logoff do usuário SIGESF e fechar o app antes de salvar.",
  },
  {
    title: "Já existe uma impressora SIGESF",
    solution:
      "Excluir a impressora antiga com nome SIGESF antes de instalar a nova.",
  },
  {
    title: "Impressão não funciona após configurar",
    solution:
      "Verifique se o tipoImpressao bate com o modelo (Interna = SIGESF / Externa Perto, CIS, Milestone = EscPos).",
  },
];

export const SigesfImpressoraView = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copiado!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
          <Printer className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Impressora SIGESF — TOTEM Windows 7
          </h1>
          <p className="text-sm text-muted-foreground">
            Procedimento de configuração da impressora interna do TOTEM SIGESF
            (Genérica / Esc-POS).
          </p>
        </div>
      </div>

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          Existem 2 tipos de impressora: <b>Genérica</b> (interna que veio no
          TOTEM) e impressoras de cupom <b>Perto / CIS / Milestone</b> (padrão
          ESC-POS). A configuração de uma não funciona com a outra.
        </AlertDescription>
      </Alert>

      {/* P1 - Instalação no Windows */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">P1</Badge>
          <h2 className="text-lg font-semibold">
            Instalação da Impressora no Windows
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Impressora na porta <b>COM2</b> — usar o driver Generic / Text Only.
        </p>
        <ol className="list-decimal pl-5 space-y-1.5 text-sm">
          {PASSOS_P1.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ol>
      </Card>

      {/* P2 - Ajuste config.properties */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">P2</Badge>
          <h2 className="text-lg font-semibold">
            Ajuste do <code>config.properties</code>
          </h2>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Necessário ter o <b>7-Zip</b> instalado e estar autenticado como{" "}
            <b>Administrador</b> (senha do dia). <b>Forçar o logoff</b> do
            perfil SIGESF antes de salvar.
          </AlertDescription>
        </Alert>

        <ol className="list-decimal pl-5 space-y-1.5 text-sm">
          {PASSOS_P2.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ol>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Caminho do arquivo
          </p>
          {[CAMINHO_C, CAMINHO_D].map((path) => (
            <div
              key={path}
              className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2"
            >
              <FileCode className="h-4 w-4 text-muted-foreground shrink-0" />
              <code className="text-xs flex-1 break-all">{path}</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(path, `path-${path}`)}
                className="h-7 px-2"
              >
                {copiedId === `path-${path}` ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Linhas de configuração */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">
            Linhas <code>tipoImpressao=</code>
          </h2>
        </div>

        <div className="space-y-3">
          <div className="border-l-4 border-l-primary pl-3 space-y-2">
            <div className="flex items-center gap-2">
              <Badge>Interna</Badge>
              <span className="text-sm font-medium">
                Impressora original do TOTEM
              </span>
            </div>
            <div className="flex items-start gap-2 bg-muted/50 rounded-md p-2.5">
              <code className="text-[11px] flex-1 break-all leading-relaxed">
                {LINHA_INTERNA}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(LINHA_INTERNA, "interna")}
                className="h-7 px-2 shrink-0"
              >
                {copiedId === "interna" ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>

          <div className="border-l-4 border-l-amber-500 pl-3 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Externa</Badge>
              <span className="text-sm font-medium">
                Perto, CIS, Milestone (ESC-POS)
              </span>
            </div>
            <div className="flex items-start gap-2 bg-muted/50 rounded-md p-2.5">
              <code className="text-[11px] flex-1 break-all leading-relaxed">
                {LINHA_EXTERNA}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(LINHA_EXTERNA, "externa")}
                className="h-7 px-2 shrink-0"
              >
                {copiedId === "externa" ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Erros */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h2 className="text-lg font-semibold">Erros comuns</h2>
        </div>
        <div className="space-y-2">
          {ERROS.map((e, i) => (
            <div key={i} className="border-l-2 border-l-destructive/60 pl-3">
              <p className="text-sm font-semibold">{e.title}</p>
              <p className="text-xs text-muted-foreground">{e.solution}</p>
            </div>
          ))}
        </div>
      </Card>

      <p className="text-[11px] text-muted-foreground text-center pt-2">
        Fonte: POP SIGESF — TOTEM Windows 7 v2.0 (Hepta · 12/2024)
      </p>
    </div>
  );
};
