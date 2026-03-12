import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { PainelView } from "@/components/views/PainelView";
import { ProcedimentosView } from "@/components/views/ProcedimentosView";
import { FilaRemotaView } from "@/components/views/FilaRemotaView";
import { FilaPresencialView } from "@/components/views/FilaPresencialView";
import { ChecklistsView } from "@/components/views/ChecklistsView";
import { ManualView } from "@/components/views/ManualView";
import { SupervisorMessagesView } from "@/components/views/SupervisorMessagesView";
import { DocumentationPage } from "@/components/DocumentationPage";
import { ProcedureDetailDialog } from "@/components/ProcedureDetailDialog";
import { useProcedures } from "@/hooks/useProcedures";
import { useAppVersion } from "@/hooks/useAppVersion";
import { Procedure } from "@/types/procedure";

declare const __APP_VERSION__: string;

const Index = () => {
  const APP_VERSION = String(__APP_VERSION__).replace(/^v/i, '');
  const BUILD_TIMESTAMP = String(__BUILD_TIMESTAMP__);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [activeView, setActiveView] = useState("painel");
  const [viewHistory, setViewHistory] = useState<string[]>(["painel"]);
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);

  // Wrap setActiveView to also push browser history
  const handleViewChange = useCallback((view: string) => {
    setActiveView(view);
    setViewHistory(prev => [...prev, view]);
    window.history.pushState({ view }, "", "/");
  }, []);

  // Intercept native back button
  useEffect(() => {
    // Push initial state
    window.history.replaceState({ view: "painel" }, "", "/");

    const handlePopState = (e: PopStateEvent) => {
      if (e.state?.view) {
        setActiveView(e.state.view);
        setViewHistory(prev => prev.slice(0, -1));
      } else {
        // If no more view history, push state again to prevent leaving the page
        setActiveView("painel");
        window.history.pushState({ view: "painel" }, "", "/");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const {
    procedures, isLoading, showImportDialog, setShowImportDialog,
    createProcedure, updateProcedure, moveProcedure,
    importBackup, exportBackup, touchProcedureDate,
  } = useProcedures();

  const { isAppUpToDate } = useAppVersion(APP_VERSION, BUILD_TIMESTAMP);

  // Block context menu and dev tools
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = 400; osc.type = "square";
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
      } catch {}
      toast.error("⚠️ Ação bloqueada!", { description: "Desenvolvido por Marcondes Jorge Machado", duration: 4000 });
    };
    document.addEventListener("contextmenu", handleContextMenu);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F12" || (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) || (e.ctrlKey && e.key === "u")) {
        e.preventDefault();
        toast.error("⚠️ Ação bloqueada!", { description: "Desenvolvido por Marcondes Jorge Machado", duration: 4000 });
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Session management
  useEffect(() => {
    const isExistingSession = sessionStorage.getItem('app_session_active');
    if (!isExistingSession) {
      const hadHistory = localStorage.getItem('workOrderHistory');
      const hadArchive = localStorage.getItem('workOrderArchive');
      const hadLogs = localStorage.getItem('activity_logs_local');
      if (hadHistory || hadArchive || hadLogs) {
        localStorage.removeItem('workOrderHistory');
        localStorage.removeItem('workOrderArchive');
        localStorage.removeItem('activity_logs_local');
        // Notify components to refresh their state after cleanup
        window.dispatchEvent(new CustomEvent('session_data_cleared'));
        window.dispatchEvent(new CustomEvent('activity_log_updated'));
        toast.warning('📋 Nova sessão detectada — históricos e logs foram limpos.', { description: 'Lembre-se de importar seu backup e salvar logs antes de fechar.', duration: 8000 });
      }
      sessionStorage.setItem('app_session_active', 'true');
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasHistory = localStorage.getItem('workOrderHistory');
      const hasLogs = localStorage.getItem('activity_logs_local');
      const hasArchive = localStorage.getItem('workOrderArchive');
      if (hasHistory || hasLogs || hasArchive) {
        e.preventDefault();
        e.returnValue = '⚠️ Você tem histórico e logs não salvos! Salve antes de sair.';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar activeView={activeView} onViewChange={setActiveView} />
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader currentDateTime={currentDateTime} isAppUpToDate={isAppUpToDate} />

           <main className="flex-1 px-3 py-4 md:px-6 md:py-6 overflow-auto" role="main">
            <div className={activeView === "painel" ? "" : "hidden"}><PainelView /></div>

            <div className={activeView === "procedimentos" ? "" : "hidden"}>
              <ProcedimentosView
                procedures={procedures}
                isLoading={isLoading}
                showImportDialog={showImportDialog}
                setShowImportDialog={setShowImportDialog}
                createProcedure={createProcedure}
                exportBackup={exportBackup}
                importBackup={importBackup}
                moveProcedure={moveProcedure}
                onSelectProcedure={setSelectedProcedure}
                touchProcedureDate={touchProcedureDate}
              />
            </div>

            <div className={activeView === "fila-remota" ? "" : "hidden"}>
              <FilaRemotaView procedures={procedures} onSelectProcedure={setSelectedProcedure} touchProcedureDate={touchProcedureDate} />
            </div>

            <div className={activeView === "fila-presencial" ? "" : "hidden"}>
              <FilaPresencialView procedures={procedures} onSelectProcedure={setSelectedProcedure} touchProcedureDate={touchProcedureDate} />
            </div>

            <div className={activeView === "checklists" ? "" : "hidden"}><ChecklistsView /></div>

            <div className={activeView === "manual" ? "" : "hidden"}><ManualView /></div>

            <div className={activeView === "documentacao" ? "" : "hidden"}>
              <section aria-label="Documentação do sistema"><DocumentationPage /></section>
            </div>

            <div className={activeView === "mensagens-supervisores" ? "" : "hidden"}>
              <SupervisorMessagesView />
            </div>
          </main>

          <ProcedureDetailDialog
            selectedProcedure={selectedProcedure}
            onClose={() => setSelectedProcedure(null)}
            onUpdate={(proc) => { updateProcedure(proc); setSelectedProcedure(proc); }}
          />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
