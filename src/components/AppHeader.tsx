import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { format } from "date-fns";

interface AppHeaderProps {
  currentDateTime: Date;
  isAppUpToDate: boolean;
}

declare const __APP_VERSION__: string;

export const AppHeader = ({ currentDateTime, isAppUpToDate }: AppHeaderProps) => {
  return (
    <header className="bg-gradient-primary text-white shadow-elevated sticky top-0 z-10" role="banner">
      <div className="px-3 py-2 md:px-6 md:py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <SidebarTrigger className="text-white hover:bg-white/10 shrink-0" aria-label="Abrir/fechar menu lateral" />
          <div className="min-w-0">
            <h1 className="text-sm md:text-lg font-bold truncate">Gestão de Procedimentos</h1>
            <p className="text-white/70 text-[10px] md:text-xs truncate">Sistema de Suporte Técnico</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <time className="text-white/90 font-mono text-[10px] md:text-sm tabular-nums" dateTime={currentDateTime.toISOString()}>
            {format(currentDateTime, "dd/MM/yyyy, HH:mm:ss")}
          </time>
          <span className="text-white/50 text-[10px] font-mono hidden md:inline" aria-label="Versão do aplicativo">
            {String(__APP_VERSION__)}
          </span>
          {isAppUpToDate ? (
            <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-[10px] cursor-default hidden sm:inline-flex">
              ✓ Atualizado
            </Badge>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-[10px] text-amber-200 hover:text-white hover:bg-white/10 border border-amber-400/40"
              onClick={() => {
                if ('caches' in window) {
                  caches.keys().then(names => {
                    names.forEach(name => caches.delete(name));
                  });
                }
                localStorage.removeItem('app_version');
                window.location.reload();
              }}
              aria-label="Atualizar aplicação"
            >
              ⟳ Atualizar
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
