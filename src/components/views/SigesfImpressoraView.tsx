import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Printer,
  Copy,
  Check,
  AlertTriangle,
  Settings2,
  FileCode,
  Lightbulb,
  ZoomIn,
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
    title: "Driver da impressora não instalado",
    solution:
      "Antes de qualquer coisa, instalar o driver da impressora. Sem o driver nada funciona.",
  },
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
  const [zoomImg, setZoomImg] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copiado!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const Figure = ({ src, alt }: { src: string; alt: string }) => (
    <button
      type="button"
      onClick={() => setZoomImg(src)}
      className="group relative block w-full overflow-hidden rounded-lg border border-border bg-muted/30 hover:border-primary transition-colors"
    >
      <img src={src} alt={alt} loading="lazy" className="w-full h-auto" />
      <span className="absolute top-2 right-2 bg-background/80 backdrop-blur p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
        <ZoomIn className="h-4 w-4" />
      </span>
      <span className="block text-[11px] text-muted-foreground px-2 py-1 text-left bg-muted/40">
        {alt}
      </span>
    </button>
  );

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Figure src="/sigesf/p1-impressoras.jpg" alt="Impressoras instaladas (XPS Writer e SIGESF)" />
        </div>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Figure src="/sigesf/p2-7zip-jar.jpg" alt="Abrir sigesfEmissorDeSenhas.jar com 7-Zip" />
          <Figure src="/sigesf/p2-7zip-config.jpg" alt="Editar config.properties dentro do 7-Zip" />
          <Figure src="/sigesf/p2-config-properties.jpg" alt="Linha tipoImpressao no Bloco de Notas" />
        </div>

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
            <Figure src="/sigesf/p2-tipo-interna.jpg" alt="config.properties com ImpressoraTermicaSIGESF (Interna)" />
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
            <Figure src="/sigesf/p2-tipo-externa.jpg" alt="config.properties com ImpressoraTermicaEscPos (Externa)" />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Figure src="/sigesf/erro-7zip.jpg" alt="Erro do 7-Zip ao salvar com SIGESF aberto" />
          <Figure src="/sigesf/logoff-sigesf.jpg" alt="Forçar logoff do usuário SIGESF no Gerenciador de Tarefas" />
        </div>
      </Card>

      <p className="text-[11px] text-muted-foreground text-center pt-2">
        Fonte: POP SIGESF — TOTEM Windows 7 v2.0 (Hepta · 12/2024)
      </p>

      {/* Lightbox */}
      <Dialog open={!!zoomImg} onOpenChange={(o) => !o && setZoomImg(null)}>
        <DialogContent className="max-w-5xl w-[95vw] p-2 bg-background">
          {zoomImg && <img src={zoomImg} alt="Visualização ampliada" className="w-full h-auto rounded" />}
        </DialogContent>
      </Dialog>
    </div>
  );
};
