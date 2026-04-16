import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, FileX, Lock } from "lucide-react";

export function FormatacaoView() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-destructive/10">
          <ShieldAlert className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Formatação</h1>
          <p className="text-sm text-muted-foreground">
            Política de backup e conformidade com a LGPD
          </p>
        </div>
      </div>

      <Alert variant="destructive" className="border-2">
        <Lock className="h-5 w-5" />
        <AlertTitle className="text-lg font-bold">
          ⚠️ Backup de Usuários — Não Autorizado
        </AlertTitle>
        <AlertDescription className="mt-2 text-base leading-relaxed">
          A equipe <strong>HEPTA não é autorizada</strong> a realizar backups de
          usuários. Tal tarefa é de <strong>função exclusiva do usuário</strong>.
        </AlertDescription>
      </Alert>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <FileX className="h-5 w-5" />
            Encerramento por descumprimento à LGPD
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed">
          <p>
            O <strong>chamado será encerrado por descumprimento ao LGPD</strong>{" "}
            caso seja solicitada a execução de backup sem autorização formal ou
            sem a presença do usuário.
          </p>
          <div className="bg-muted/50 border-l-4 border-destructive p-4 rounded">
            <p className="font-medium mb-2">Justificativa:</p>
            <p className="text-muted-foreground">
              A execução de backup sem autorização formal ou sem a presença do
              usuário <strong>violaria normas internas</strong> de segurança,
              confidencialidade e integridade da informação, bem como{" "}
              <strong>boas práticas de governança de TI</strong> e proteção de
              dados.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">📋 Procedimento Correto</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm list-disc list-inside text-muted-foreground">
            <li>Orientar o usuário a realizar o backup pessoal antes da formatação.</li>
            <li>Solicitar confirmação formal de que os dados foram salvos.</li>
            <li>Documentar no chamado a ciência do usuário sobre a perda de dados não salvos.</li>
            <li>Em caso de recusa ou ausência do usuário, encerrar o chamado citando a LGPD.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
