import { Clock, FileText, Monitor, Users, CheckSquare, BookOpen, Sun, Moon, LogOut, RefreshCw, FileCode, Megaphone, Terminal, HardDrive, Printer } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { refreshAppShell } from "@/lib/appRefresh";

const APP_VERSION = String(__APP_VERSION__).replace(/^v/i, '');
const BUILD_TIMESTAMP = String(__BUILD_TIMESTAMP__);

const SUPERVISOR_EMAIL = "supervisores.hepta@gmail.com";

interface AppSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const menuItems = [
  {
    title: "Painel",
    id: "painel",
    icon: Clock,
    description: "Timer, Histórico, Logs",
    shortcut: "1",
  },
  {
    title: "Procedimentos",
    id: "procedimentos",
    icon: FileText,
    description: "Base de conhecimento",
    shortcut: "2",
  },
  {
    title: "Fila Remota",
    id: "fila-remota",
    icon: Monitor,
    description: "Atendimentos remotos",
    shortcut: "3",
  },
  {
    title: "Fila Presencial",
    id: "fila-presencial",
    icon: Users,
    description: "Atendimentos presenciais",
    shortcut: "4",
  },
  {
    title: "Checklists",
    id: "checklists",
    icon: CheckSquare,
    description: "Guias técnicos",
    shortcut: "5",
  },
  {
    title: "Manual",
    id: "manual",
    icon: BookOpen,
    description: "Como usar o sistema",
    shortcut: "6",
  },
  {
    title: "Documentação",
    id: "documentacao",
    icon: FileCode,
    description: "Referência técnica completa",
    shortcut: "7",
  },
  {
    title: "Robocopy",
    id: "robocopy",
    icon: Terminal,
    description: "Comando de cópia em rede",
    shortcut: "8",
  },
  {
    title: "Formatação",
    id: "formatacao",
    icon: HardDrive,
    description: "Política de backup e LGPD",
    shortcut: "9",
  },
  {
    title: "Impressora SIGESF",
    id: "sigesf-impressora",
    icon: Printer,
    description: "POP TOTEM Windows 7",
    shortcut: "i",
  },
  {
    title: "Mensagens",
    id: "mensagens-supervisores",
    icon: Megaphone,
    description: "Gerenciar avisos",
    shortcut: "0",
    supervisorOnly: true,
  },
];

export function AppSidebar({ activeView, onViewChange }: AppSidebarProps) {
  const { state, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark') || 
      localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const email = session?.user?.email || null;
      setUserEmail(email);
      const meta = session?.user?.user_metadata as { full_name?: string; name?: string } | undefined;
      const name = meta?.full_name || meta?.name || (email ? email.split("@")[0] : null);
      setUserName(name);
    });
  }, []);

  const isSupervisor = userEmail === SUPERVISOR_EMAIL;
  const visibleMenuItems = menuItems.filter(item => !item.supervisorOnly || isSupervisor);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Keyboard shortcuts: Alt+1 through Alt+6
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const item = menuItems.find(m => m.shortcut === e.key);
        if (item) {
          e.preventDefault();
          onViewChange(item.id);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onViewChange]);

  const handleNavClick = useCallback((id: string) => {
    onViewChange(id);
    // Close mobile sidebar after navigation
    setOpenMobile(false);
  }, [onViewChange, setOpenMobile]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Sessão encerrada");
    navigate("/login");
  };

  const handleClearCache = async () => {
    try {
      toast.success('Nova versão registrada. Limpando cache...', { duration: 2000 });
      await refreshAppShell(APP_VERSION, BUILD_TIMESTAMP);
    } catch {
      toast.error('Erro ao limpar cache');
    }
  };

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarContent className="flex flex-col h-full">
        {/* Logo / Title */}
        {!collapsed && (
          <div className="px-4 py-4 border-b border-border">
            <h2 className="text-sm font-bold text-primary truncate">Gestão de Procedimentos</h2>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">Sistema de Suporte Técnico</p>
          </div>
        )}

        <SidebarGroup className="flex-1 py-2">
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/70 px-3 mb-1">
            Navegação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMenuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => handleNavClick(item.id)}
                    isActive={activeView === item.id}
                    tooltip={`${item.title} — ${item.description} (Alt+${item.shortcut})`}
                    className="group relative transition-all duration-150"
                    aria-label={`${item.title}: ${item.description}`}
                    aria-current={activeView === item.id ? "page" : undefined}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && (
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-medium truncate">{item.title}</span>
                        <span className="text-[10px] text-muted-foreground truncate leading-tight">
                          {item.description}
                        </span>
                      </div>
                    )}
                    {!collapsed && (
                      <kbd className="inline-flex items-center text-[10px] font-bold text-primary-foreground bg-primary/90 border border-primary rounded px-1.5 h-5 font-mono shrink-0 shadow-sm" aria-hidden="true">
                        Alt+{item.shortcut}
                      </kbd>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom actions */}
        <div className="mt-auto border-t border-border">
          {!collapsed && userEmail && (
            <div className="px-3 py-2 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-[11px] font-bold text-primary-foreground uppercase">
                  {(userName || userEmail).charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground truncate" title={userName || ""}>
                    {userName}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate" title={userEmail}>
                    {userEmail}
                  </p>
                </div>
              </div>
            </div>
          )}
          <nav className="p-2 space-y-0.5" aria-label="Ações do sistema">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearCache}
              className="w-full justify-start gap-2.5 h-9 text-xs font-medium text-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Limpar cache do navegador e recarregar"
            >
              <RefreshCw className="h-4 w-4 shrink-0" />
              {!collapsed && "Limpar Cache"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDark(!isDark)}
              className="w-full justify-start gap-2.5 h-9 text-xs font-medium text-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
            >
              {isDark ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
              {!collapsed && (isDark ? "Modo Claro" : "Modo Escuro")}
            </Button>

            <Separator className="my-1" />

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start gap-2.5 h-9 text-xs font-medium text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
              aria-label="Encerrar sessão e sair"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && "Sair"}
            </Button>
          </nav>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
