import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  BookOpen, ChevronDown, ChevronUp, Database, Shield, Keyboard,
  Layout, Clock, FileText, Monitor, Users, CheckSquare, Download,
  Upload, Archive, Layers, Code, Cpu, HardDrive, Globe, Zap
} from "lucide-react";

declare const __APP_VERSION__: string;

interface DocSection {
  id: string;
  title: string;
  icon: React.ElementType;
  content: React.ReactNode;
}

const KeyboardShortcuts = () => (
  <div className="space-y-3">
    <p className="text-sm text-muted-foreground">
      Use atalhos de teclado para navegar rapidamente entre as seções do sistema.
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {[
        { keys: "Alt + 1", action: "Painel (Timer, Histórico, Logs)" },
        { keys: "Alt + 2", action: "Procedimentos" },
        { keys: "Alt + 3", action: "Fila Remota" },
        { keys: "Alt + 4", action: "Fila Presencial" },
        { keys: "Alt + 5", action: "Checklists" },
        { keys: "Alt + 6", action: "Manual" },
        { keys: "Alt + 7", action: "Documentação" },
      ].map((s) => (
        <div key={s.keys} className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
          <kbd className="px-2 py-1 rounded bg-background border text-xs font-mono font-bold shrink-0">
            {s.keys}
          </kbd>
          <span className="text-sm">{s.action}</span>
        </div>
      ))}
    </div>
  </div>
);

const TimerDoc = () => (
  <div className="space-y-4">
    <p className="text-sm text-muted-foreground">
      O Timer de Ordens de Serviço controla o tempo de atendimento com alarmes automáticos.
    </p>
    <div className="space-y-3">
      <h4 className="font-semibold text-sm">Como usar:</h4>
      <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
        <li>Digite o número da WO (apenas números) no campo com prefixo <Badge variant="outline" className="font-mono text-xs">WO00000</Badge></li>
        <li>Clique <strong>Adicionar</strong> ou pressione <kbd className="px-1 rounded bg-muted border text-xs">Enter</kbd></li>
        <li>O timer inicia automaticamente em contagem progressiva</li>
        <li>Aos <strong>35 minutos</strong>, um aviso amarelo aparece (5 min antes)</li>
        <li>Aos <strong>40 minutos</strong>, alarme sonoro contínuo é ativado</li>
        <li>Use <strong>Silenciar</strong> (+40min) ou <strong>Salvar</strong> (finaliza e salva no histórico)</li>
      </ol>
    </div>
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3">
      <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">
        ⚠️ Letras e caracteres especiais não são aceitos no campo de WO. Um beep sonoro será emitido ao tentar digitá-los.
      </p>
    </div>
  </div>
);

const HistoryDoc = () => (
  <div className="space-y-4">
    <p className="text-sm text-muted-foreground">
      O Histórico de Chamados armazena todas as WOs concluídas, agrupadas por mês e dia.
    </p>
    <div className="space-y-3">
      <h4 className="font-semibold text-sm">Funcionalidades:</h4>
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li className="flex items-start gap-2">
          <Archive className="w-4 h-4 mt-0.5 text-amber-500 shrink-0" />
          <span><strong>Arquivar:</strong> Move chamados para o arquivo (individual ou dia inteiro)</span>
        </li>
        <li className="flex items-start gap-2">
          <Download className="w-4 h-4 mt-0.5 text-primary shrink-0" />
          <span><strong>Exportar Backup:</strong> Salva JSON com histórico + arquivo</span>
        </li>
        <li className="flex items-start gap-2">
          <Upload className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
          <span><strong>Importar Backup:</strong> Restaura dados de arquivo JSON</span>
        </li>
      </ul>
    </div>
    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md p-3">
      <p className="text-xs text-red-800 dark:text-red-200 font-medium">
        🔴 IMPORTANTE: Ao fechar o navegador, os dados de histórico e logs serão apagados na próxima sessão. Sempre exporte o backup antes de fechar!
      </p>
    </div>
  </div>
);

const ProceduresDoc = () => (
  <div className="space-y-4">
    <p className="text-sm text-muted-foreground">
      Base de conhecimento com procedimentos técnicos documentados. Suporta CRUD completo.
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {[
        { label: "Categorias", desc: "Instalação, Manutenção, Configuração, Suporte, Reparo" },
        { label: "Campos", desc: "Título, Descrição, Solução, Tags, PIB, Usuário, Setor" },
        { label: "Busca", desc: "Por título, descrição, solução, tags, PIB ou técnico" },
        { label: "Exportação", desc: "CSV, JSON, TXT e backup completo" },
      ].map((item) => (
        <div key={item.label} className="p-3 rounded-md bg-muted/50 border">
          <p className="text-sm font-medium">{item.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

const QueuesDoc = () => (
  <div className="space-y-4">
    <p className="text-sm text-muted-foreground">
      Templates para filas de atendimento remoto e presencial com geração automática de notas para o Remedy.
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Monitor className="w-4 h-4 text-blue-500" /> Fila Remota
        </h4>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Conclusão (Remoto, Impressora, Compartilhamento)</li>
          <li>Diagnóstico Remoto</li>
          <li>Devolução Remoto → Presencial</li>
          <li>Improdutiva (Outras, P. Outras)</li>
        </ul>
      </div>
      <div className="space-y-2">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-500" /> Fila Presencial
        </h4>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Atendimento Presencial</li>
          <li>Impressora Presencial</li>
          <li>SIGESF (Totem)</li>
          <li>Formatação</li>
          <li>Diagnóstico Genérico</li>
        </ul>
      </div>
    </div>
  </div>
);

const DatabaseDoc = () => (
  <div className="space-y-4">
    <p className="text-sm text-muted-foreground">
      O sistema utiliza armazenamento local (localStorage) para dados efêmeros e Lovable Cloud para persistência.
    </p>

    <div className="space-y-3">
      <h4 className="font-semibold text-sm flex items-center gap-2">
        <HardDrive className="w-4 h-4 text-primary" /> localStorage (limpo em nova sessão)
      </h4>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left p-2 border font-medium">Chave</th>
              <th className="text-left p-2 border font-medium">Descrição</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["workOrderHistory", "Histórico de WOs concluídas por data"],
              ["workOrderArchive", "WOs arquivadas por data"],
              ["activity_logs_local", "Log de atividades (máx. 200)"],
              ["procedures", "Base de procedimentos técnicos"],
              ["app_version", "Versão do app instalada"],
              ["theme", "Tema claro/escuro"],
            ].map(([key, desc]) => (
              <tr key={key} className="hover:bg-muted/30">
                <td className="p-2 border font-mono text-primary">{key}</td>
                <td className="p-2 border text-muted-foreground">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <div className="space-y-3">
      <h4 className="font-semibold text-sm flex items-center gap-2">
        <Globe className="w-4 h-4 text-emerald-500" /> Tabelas no Banco (Lovable Cloud)
      </h4>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left p-2 border font-medium">Tabela</th>
              <th className="text-left p-2 border font-medium">Descrição</th>
              <th className="text-left p-2 border font-medium">Permissões</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["app_config", "Configurações globais (versão)", "SELECT, INSERT, UPDATE"],
              ["procedures", "Procedimentos técnicos", "SELECT, INSERT, UPDATE, DELETE"],
              ["completed_work_orders", "WOs concluídas", "SELECT, INSERT, DELETE"],
              ["activity_logs", "Registros de atividade", "SELECT, INSERT"],
            ].map(([table, desc, perms]) => (
              <tr key={table} className="hover:bg-muted/30">
                <td className="p-2 border font-mono text-primary">{table}</td>
                <td className="p-2 border text-muted-foreground">{desc}</td>
                <td className="p-2 border">
                  <div className="flex flex-wrap gap-1">
                    {(perms as string).split(", ").map((p) => (
                      <Badge key={p} variant="secondary" className="text-[10px] px-1 py-0">{p}</Badge>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const SecurityDoc = () => (
  <div className="space-y-4">
    <p className="text-sm text-muted-foreground">
      Medidas de segurança implementadas para proteger o sistema e os dados.
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {[
        { icon: Shield, title: "Autenticação", desc: "Login via email/senha ou Google OAuth com whitelist de emails autorizados" },
        { icon: Zap, title: "Bloqueio de DevTools", desc: "Clique direito, F12, Ctrl+Shift+I bloqueados com feedback sonoro" },
        { icon: Code, title: "Sanitização XSS", desc: "Inputs sanitizados contra tags HTML e padrões maliciosos" },
        { icon: Keyboard, title: "Validação de WO", desc: "Apenas números permitidos, máximo 20 caracteres" },
      ].map((item) => (
        <div key={item.title} className="flex gap-3 p-3 rounded-md bg-muted/50 border">
          <item.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">{item.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ArchitectureDoc = () => (
  <div className="space-y-4">
    <p className="text-sm text-muted-foreground">
      Stack tecnológica e estrutura do projeto.
    </p>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {[
        { name: "React 18", desc: "Framework UI" },
        { name: "TypeScript", desc: "Tipagem" },
        { name: "Vite", desc: "Build tool" },
        { name: "Tailwind CSS", desc: "Estilos" },
        { name: "shadcn/ui", desc: "Componentes" },
        { name: "Lovable Cloud", desc: "Backend" },
        { name: "TanStack Query", desc: "Estado async" },
        { name: "React Router", desc: "Rotas" },
        { name: "date-fns", desc: "Datas (pt-BR)" },
      ].map((tech) => (
        <div key={tech.name} className="p-2 rounded-md bg-muted/50 border text-center">
          <p className="text-xs font-bold">{tech.name}</p>
          <p className="text-[10px] text-muted-foreground">{tech.desc}</p>
        </div>
      ))}
    </div>

    <div className="space-y-2">
      <h4 className="font-semibold text-sm">Estrutura de Arquivos:</h4>
      <div className="bg-muted/50 rounded-md p-3 font-mono text-xs space-y-0.5 overflow-x-auto">
        <p>src/</p>
        <p className="pl-4">├── components/</p>
        <p className="pl-8">├── ui/ <span className="text-muted-foreground">— shadcn/ui</span></p>
        <p className="pl-8">├── ActivityLog.tsx <span className="text-muted-foreground">— Log local</span></p>
        <p className="pl-8">├── AppSidebar.tsx <span className="text-muted-foreground">— Menu lateral</span></p>
        <p className="pl-8">├── AuthGuard.tsx <span className="text-muted-foreground">— Proteção de rotas</span></p>
        <p className="pl-8">├── Changelog.tsx <span className="text-muted-foreground">— Log de versões</span></p>
        <p className="pl-8">├── CompletedWorkOrders.tsx <span className="text-muted-foreground">— Histórico WOs</span></p>
        <p className="pl-8">├── DocumentationPage.tsx <span className="text-muted-foreground">— Esta página</span></p>
        <p className="pl-8">└── WorkTimer.tsx <span className="text-muted-foreground">— Timer de WOs</span></p>
        <p className="pl-4">├── lib/</p>
        <p className="pl-8">├── activityLogger.ts <span className="text-muted-foreground">— Logs localStorage</span></p>
        <p className="pl-8">└── security.ts <span className="text-muted-foreground">— Validação/XSS</span></p>
        <p className="pl-4">├── pages/</p>
        <p className="pl-8">├── Index.tsx <span className="text-muted-foreground">— App principal</span></p>
        <p className="pl-8">├── Login.tsx <span className="text-muted-foreground">— Tela de login</span></p>
        <p className="pl-8">└── NotFound.tsx <span className="text-muted-foreground">— Página 404</span></p>
        <p className="pl-4">└── integrations/ <span className="text-muted-foreground">— Lovable Cloud</span></p>
      </div>
    </div>
  </div>
);

const VersionDoc = () => (
  <div className="space-y-4">
    <p className="text-sm text-muted-foreground">
      O sistema de versionamento garante que todos os usuários estejam na versão mais recente.
    </p>
    <ul className="space-y-2 text-sm text-muted-foreground">
      <li className="flex items-start gap-2">
        <Zap className="w-4 h-4 mt-0.5 text-primary shrink-0" />
        <span>Versão exibida no cabeçalho e tela de login</span>
      </li>
      <li className="flex items-start gap-2">
        <Globe className="w-4 h-4 mt-0.5 text-primary shrink-0" />
        <span>Sincronização automática via Realtime — detecta novas versões e força atualização</span>
      </li>
      <li className="flex items-start gap-2">
        <HardDrive className="w-4 h-4 mt-0.5 text-primary shrink-0" />
        <span>Botão "Limpar Cache" limpa Service Workers, caches e recarrega a página</span>
      </li>
    </ul>
  </div>
);

export const DocumentationPage = () => {
  const APP_VERSION = String(__APP_VERSION__);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["atalhos"]));

  const toggleSection = (id: string) => {
    const next = new Set(openSections);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setOpenSections(next);
  };

  const expandAll = () => {
    setOpenSections(new Set(sections.map((s) => s.id)));
  };

  const collapseAll = () => {
    setOpenSections(new Set());
  };

  const sections: DocSection[] = [
    { id: "atalhos", title: "Atalhos de Teclado", icon: Keyboard, content: <KeyboardShortcuts /> },
    { id: "timer", title: "Timer de Ordens de Serviço", icon: Clock, content: <TimerDoc /> },
    { id: "historico", title: "Histórico de Chamados", icon: Archive, content: <HistoryDoc /> },
    { id: "procedimentos", title: "Procedimentos Técnicos", icon: FileText, content: <ProceduresDoc /> },
    { id: "filas", title: "Filas de Atendimento", icon: Layers, content: <QueuesDoc /> },
    { id: "banco", title: "Banco de Dados e Armazenamento", icon: Database, content: <DatabaseDoc /> },
    { id: "seguranca", title: "Segurança", icon: Shield, content: <SecurityDoc /> },
    { id: "arquitetura", title: "Arquitetura e Stack", icon: Cpu, content: <ArchitectureDoc /> },
    { id: "versionamento", title: "Versionamento e Sincronização", icon: Zap, content: <VersionDoc /> },
  ];

  return (
    <Card className="p-4 sm:p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Documentação do Sistema</h2>
              <p className="text-sm text-muted-foreground">Guia completo de uso, arquitetura e referência técnica</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={expandAll}>
              <ChevronDown className="w-3 h-3 mr-1" />
              Expandir
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={collapseAll}>
              <ChevronUp className="w-3 h-3 mr-1" />
              Recolher
            </Button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Seções", value: sections.length, color: "text-primary" },
            { label: "Tabelas DB", value: "4", color: "text-emerald-500" },
            { label: "Atalhos", value: "7", color: "text-amber-500" },
            { label: "Versão", value: APP_VERSION, color: "text-violet-500" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-3 rounded-md bg-muted/50 border">
              <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {sections.map((section) => {
            const isOpen = openSections.has(section.id);
            return (
              <Collapsible key={section.id} open={isOpen} onOpenChange={() => toggleSection(section.id)}>
                <CollapsibleTrigger className="w-full">
                  <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 ${isOpen ? "bg-muted/30 border-primary/30" : ""}`}>
                    <div className="flex items-center gap-3">
                      <section.icon className={`w-5 h-5 ${isOpen ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="font-medium text-sm">{section.title}</span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-3 pb-3 pt-2 ml-8 border-l-2 border-primary/20">
                    {section.content}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Desenvolvido por <strong>Marcondes Jorge Machado</strong> — Documentação atualizada em Março 2026
          </p>
        </div>
      </div>
    </Card>
  );
};
