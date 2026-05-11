import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { refreshAppShell } from "@/lib/appRefresh";
import { format } from "date-fns";

interface AppHeaderProps {
  currentDateTime: Date;
  isAppUpToDate: boolean;
}

declare const __APP_VERSION__: string;
declare const __BUILD_TIMESTAMP__: string;

export const AppHeader = ({ currentDateTime, isAppUpToDate }: AppHeaderProps) => {
  return (
    <header className="bg-gradient-primary text-white shadow-elevated sticky top-0 z-10" role="banner">
      <div className="px-3 py-2 md:px-6 md:py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <SidebarTrigger
            className="text-white hover:bg-white/10 shrink-0 h-10 w-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            aria-label="Abrir ou fechar menu lateral de navegação"
          />
          <div className="min-w-0">
            <h1 className="text-sm md:text-lg font-bold truncate" id="app-title">Gestão de Procedimentos</h1>
            <p className="text-white/70 text-[10px] md:text-xs truncate">Sistema de Suporte Técnico</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <time
            className="text-white/90 font-mono text-[10px] md:text-sm tabular-nums"
            dateTime={currentDateTime.toISOString()}
            aria-label={`Data e hora atuais: ${format(currentDateTime, "dd/MM/yyyy HH:mm:ss")}`}
          >
            {format(currentDateTime, "dd/MM/yyyy, HH:mm:ss")}
          </time>
          <span
            className="text-white/50 text-[10px] font-mono hidden md:inline"
            aria-label={`Versão do aplicativo ${String(__APP_VERSION__)}`}
          >
            {String(__APP_VERSION__)}
          </span>
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            data-testid="app-update-status"
            className="contents"
          >
          {isAppUpToDate ? (
            <Badge
              className="bg-emerald-500/20 text-emerald-50 border-emerald-300/50 text-[10px] cursor-default hidden sm:inline-flex"
              aria-label="Aplicação está atualizada"
            >
              ✓ Atualizado
            </Badge>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="h-9 px-3 text-xs text-amber-50 hover:text-white hover:bg-white/10 border border-amber-300/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              onClick={async () => {
                await refreshAppShell(String(__APP_VERSION__), String(__BUILD_TIMESTAMP__));
              }}
              aria-label="Nova versão disponível. Clique para atualizar a aplicação"
            >
              ⟳ Atualizar
            </Button>
          )}
          </div>
        </div>
      </div>
    </header>
  );
};
