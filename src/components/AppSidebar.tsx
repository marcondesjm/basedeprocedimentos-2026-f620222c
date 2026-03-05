import { Clock, FileText, Monitor, Users, CheckSquare, BookOpen, Sun, Moon, LogOut, RefreshCw } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

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
  },
  {
    title: "Procedimentos",
    id: "procedimentos",
    icon: FileText,
    description: "Base de conhecimento",
  },
  {
    title: "Fila Remota",
    id: "fila-remota",
    icon: Monitor,
    description: "Atendimentos remotos",
  },
  {
    title: "Fila Presencial",
    id: "fila-presencial",
    icon: Users,
    description: "Atendimentos presenciais",
  },
  {
    title: "Checklists",
    id: "checklists",
    icon: CheckSquare,
    description: "Guias técnicos",
  },
  {
    title: "Manual",
    id: "manual",
    icon: BookOpen,
    description: "Como usar o sistema",
  },
];

export function AppSidebar({ activeView, onViewChange }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark') || 
      localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Sessão encerrada");
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex flex-col h-full">
        {/* Logo / Title */}
        {!collapsed && (
          <div className="px-4 py-4 border-b border-border">
            <h2 className="text-sm font-bold text-primary truncate">Gestão de Procedimentos</h2>
            <p className="text-[10px] text-muted-foreground truncate mt-0.5">Sistema de Suporte</p>
          </div>
        )}

        <SidebarGroup className="flex-1">
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onViewChange(item.id)}
                    isActive={activeView === item.id}
                    tooltip={item.title}
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom actions */}
        <div className="mt-auto p-2 border-t border-border space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDark(!isDark)}
            className="w-full justify-start gap-2 h-8 text-xs"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {!collapsed && (isDark ? "Modo Claro" : "Modo Escuro")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start gap-2 h-8 text-xs text-destructive hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && "Sair"}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
