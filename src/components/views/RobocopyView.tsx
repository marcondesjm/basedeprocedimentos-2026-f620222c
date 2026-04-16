import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Terminal,
  Copy,
  Check,
  FolderInput,
  FolderOutput,
  Settings2,
  Rocket,
  AlertTriangle,
  Lightbulb,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

const COMMAND_BASIC = `robocopy "\\\\sac3144\\PROJETOS\\DISTRIBUICAO\\SuporteAtendimento\\Softwares\\Proprietario\\Restrito\\Microsoft\\MS_Office\\MS_Office_2013_SP1_64bits" "C:\\supav\\office" /E /Z /COPYALL /R:3 /W:5`;

const COMMAND_WITH_LOG = `robocopy "\\\\sac3144\\PROJETOS\\DISTRIBUICAO\\SuporteAtendimento\\Softwares\\Proprietario\\Restrito\\Microsoft\\MS_Office\\MS_Office_2013_SP1_64bits" "C:\\supav\\office" /E /Z /COPYALL /R:3 /W:5 /LOG:C:\\supav\\log.txt`;

const PARAMS = [
  { flag: "/E", desc: "Copia todas as subpastas, inclusive vazias" },
  { flag: "/Z", desc: "Modo reiniciável (se cair a conexão, continua depois)" },
  { flag: "/COPYALL", desc: "Copia tudo: dados, atributos, permissões e dono do arquivo" },
  { flag: "/R:3", desc: "Tenta copiar 3 vezes se der erro" },
  { flag: "/W:5", desc: "Espera 5 segundos entre tentativas" },
];

const ERRORS = [
  {
    title: "Acesso negado",
    solution: "Você precisa ter permissão na rede (\\\\sac3144).",
  },
  {
    title: "Caminho não encontrado",
    solution: "Verifique se está conectado na rede da empresa e se o servidor está acessível.",
  },
  {
    title: "Pasta destino não existe",
    solution: "Crie antes com: mkdir C:\\supav\\office",
  },
];

export const RobocopyView = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Comando copiado!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Terminal className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Robocopy</h1>
          <p className="text-sm text-muted-foreground">
            Esse comando do Robocopy já está praticamente pronto — você só precisa entender o que ele faz e como executar corretamente.
          </p>
        </div>
      </div>

      {/* O que faz */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">O que esse comando faz</h2>
        </div>
        <div className="relative">
          <pre className="bg-muted/60 border rounded-lg p-3 pr-12 text-xs overflow-x-auto whitespace-pre-wrap break-all font-mono">
            {COMMAND_BASIC}
          </pre>
          <Button
            size="sm"
            variant="outline"
            className="absolute top-2 right-2 h-7 w-7 p-0"
            onClick={() => handleCopy(COMMAND_BASIC, "basic")}
          >
            {copiedId === "basic" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          👉 Ele copia todos os arquivos do servidor (rede) para o seu computador local.
        </p>
      </Card>

      {/* Origem / Destino */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <FolderInput className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold">Origem (de onde vem)</h3>
          </div>
          <code className="block text-xs bg-muted/60 p-2 rounded break-all font-mono">
            \\sac3144\PROJETOS\DISTRIBUICAO\...
          </code>
          <p className="text-xs text-muted-foreground">➡️ Pasta em rede (servidor)</p>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <FolderOutput className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold">Destino (pra onde vai)</h3>
          </div>
          <code className="block text-xs bg-muted/60 p-2 rounded break-all font-mono">
            C:\supav\office
          </code>
          <p className="text-xs text-muted-foreground">➡️ Pasta local no seu PC</p>
        </Card>
      </div>

      {/* Parâmetros */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Parâmetros (o mais importante)</h2>
        </div>
        <div className="space-y-2">
          {PARAMS.map((p) => (
            <div key={p.flag} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/40 transition-colors">
              <Badge variant="secondary" className="font-mono shrink-0 min-w-[80px] justify-center">
                {p.flag}
              </Badge>
              <span className="text-sm text-foreground pt-0.5">{p.desc}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Como executar */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Como executar (passo a passo)</h2>
        </div>

        <div className="space-y-3">
          <div className="flex gap-3">
            <Badge className="shrink-0 h-6 w-6 rounded-full p-0 flex items-center justify-center">1</Badge>
            <div className="space-y-2 flex-1">
              <p className="font-medium text-sm">Abrir o Prompt como administrador</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-1">
                <li>Aperte <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Win + R</kbd></li>
                <li>Digite <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">cmd</code></li>
                <li>Clique com botão direito → <strong>Executar como administrador</strong></li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <Badge className="shrink-0 h-6 w-6 rounded-full p-0 flex items-center justify-center">2</Badge>
            <div className="space-y-2 flex-1">
              <p className="font-medium text-sm">Colar o comando e rodar</p>
              <div className="relative">
                <pre className="bg-muted/60 border rounded-lg p-3 pr-12 text-xs overflow-x-auto whitespace-pre-wrap break-all font-mono">
                  {COMMAND_BASIC}
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2 h-7 w-7 p-0"
                  onClick={() => handleCopy(COMMAND_BASIC, "step2")}
                >
                  {copiedId === "step2" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Erros */}
      <Card className="p-5 space-y-3 border-amber-500/30 bg-amber-500/5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500" />
          <h2 className="text-lg font-semibold">Possíveis erros (e soluções)</h2>
        </div>
        <div className="space-y-2">
          {ERRORS.map((err, i) => (
            <Alert key={i} className="border-amber-500/30">
              <AlertDescription>
                <p className="font-semibold text-foreground">❌ {err.title}</p>
                <p className="text-sm text-muted-foreground mt-1">➡️ {err.solution}</p>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </Card>

      {/* Dica profissional */}
      <Card className="p-5 space-y-3 border-primary/30 bg-primary/5">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Dica profissional (recomendado)</h2>
        </div>
        <p className="text-sm">
          Adicione log para acompanhar:{" "}
          <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">/LOG:C:\supav\log.txt</code>
        </p>
        <div className="relative">
          <pre className="bg-muted/60 border rounded-lg p-3 pr-12 text-xs overflow-x-auto whitespace-pre-wrap break-all font-mono">
            {COMMAND_WITH_LOG}
          </pre>
          <Button
            size="sm"
            variant="outline"
            className="absolute top-2 right-2 h-7 w-7 p-0"
            onClick={() => handleCopy(COMMAND_WITH_LOG, "log")}
          >
            {copiedId === "log" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </Card>

      {/* Extra */}
      <Card className="p-5 space-y-2">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-semibold">Extra (pra deixar mais rápido)</h2>
        </div>
        <p className="text-sm">
          Se quiser velocidade máxima, adicione{" "}
          <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">/MT:8</code>{" "}
          (usa múltiplas threads).
        </p>
      </Card>

      {/* Resumo */}
      <Card className="p-5 space-y-2 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          👍 Resumindo
        </h2>
        <p className="text-sm font-medium">Esse comando:</p>
        <ul className="space-y-1 text-sm">
          <li className="flex items-center gap-2">✔ Copia tudo do servidor</li>
          <li className="flex items-center gap-2">✔ Mantém permissões</li>
          <li className="flex items-center gap-2">✔ Continua se cair</li>
          <li className="flex items-center gap-2">✔ Tenta novamente em erro</li>
        </ul>
      </Card>
    </div>
  );
};
