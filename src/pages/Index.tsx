import { useState, useEffect } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, FileText, Calendar, Tag, Download, Upload, Save, Shield, X, Copy, AlertCircle, Monitor, Users, CheckSquare, ArrowRight, ChevronDown, BookOpen, Mail } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { WorkTimer } from "@/components/WorkTimer";
import { CompletedWorkOrders } from "@/components/CompletedWorkOrders";
import { Changelog } from "@/components/Changelog";
import { ActivityLog } from "@/components/ActivityLog";
import { logActivity } from "@/lib/activityLogger";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

type NoteType = "procedimento" | "diagnostico";

interface Procedure {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  solution: string;
  createdAt: string;
  createdBy: string;
  pibEquipamento?: string;
  usuarioAtendido?: string;
  workOrder?: string;
  noteType?: NoteType;
  setorDirecionado?: string;
  justificativa?: string;
  possuiProcedimentoBC?: "sim" | "nao";
  nomeArquivoBC?: string;
  filaRemotaCategory?: string;
  filaPresencialCategory?: string;
}

const Index = () => {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [expandedProcedures, setExpandedProcedures] = useState<Set<string>>(new Set());
  const [activeView, setActiveView] = useState("painel");
  const [isAppUpToDate, setIsAppUpToDate] = useState(() => {
    return localStorage.getItem('app_version') === '2.5.0';
  });

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      // Beep sonoro
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 400;
        osc.type = "square";
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } catch {}
      toast.error("⚠️ Ação bloqueada!", {
        description: "Desenvolvido por Marcondes Jorge Machado",
        duration: 4000,
      });
    };
    document.addEventListener("contextmenu", handleContextMenu);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
        (e.ctrlKey && e.key === "u")
      ) {
        e.preventDefault();
        toast.error("⚠️ Ação bloqueada!", {
          description: "Desenvolvido por Marcondes Jorge Machado",
          duration: 4000,
        });
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedProcedure, setEditedProcedure] = useState<Procedure | null>(null);
  const [devolucaoNome, setDevolucaoNome] = useState("");
  const [devolucaoPib, setDevolucaoPib] = useState("");
  const [devolucaoWo, setDevolucaoWo] = useState("");
  const [devolucaoPibMicro, setDevolucaoPibMicro] = useState("");
  const [diagRemotoSetor, setDiagRemotoSetor] = useState("");
  const [diagRemotoNome, setDiagRemotoNome] = useState("");
  const [diagRemotoPib, setDiagRemotoPib] = useState("");
  const [diagRemotoPibMicro, setDiagRemotoPibMicro] = useState("");
  const [improdOutrasNome, setImprodOutrasNome] = useState("");
  const [improdOutrasJustificativa, setImprodOutrasJustificativa] = useState("");
  const [improdOutrasPNome, setImprodOutrasPNome] = useState("");
  const [improdOutrasPJustificativa, setImprodOutrasPJustificativa] = useState("");
  const [devPresPib, setDevPresPib] = useState("");
  const [devPresIp, setDevPresIp] = useState("");
  const [devPresPibMicro, setDevPresPibMicro] = useState("");
  const [presencialPibMicro, setPresencialPibMicro] = useState("");
  const [formatPibMicro, setFormatPibMicro] = useState("");
  
  const [diagGenPibMicro, setDiagGenPibMicro] = useState("");
  const [sigesfPibMicro, setSigesfPibMicro] = useState("");
  const [analiseProblemasOpen, setAnaliseProblemasOpen] = useState(false);
  const [analiseChecks, setAnaliseChecks] = useState<Record<string, boolean>>({});
  const [milestoneOpen, setMilestoneOpen] = useState(false);
  const [formatacaoRemotaOpen, setFormatacaoRemotaOpen] = useState(false);
  const [espansoOpen, setEspansoOpen] = useState(false);
  const [atualizacaoFerramentaOpen, setAtualizacaoFerramentaOpen] = useState(false);
  const [preparacaoFerramentaOpen, setPreparacaoFerramentaOpen] = useState(false);
  const [totemOpen, setTotemOpen] = useState(false);
  const [baseConhecimentoOpen, setBaseConhecimentoOpen] = useState(false);
  const [compartNome, setCompartNome] = useState("");
  const [compartPib, setCompartPib] = useState("");
  const [compartPibMicro, setCompartPibMicro] = useState("");
  const [compartLink, setCompartLink] = useState("");
  const [compartAtalho, setCompartAtalho] = useState("");
  const [impressoraNome, setImpressoraNome] = useState("");
  const [impressoraPibImps, setImpressoraPibImps] = useState<string[]>([""]);
  const [impressoraIpImps, setImpressoraIpImps] = useState<string[]>([""]);
  const [impressoraPibMicros, setImpressoraPibMicros] = useState<string[]>([""]);
  const [conclusaoNome, setConclusaoNome] = useState("");
  const [conclusaoPib, setConclusaoPib] = useState("");
  const [conclusaoPibMicro, setConclusaoPibMicro] = useState("");
  const [presencialNome, setPresencialNome] = useState("");
  const [presencialPib, setPresencialPib] = useState("");
  const [presencialIp, setPresencialIp] = useState("");
  const [presencialData, setPresencialData] = useState("");
  const [formatNome, setFormatNome] = useState("");
  const [formatPib, setFormatPib] = useState("");
  const [formatIp, setFormatIp] = useState("");
  const [formatData, setFormatData] = useState("");
  const [impPresNome, setImpPresNome] = useState("");
  const [impPresPibImps, setImpPresPibImps] = useState<string[]>([""]);
  const [impPresIpImps, setImpPresIpImps] = useState<string[]>([""]);
  const [impPresPibMicros, setImpPresPibMicros] = useState<string[]>([""]);

  const [impPresData, setImpPresData] = useState("");
  const [impPresSetor, setImpPresSetor] = useState("");
  const [diagGenNome, setDiagGenNome] = useState("");
  const [diagGenPib, setDiagGenPib] = useState("");
  const [diagGenSetor, setDiagGenSetor] = useState("");
  const [sigesfDirecionar, setSigesfDirecionar] = useState("");
  const [sigesfData, setSigesfData] = useState("");
  const [sigesfNome, setSigesfNome] = useState("");
  const [sigesfPib, setSigesfPib] = useState("");
  const [sigesfIp, setSigesfIp] = useState("");
  const [sigesfModelo, setSigesfModelo] = useState("");
  const [expandedQueueProcs, setExpandedQueueProcs] = useState<Set<string>>(new Set());

  const [showImportDialog, setShowImportDialog] = useState(false);

  const [newProcedure, setNewProcedure] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
    solution: "",
    createdBy: "",
    pibEquipamento: "",
    usuarioAtendido: "",
    workOrder: "",
    noteType: "procedimento" as NoteType,
    setorDirecionado: "",
    justificativa: "",
    possuiProcedimentoBC: "" as "sim" | "nao" | "",
    nomeArquivoBC: "",
  });

  useEffect(() => {
    loadProcedures();
    
    // Detectar nova sessão de navegador e limpar históricos
    const isExistingSession = sessionStorage.getItem('app_session_active');
    if (!isExistingSession) {
      // Nova sessão — limpar dados de WO history/archive
      const hadHistory = localStorage.getItem('workOrderHistory');
      const hadArchive = localStorage.getItem('workOrderArchive');
      
      if (hadHistory || hadArchive) {
        localStorage.removeItem('workOrderHistory');
        localStorage.removeItem('workOrderArchive');
        toast.warning('📋 Nova sessão detectada — histórico de WOs foi limpo.', {
          description: 'Lembre-se de importar seu backup se necessário.',
          duration: 8000,
        });
      }
      
      sessionStorage.setItem('app_session_active', 'true');
    }
    
    // Mostrar dialog de importação se não houver dados salvos
    const savedProcedures = localStorage.getItem('procedures');
    if (!savedProcedures || JSON.parse(savedProcedures).length === 0) {
      setShowImportDialog(true);
    }

    // Aviso ao sair da aplicação
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '⚠️ Faça backup dos seus dados antes de sair! O histórico será apagado ao abrir em outro navegador.';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [procedures.length]);

  // Auto-sync: verificar versão ao abrir e ouvir mudanças em tempo real
  useEffect(() => {
    const APP_VERSION = '2.6.0';

    const checkVersion = async () => {
      try {
        const { data } = await supabase
          .from('app_config')
          .select('value')
          .eq('key', 'current_version')
          .single();
        
        if (data && data.value !== APP_VERSION) {
          toast.info('🔄 Nova versão detectada! Atualizando...', { duration: 3000 });
          // Limpar cache do service worker
          if ('caches' in window) {
            const names = await caches.keys();
            await Promise.all(names.map(name => caches.delete(name)));
          }
          localStorage.removeItem('app_version');
          setTimeout(() => window.location.reload(), 2000);
        } else {
          setIsAppUpToDate(true);
          localStorage.setItem('app_version', APP_VERSION);
        }
      } catch (error) {
        console.error('Erro ao verificar versão:', error);
      }
    };

    checkVersion();

    // Escutar mudanças na tabela app_config em tempo real
    const channel = supabase
      .channel('app-version-sync')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'app_config', filter: 'key=eq.current_version' },
        (payload) => {
          const newVersion = payload.new?.value;
          if (newVersion && newVersion !== APP_VERSION) {
            toast.info('🔄 Atualização disponível! Recarregando...', { duration: 3000 });
            if ('caches' in window) {
              caches.keys().then(names => names.forEach(name => caches.delete(name)));
            }
            localStorage.removeItem('app_version');
            setTimeout(() => window.location.reload(), 2000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Atualizar data e hora a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const defaultProcedures: Procedure[] = [
    {
      id: "default-pinpad-001",
      title: "Configuração PINPAD - Conclusão Remoto",
      description: "Pinpad atualizou as tabelas",
      category: "CONFIGURAÇÃO",
      tags: ["PINPAD", "VNC", "Driver", "SARA"],
      solution: `- Realizado o acesso remoto via VNC, conforme autorizado pelo usuário;
- Realizado a instalação do Driver, disponível no deploy (\\\\sac3144).
- Realizado a importação das DLL.
- Realizado a configuração da Porta COM do PINPAD para COM1.
- Realizado validação junto ao usuário e orientado o mesmo a entrar em contato com a equipe do SARA para dar continuidade.
FAVOR DEIXAR O PINPAD NA PORTA QUE SE ENCONTRA A TRÁS NO MICRO. SE REMOVER ELE VAI PERDER A CONFIGURAÇÃO.`,
      createdAt: new Date().toISOString(),
      createdBy: "SUPORTE TÉCNICO HEPTA",
      pibEquipamento: "20435683",
      usuarioAtendido: "HILTON CARDOSO LOPES",
    }
  ];

  const loadProcedures = () => {
    try {
      const savedProcedures = localStorage.getItem('procedures');
      if (savedProcedures) {
        const parsed = JSON.parse(savedProcedures);
        if (parsed.length > 0) {
          setProcedures(parsed);
        } else {
          // Se não houver procedimentos, carregar os padrões
          setProcedures(defaultProcedures);
          saveProcedures(defaultProcedures);
        }
      } else {
        // Primeira vez - carregar procedimentos padrão
        setProcedures(defaultProcedures);
        saveProcedures(defaultProcedures);
      }
    } catch (error) {
      console.error('Erro ao carregar procedimentos:', error);
      toast.error('Erro ao carregar procedimentos');
    } finally {
      setIsLoading(false);
    }
  };

  const saveProcedures = (updatedProcedures: Procedure[]) => {
    try {
      localStorage.setItem('procedures', JSON.stringify(updatedProcedures));
    } catch (error) {
      console.error('Erro ao salvar procedimentos:', error);
      toast.error('Erro ao salvar procedimentos');
    }
  };

  const handleCreateProcedure = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formattedProcedure: Procedure = {
        id: crypto.randomUUID(),
        title: newProcedure.title,
        description: newProcedure.description,
        category: newProcedure.category,
        tags: newProcedure.tags.split(",").map(tag => tag.trim()).filter(tag => tag),
        solution: newProcedure.solution,
        createdAt: new Date().toISOString(),
        createdBy: "SUPORTE TÉCNICO HEPTA",
        pibEquipamento: newProcedure.pibEquipamento,
        usuarioAtendido: newProcedure.usuarioAtendido,
        noteType: newProcedure.noteType,
        setorDirecionado: newProcedure.setorDirecionado,
        justificativa: newProcedure.justificativa,
        possuiProcedimentoBC: newProcedure.possuiProcedimentoBC || undefined,
        nomeArquivoBC: newProcedure.nomeArquivoBC,
      };

      const updatedProcedures = [formattedProcedure, ...procedures];
      setProcedures(updatedProcedures);
      saveProcedures(updatedProcedures);
      
      setIsDialogOpen(false);
      setNewProcedure({
        title: "",
        description: "",
        category: "",
        tags: "",
        solution: "",
        createdBy: "",
        pibEquipamento: "",
        usuarioAtendido: "",
        workOrder: "",
        noteType: "procedimento",
        setorDirecionado: "",
        justificativa: "",
        possuiProcedimentoBC: "",
        nomeArquivoBC: "",
      });
      toast.success("Procedimento cadastrado com sucesso!");
      logActivity("create", "procedure", undefined, { title: newProcedure.title });
    } catch (error) {
      console.error('Erro ao criar procedimento:', error);
      toast.error('Erro ao criar procedimento');
    }
  };

  const handleUpdateProcedure = () => {
    if (!editedProcedure) return;
    
    try {
      const updatedProcedures = procedures.map(proc => 
        proc.id === editedProcedure.id ? editedProcedure : proc
      );
      
      setProcedures(updatedProcedures);
      saveProcedures(updatedProcedures);
      setSelectedProcedure(editedProcedure);
      setIsEditMode(false);
      toast.success("Procedimento atualizado com sucesso!");
      logActivity("update", "procedure", editedProcedure.id, { title: editedProcedure.title });
    } catch (error) {
      console.error('Erro ao atualizar procedimento:', error);
      toast.error('Erro ao atualizar procedimento');
    }
  };

  const handleDownloadCSV = () => {
    const headers = ['ID', 'Título', 'Descrição', 'Categoria', 'Tags', 'Solução', 'PIB Equipamento', 'Usuário Atendido', 'Data', 'Técnico'];
    const csvData = procedures.map(proc => [
      proc.id,
      proc.title,
      proc.description,
      proc.category,
      proc.tags.join('; '),
      proc.solution,
      proc.pibEquipamento || '',
      proc.usuarioAtendido || '',
      new Date(proc.createdAt).toLocaleString('pt-BR'),
      proc.createdBy,
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `procedimentos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Arquivo CSV baixado com sucesso!');
  };

  const handleDownloadJSON = () => {
    const jsonData = JSON.stringify(procedures, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `procedimentos_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Arquivo JSON baixado com sucesso!');
  };

  const handleDownloadTXT = () => {
    const txtContent = procedures.map((proc, index) => {
      return `
═══════════════════════════════════════════════════════════════
PROCEDIMENTO #${index + 1}
═══════════════════════════════════════════════════════════════

TÍTULO: ${proc.title}

CATEGORIA: ${proc.category}

DATA: ${new Date(proc.createdAt).toLocaleString('pt-BR')}

TÉCNICO RESPONSÁVEL: ${proc.createdBy}

PIB EQUIPAMENTO: ${proc.pibEquipamento || 'Não informado'}

USUÁRIO ATENDIDO: ${proc.usuarioAtendido || 'Não informado'}

TAGS: ${proc.tags.join(', ')}

-------------------------------------------------------------------
DESCRIÇÃO:
-------------------------------------------------------------------
${proc.description}

-------------------------------------------------------------------
SOLUÇÃO APLICADA:
-------------------------------------------------------------------
${proc.solution}

`;
    }).join('\n');

    const header = `
╔═══════════════════════════════════════════════════════════════╗
║         BASE DE PROCEDIMENTOS - EXPORTAÇÃO TXT                ║
║         Data de Exportação: ${new Date().toLocaleString('pt-BR')}         ║
║         Total de Procedimentos: ${procedures.length}                      ║
╚═══════════════════════════════════════════════════════════════╝

`;

    const fullContent = header + txtContent;
    
    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `procedimentos_${new Date().toISOString().split('T')[0]}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Arquivo TXT baixado com sucesso!');
  };

  const handleExportBackup = () => {
    const backup = {
      exportDate: new Date().toISOString(),
      version: "1.0",
      procedures: procedures
    };
    
    const jsonData = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `backup_procedimentos_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Backup exportado com sucesso!');
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const backup = JSON.parse(content);
        
        if (backup.procedures && Array.isArray(backup.procedures)) {
          const currentDate = new Date().toISOString();
          
          // Atualizar data de criação para data/hora atual
          const importedProcedures = backup.procedures.map((proc: Procedure) => ({
            ...proc,
            createdAt: currentDate
          }));
          
          // Mesclar com procedimentos existentes (evitar duplicatas por ID)
          const existingIds = new Set(procedures.map(p => p.id));
          const newProcedures = importedProcedures.filter(p => !existingIds.has(p.id));
          
          const mergedProcedures = [...procedures, ...newProcedures];
          setProcedures(mergedProcedures);
          saveProcedures(mergedProcedures);
          
          setShowImportDialog(false);
          toast.success(`${newProcedures.length} procedimentos importados com sucesso!`);
        } else {
          toast.error('Formato de arquivo inválido!');
        }
      } catch (error) {
        console.error('Erro ao importar backup:', error);
        toast.error('Erro ao importar arquivo. Verifique o formato.');
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadDescriptions = () => {
    const txtContent = procedures.map((proc, index) => {
      return `
═══════════════════════════════════════════════════════════════
PROCEDIMENTO #${index + 1}: ${proc.title}
═══════════════════════════════════════════════════════════════

${proc.description}

`;
    }).join('\n');

    const header = `
╔═══════════════════════════════════════════════════════════════╗
║         DESCRIÇÕES DOS PROCEDIMENTOS                          ║
║         Data de Exportação: ${new Date().toLocaleString('pt-BR')}         ║
║         Total de Procedimentos: ${procedures.length}                      ║
╚═══════════════════════════════════════════════════════════════╝

`;

    const fullContent = header + txtContent;
    
    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `descricoes_procedimentos_${new Date().toISOString().split('T')[0]}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Descrições baixadas com sucesso!');
  };

  const filteredProcedures = procedures.filter((proc) => {
    const matchesSearch = 
      proc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proc.solution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      proc.createdBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (proc.pibEquipamento && proc.pibEquipamento.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (proc.usuarioAtendido && proc.usuarioAtendido.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === "all" || proc.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const categories = ["INSTALAÇÃO", "MANUTENÇÃO", "CONFIGURAÇÃO", "SUPORTE", "REPARO"];

  const filaRemotaCategories = [
    { id: "conclusao-remoto", label: "Conclusão - Remoto", color: "border-l-primary" },
    { id: "conclusao-impressora", label: "Conclusão - Impressora", color: "border-l-primary" },
    { id: "conclusao-compartilhamento", label: "Conclusão - Compartilhamento", color: "border-l-primary" },
    { id: "diagnostico-remoto", label: "Diagnóstico - Remoto", color: "border-l-amber-500" },
    { id: "devolucao-remoto-presencial", label: "Devolução - Remoto > Presencial", color: "border-l-blue-500" },
    { id: "improdutivo-remoto", label: "Improdutivo - Remoto", color: "border-l-red-500" },
    { id: "improdutivo-outras", label: "Improdutivo – Outras Situações", color: "border-l-red-500" },
  ];

  const filaPresencialCategories = [
    { id: "conclusao-presencial", label: "Conclusão - Presencial", color: "border-l-primary" },
    { id: "conclusao-formatacao", label: "Conclusão - Formatação", color: "border-l-primary" },
    { id: "conclusao-impressora-p", label: "Conclusão - Impressora", color: "border-l-primary" },
    { id: "diagnostico-generico", label: "Diagnóstico - Genérico", color: "border-l-amber-500" },
    { id: "diagnostico-sigesf", label: "Diagnóstico - Sigesf", color: "border-l-amber-500" },
    { id: "improdutivo-presencial", label: "Improdutivo - Presencial", color: "border-l-red-500" },
    { id: "improdutivo-outras-p", label: "Improdutivo – Outras Situações", color: "border-l-red-500" },
    { id: "devolucao-presencial", label: "Devolução - Presencial > ...", color: "border-l-blue-500" },
  ];

  const allFilaCategories = [
    ...filaRemotaCategories.map(c => ({ ...c, fila: "remota" as const })),
    ...filaPresencialCategories.map(c => ({ ...c, fila: "presencial" as const })),
  ];

  const handleMoveProcedure = (procedureId: string, targetCategory: string) => {
    const allCat = allFilaCategories.find(c => c.id === targetCategory);
    const updatedProcedures = procedures.map(proc => {
      if (proc.id !== procedureId) return proc;
      if (!targetCategory) {
        return { ...proc, filaRemotaCategory: undefined, filaPresencialCategory: undefined };
      }
      if (allCat?.fila === "remota") {
        return { ...proc, filaRemotaCategory: targetCategory, filaPresencialCategory: undefined };
      }
      return { ...proc, filaPresencialCategory: targetCategory, filaRemotaCategory: undefined };
    });
    setProcedures(updatedProcedures);
    saveProcedures(updatedProcedures);
    if (targetCategory) {
      toast.success(`Procedimento movido para "${allCat?.label}"`);
    } else {
      toast.success('Procedimento removido da fila');
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar activeView={activeView} onViewChange={setActiveView} />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Compact header */}
          <header className="bg-gradient-primary text-white shadow-elevated">
            <div className="px-3 py-2 md:px-6 md:py-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="text-white hover:bg-white/10" />
                <div>
                  <h1 className="text-base md:text-xl font-bold">Gestão de Procedimentos</h1>
                  <p className="text-white/80 text-[10px] md:text-xs">Sistema de Suporte Técnico</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <div className="text-white/95 font-mono text-xs md:text-sm">
                  {format(currentDateTime, "dd/MM/yyyy, HH:mm:ss")}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/60 text-[10px] font-mono hidden sm:inline">
                    {String(__APP_VERSION__)}
                  </span>
                  {isAppUpToDate ? (
                    <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-[10px] cursor-default">
                      ✓ Atualizado
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-5 px-1.5 text-[10px] text-amber-200 hover:text-white hover:bg-white/10 border border-amber-400/40"
                      onClick={() => {
                        if ('caches' in window) {
                          caches.keys().then(names => {
                            names.forEach(name => caches.delete(name));
                          });
                        }
                        localStorage.removeItem('app_version');
                        window.location.reload();
                      }}
                    >
                      ⟳ Atualizar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-3 py-4 md:px-6 md:py-6 overflow-auto">
            {/* === PAINEL VIEW === */}
            {activeView === "painel" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div><WorkTimer /></div>
                  <div><CompletedWorkOrders /></div>
                  <div><ActivityLog /></div>
                  <div><Changelog /></div>
                </div>
              </div>
            )}

            {/* === PROCEDIMENTOS VIEW === */}
            {activeView === "procedimentos" && (
              <div className="space-y-6">
                <Alert className="border-primary/20 bg-primary/5">
                  <Shield className="h-5 w-5 text-primary" />
                  <AlertDescription className="ml-2">
                    <strong>LGPD:</strong> Dados armazenados localmente. Faça backups regulares.
                  </AlertDescription>
                </Alert>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 max-w-2xl">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por título, descrição, solução, técnico, PIB, usuário..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="default" size="lg" onClick={handleExportBackup} title="Gravar Histórico">
                <Save className="w-5 h-5 sm:mr-2" />
                <span className="hidden sm:inline">Gravar Histórico</span>
              </Button>
              <Button variant="default" size="lg" onClick={() => document.getElementById('import-file')?.click()} title="Importar Backup">
                <Upload className="w-5 h-5 sm:mr-2" />
                <span className="hidden sm:inline">Importar Backup</span>
              </Button>
              <input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button title="Novo Procedimento">
                    <Plus className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Novo Procedimento</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl w-[95vw] max-h-[85vh] overflow-y-auto p-4 sm:p-6">
                <DialogHeader>
                  <DialogTitle>Cadastrar Novo Procedimento</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateProcedure} className="space-y-4 mt-4">
                  {/* Tipo de Nota */}
                  <div className="space-y-2">
                    <Label>Tipo de Nota *</Label>
                    <Select
                      value={newProcedure.noteType}
                      onValueChange={(value: NoteType) => setNewProcedure({ ...newProcedure, noteType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de nota" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="procedimento">Procedimento (Padrão)</SelectItem>
                        <SelectItem value="diagnostico">Diagnóstico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Campo específico para Diagnóstico - Setor */}
                  {newProcedure.noteType === "diagnostico" && (
                    <div className="space-y-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <Label htmlFor="setorDirecionado" className="text-amber-800">Setor a Direcionar *</Label>
                      <Input
                        id="setorDirecionado"
                        required={newProcedure.noteType === "diagnostico"}
                        value={newProcedure.setorDirecionado}
                        onChange={(e) => setNewProcedure({ ...newProcedure, setorDirecionado: e.target.value })}
                        placeholder="Ex: SUPORTE REDE, INFRAESTRUTURA, etc."
                        className="border-amber-300"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      required
                      value={newProcedure.title}
                      onChange={(e) => setNewProcedure({ ...newProcedure, title: e.target.value })}
                      placeholder="Ex: Instalação do OTIMIZADOR DE PDF"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria *</Label>
                    <Select
                      required
                      value={newProcedure.category}
                      onValueChange={(value) => setNewProcedure({ ...newProcedure, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição *</Label>
                    <Textarea
                      id="description"
                      required
                      value={newProcedure.description}
                      onChange={(e) => setNewProcedure({ ...newProcedure, description: e.target.value })}
                      placeholder="Descreva o contexto do problema..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="solution">Solução Aplicada *</Label>
                    <Textarea
                      id="solution"
                      required
                      value={newProcedure.solution}
                      onChange={(e) => setNewProcedure({ ...newProcedure, solution: e.target.value })}
                      placeholder="Descreva os passos realizados e a solução aplicada..."
                      rows={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      value={newProcedure.tags}
                      onChange={(e) => setNewProcedure({ ...newProcedure, tags: e.target.value })}
                      placeholder="Separe por vírgula: PDF, Software, Deploy"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pibEquipamento">PIB Equipamento</Label>
                    <Input
                      id="pibEquipamento"
                      value={newProcedure.pibEquipamento}
                      onChange={(e) => setNewProcedure({ ...newProcedure, pibEquipamento: e.target.value })}
                      placeholder="Digite o PIB do equipamento"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="usuarioAtendido">Usuário Atendido</Label>
                    <Input
                      id="usuarioAtendido"
                      value={newProcedure.usuarioAtendido}
                      onChange={(e) => setNewProcedure({ ...newProcedure, usuarioAtendido: e.target.value })}
                      placeholder="Digite o nome do usuário atendido"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workOrder">WO (Work Order)</Label>
                    <Input
                      id="workOrder"
                      value={newProcedure.workOrder}
                      onChange={(e) => setNewProcedure({ ...newProcedure, workOrder: e.target.value })}
                      placeholder="Digite o número da WO"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="createdBy">Técnico Responsável</Label>
                    <Input
                      id="createdBy"
                      value="SUPORTE TÉCNICO HEPTA"
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  {/* Campos específicos para Diagnóstico */}
                  {newProcedure.noteType === "diagnostico" && (
                    <div className="space-y-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <h4 className="font-semibold text-amber-800">Campos de Diagnóstico</h4>
                      
                      <div className="space-y-2">
                        <Label htmlFor="justificativa" className="text-amber-800">Justificativa *</Label>
                        <Textarea
                          id="justificativa"
                          required={newProcedure.noteType === "diagnostico"}
                          value={newProcedure.justificativa}
                          onChange={(e) => setNewProcedure({ ...newProcedure, justificativa: e.target.value })}
                          placeholder="Após procedimentos foi verificado que..."
                          rows={3}
                          className="border-amber-300"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-amber-800">Possui procedimento no BC-Suporte?</Label>
                        <Select
                          value={newProcedure.possuiProcedimentoBC}
                          onValueChange={(value: "sim" | "nao") => setNewProcedure({ ...newProcedure, possuiProcedimentoBC: value })}
                        >
                          <SelectTrigger className="border-amber-300">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sim">SIM</SelectItem>
                            <SelectItem value="nao">NÃO</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {newProcedure.possuiProcedimentoBC === "sim" && (
                        <div className="space-y-2">
                          <Label htmlFor="nomeArquivoBC" className="text-amber-800">Nome do Arquivo BC</Label>
                          <Input
                            id="nomeArquivoBC"
                            value={newProcedure.nomeArquivoBC}
                            onChange={(e) => setNewProcedure({ ...newProcedure, nomeArquivoBC: e.target.value })}
                            placeholder="Nome do arquivo no BC-Suporte"
                            className="border-amber-300"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 justify-end pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      Cadastrar
                    </Button>
                  </div>
                </form>
              </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Dialog de Importação */}
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogContent className="w-[95vw] max-w-lg p-4 sm:p-6" aria-describedby="import-dialog-description">
              <DialogHeader>
                <DialogTitle>Importar Procedimentos</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <p id="import-dialog-description" className="text-muted-foreground">
                  Você possui um backup dos seus procedimentos? Importe-o aqui para continuar de onde parou.
                </p>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="import-file" className="cursor-pointer">
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                      <Plus className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Clique para selecionar o arquivo de backup</p>
                      <p className="text-xs text-muted-foreground mt-1">Formato: JSON</p>
                    </div>
                  </Label>
                  <Input
                    id="import-file"
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                  <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                    Começar sem importar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Carregando procedimentos...</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredProcedures.map((procedure) => {
                const isOpen = expandedProcedures.has(procedure.id);
                return (
                  <Card key={procedure.id} className="overflow-hidden">
                    {/* Header row - always visible */}
                    <div
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => {
                        const next = new Set(expandedProcedures);
                        if (next.has(procedure.id)) next.delete(procedure.id);
                        else next.add(procedure.id);
                        setExpandedProcedures(next);
                      }}
                    >
                      <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
                      <FileText className="w-4 h-4 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{procedure.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{procedure.description}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs shrink-0">{procedure.category}</Badge>
                    </div>

                    {/* Expanded content */}
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 border-t space-y-3">
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-sm text-foreground whitespace-pre-wrap">{procedure.solution}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(procedure.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="flex items-center gap-1">
                            <span>•</span>
                            {procedure.createdBy}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Tag className="w-4 h-4" />
                            {procedure.tags.map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              const updatedProcedure = { ...procedure, createdAt: new Date().toISOString() };
                              const updatedProcedures = procedures.map(proc =>
                                proc.id === procedure.id ? updatedProcedure : proc
                              );
                              setProcedures(updatedProcedures);
                              saveProcedures(updatedProcedures);
                              setSelectedProcedure(updatedProcedure);
                            }}
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            Abrir
                          </Button>
                          <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                            <Select
                              value={procedure.filaRemotaCategory || procedure.filaPresencialCategory || "none"}
                              onValueChange={(value) => handleMoveProcedure(procedure.id, value === "none" ? "" : value)}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Mover para..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Sem fila</SelectItem>
                                <SelectItem disabled value="__header_remota__" className="font-bold text-xs text-muted-foreground">── Fila Remota ──</SelectItem>
                                {filaRemotaCategories.map((cat) => (
                                  <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                                ))}
                                <SelectItem disabled value="__header_presencial__" className="font-bold text-xs text-muted-foreground">── Fila Presencial ──</SelectItem>
                                {filaPresencialCategories.map((cat) => (
                                  <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {!isLoading && filteredProcedures.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum procedimento encontrado</p>
            </div>
          )}
         </div>
          </TabsContent>

          <TabsContent value="fila-remota">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Monitor className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-bold">Fila Remota</h2>
                </div>
                <p className="text-muted-foreground">
                  Procedimentos e orientações para atendimento remoto.
                </p>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filaRemotaCategories.map((cat) => {
                    const assignedProcedures = procedures.filter(p => p.filaRemotaCategory === cat.id);
                    return (
                      <Card key={cat.id} className={`p-4 border-l-4 ${cat.color}`}>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{cat.label}</h3>
                          <Badge variant="secondary" className="text-xs">{assignedProcedures.length}</Badge>
                        </div>
                        {assignedProcedures.length > 0 ? (
                          <div className="mt-2">
                            <div
                              className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-muted/50 transition-colors rounded text-sm"
                              onClick={() => {
                                const qKey = `remota-${cat.id}-list`;
                                const next = new Set(expandedQueueProcs);
                                if (next.has(qKey)) next.delete(qKey); else next.add(qKey);
                                setExpandedQueueProcs(next);
                              }}
                            >
                              <ChevronDown className={`w-3 h-3 text-muted-foreground shrink-0 transition-transform ${expandedQueueProcs.has(`remota-${cat.id}-list`) ? 'rotate-0' : '-rotate-90'}`} />
                              <span className="text-xs font-medium text-foreground">Procedimentos</span>
                            </div>
                            {expandedQueueProcs.has(`remota-${cat.id}-list`) && (
                              <div className="space-y-1 mt-1 pl-5">
                                {assignedProcedures.map((proc) => (
                                  <div
                                    key={proc.id}
                                    className="px-2 py-1 rounded text-xs cursor-pointer hover:bg-muted/50 transition-colors border border-border/30"
                                    onClick={() => {
                                      const updatedProcedure = { ...proc, createdAt: new Date().toISOString() };
                                      const updatedProcedures = procedures.map(p => p.id === proc.id ? updatedProcedure : p);
                                      setProcedures(updatedProcedures);
                                      saveProcedures(updatedProcedures);
                                      setSelectedProcedure(updatedProcedure);
                                    }}
                                  >
                                    <p className="font-medium text-foreground">{proc.title}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-1">Nenhum procedimento atribuído</p>
                        )}
                        {cat.id === "conclusao-remoto" && (
                          <div className="mt-3 space-y-2">
                            <Input
                              placeholder="Nome do usuário"
                              value={conclusaoNome}
                              onChange={(e) => setConclusaoNome(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Input
                              placeholder="PIB do equipamento"
                              value={conclusaoPib}
                              onChange={(e) => setConclusaoPib(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Input
                              placeholder="PIB Micro"
                              value={conclusaoPibMicro}
                              onChange={(e) => setConclusaoPibMicro(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="w-full border-primary/50 text-primary hover:bg-primary/10">
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  Orientações
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80 p-4" align="center">
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-primary flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Orientações
                                  </h4>
                                  <ul className="text-sm space-y-1.5 text-muted-foreground list-disc list-inside">
                                    <li>Detalhe todos os procedimentos e testes realizados</li>
                                    <li>Informe os documentos do BC Suporte utilizados como referência</li>
                                    <li>Anexe quaisquer print/foto em nota normal, <strong>ANTES</strong> de salvar a conclusão, pois na nota de conclusão só é possível utilizar texto</li>
                                    <li>Em <strong>"Motivo do Status"</strong>, use apenas <strong>"Utilização de procedimentos"</strong></li>
                                    <li>Ao capturar o chamado, ajuste a categorização em <strong>"Categorização"</strong> &gt;&gt; <strong>"Categorização Operacional"</strong></li>
                                    <li>Em caso de dúvidas acione a <strong>Supervisão</strong> ou <strong>Ticket Manager</strong></li>
                                  </ul>
                                  <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-800 text-center text-sm">
                                    <p className="font-bold">!! Atenção !!</p>
                                    <p>Notificar usuário com a solução realizada: <strong>SIM</strong></p>
                                    <p>Modo de execução: <strong>Remoto</strong></p>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                            <Button
                              size="sm"
                              className="w-full bg-primary hover:bg-primary/90"
                              onClick={() => {
                                const nome = conclusaoNome || '_________________';
                                const pib = conclusaoPib || '';
                                const pibMicro = conclusaoPibMicro || '';
                                const nota = `EM CONTATO COM O USUÁRIO ${nome}, FOI REALIZADO ACESSO REMOTO AO MICRO E
FORAM EXECUTADOS OS PROCEDIMENTOS DE:

==================

PIB: ${pib}

PIB Micro: ${pibMicro}

==================

- PROCEDIMENTO 1
- PROCEDIMENTO 2
- PROCEDIMENTO 3

APÓS PROCEDIMENTOS FORAM REALIZADOS TESTES DE:

- TESTE 1
- TESTE 2
- TESTE 3

QUE CONFIRMARAM A SOLUÇÃO DO PROBLEMA.

ATENCIOSAMENTE,
SUPORTE TÉCNICO HEPTA`;
                                navigator.clipboard.writeText(nota);
                                toast.success('Nota de Conclusão - Remoto copiada!');
                              }}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copiar Nota
                            </Button>
                          </div>
                        )}
                        {cat.id === "conclusao-impressora" && (
                          <div className="mt-3 space-y-2">
                            <Input
                              placeholder="Nome do usuário"
                              value={impressoraNome}
                              onChange={(e) => setImpressoraNome(e.target.value)}
                              className="text-sm h-8"
                            />
                            {impressoraPibImps.map((pibVal, idx) => (
                              <div key={idx} className="flex gap-1 items-center">
                                <Input
                                  placeholder={`PIB Impressora ${impressoraPibImps.length > 1 ? idx + 1 : ''}`}
                                  value={pibVal}
                                  onChange={(e) => {
                                    const updated = [...impressoraPibImps];
                                    updated[idx] = e.target.value;
                                    setImpressoraPibImps(updated);
                                  }}
                                  className="text-sm h-8"
                                />
                                {idx === impressoraPibImps.length - 1 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 shrink-0"
                                    onClick={() => setImpressoraPibImps([...impressoraPibImps, ""])}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                )}
                                {impressoraPibImps.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 shrink-0 text-destructive hover:text-destructive"
                                    onClick={() => setImpressoraPibImps(impressoraPibImps.filter((_, i) => i !== idx))}
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            {impressoraIpImps.map((ipVal, idx) => (
                              <div key={idx} className="flex gap-1 items-center">
                                <Input
                                  placeholder={`IP Impressora ${impressoraIpImps.length > 1 ? idx + 1 : ''}`}
                                  value={ipVal}
                                  onChange={(e) => {
                                    const updated = [...impressoraIpImps];
                                    updated[idx] = e.target.value;
                                    setImpressoraIpImps(updated);
                                  }}
                                  className="text-sm h-8"
                                />
                                {idx === impressoraIpImps.length - 1 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 shrink-0"
                                    onClick={() => setImpressoraIpImps([...impressoraIpImps, ""])}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                )}
                                {impressoraIpImps.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 shrink-0 text-destructive hover:text-destructive"
                                    onClick={() => setImpressoraIpImps(impressoraIpImps.filter((_, i) => i !== idx))}
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            {impressoraPibMicros.map((pibVal, idx) => (
                              <div key={idx} className="flex gap-1 items-center">
                                <Input
                                  placeholder={`PIB Micro ${impressoraPibMicros.length > 1 ? idx + 1 : ''}`}
                                  value={pibVal}
                                  onChange={(e) => {
                                    const updated = [...impressoraPibMicros];
                                    updated[idx] = e.target.value;
                                    setImpressoraPibMicros(updated);
                                  }}
                                  className="text-sm h-8"
                                />
                                {idx === impressoraPibMicros.length - 1 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 shrink-0"
                                    onClick={() => setImpressoraPibMicros([...impressoraPibMicros, ""])}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                )}
                                {impressoraPibMicros.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 shrink-0 text-destructive hover:text-destructive"
                                    onClick={() => setImpressoraPibMicros(impressoraPibMicros.filter((_, i) => i !== idx))}
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="w-full border-primary/50 text-primary hover:bg-primary/10">
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  Orientações
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80 p-4" align="center">
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-primary flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Orientações
                                  </h4>
                                  <ul className="text-sm space-y-1.5 text-muted-foreground list-disc list-inside">
                                    <li>Para o atendimento <strong>REMOTO</strong>, um único chamado abrange a instalação do equipamento NOVO e a configuração de todos os micros <strong>NO SETOR</strong></li>
                                    <li>Abrir tarefa no OTRS para cada micro configurado</li>
                                    <li>Detalhe todos os procedimentos e testes realizados</li>
                                    <li>Anexe quaisquer print/foto em nota normal, <strong>ANTES</strong> de salvar a conclusão, pois na nota de conclusão só é possível utilizar texto</li>
                                    <li>Em <strong>"Motivo do Status"</strong>, use apenas <strong>"Utilização de procedimentos"</strong></li>
                                    <li>Registre todas as PIB dos micros configurados <strong>NO SETOR</strong></li>
                                    <li>É <strong>OBRIGATÓRIO A REALIZAÇÃO DO TESTE DE IMPRESSÃO</strong></li>
                                    <li>Ao capturar o chamado, ajuste a categorização em <strong>"Categorização"</strong> &gt;&gt; <strong>"Categorização Operacional"</strong></li>
                                    <li>Em caso de dúvidas acione a <strong>Supervisão</strong> ou <strong>Ticket Manager</strong></li>
                                  </ul>
                                  <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-800 text-center text-sm">
                                    <p className="font-bold">!! Atenção !!</p>
                                    <p>Notificar usuário com a solução realizada: <strong>SIM</strong></p>
                                    <p>Modo de execução: <strong>Remoto</strong></p>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                            <Button
                              size="sm"
                              className="w-full bg-primary hover:bg-primary/90"
                              onClick={() => {
                                const nome = impressoraNome || '________';
                                const pibImps = impressoraPibImps.filter(p => p.trim());
                                const pibImpText = pibImps.length > 0 ? pibImps.join(', ') : '';
                                const ipImps = impressoraIpImps.filter(p => p.trim());
                                const ipImpText = ipImps.length > 0 ? ipImps.join(', ') : '';
                                const pibMicros = impressoraPibMicros.filter(p => p.trim());
                                const pibMicroText = pibMicros.length > 0 ? pibMicros.join(', ') : '';
                                const nota = `EM CONTATO COM O USUÁRIO, ${nome} FOI VERIFICADO QUE:

=========================

A IMPRESSORA JÁ ESTÁ CONFIGURADA EM REDE? SIM ( x )    NÃO ( x )

PIB Impressora: ${pibImpText}

IP Impressora: ${ipImpText}

PIB Micro: ${pibMicroText}

========================

FOI REALIZADO OS PROCEDIMENTOS DE:

- PROCEDIMENTO_1
- PROCEDIMENTO_2
- PROCEDIMENTO_3

APÓS PROCEDIMENTOS, EM CONTATO COM O USUARIO ${nome} FORAM REALIZADOS TESTES DE CONEXÃO E IMPRESSÃO, QUE CONFIRMARAM A SOLUÇÃO DO PROBLEMA.

ATENCIOSAMENTE,
SUPORTE TÉCNICO HEPTA`;
                                navigator.clipboard.writeText(nota);
                                toast.success('Nota de Conclusão - Impressora copiada!');
                              }}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copiar Nota
                            </Button>
                          </div>
                        )}
                        {cat.id === "conclusao-compartilhamento" && (
                          <div className="mt-3 space-y-2">
                            <Input
                              placeholder="Nome do usuário"
                              value={compartNome}
                              onChange={(e) => setCompartNome(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Input
                              placeholder="PIB do equipamento"
                              value={compartPib}
                              onChange={(e) => setCompartPib(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Input
                              placeholder="PIB Micro"
                              value={compartPibMicro}
                              onChange={(e) => setCompartPibMicro(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Input
                              placeholder="Compartilhamento Link"
                              value={compartLink}
                              onChange={(e) => setCompartLink(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Input
                              placeholder="Atalho salvo no caminho"
                              value={compartAtalho}
                              onChange={(e) => setCompartAtalho(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="w-full border-primary/50 text-primary hover:bg-primary/10">
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  Orientações
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80 p-4" align="center">
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-primary flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Orientações
                                  </h4>
                                  <ul className="text-sm space-y-1.5 text-muted-foreground list-disc list-inside">
                                    <li>Detalhe todos os procedimentos e testes realizados</li>
                                    <li>Inclua um print em nota normal, com o atalho criado no perfil do usuário (no print deve aparecer toda a janela do VNC, de forma que apareça o caminho, hostname e IP do micro atendido)</li>
                                    <li>Informe os documentos do BC Suporte utilizados como referência</li>
                                    <li>Anexe quaisquer print/foto em nota normal, <strong>ANTES</strong> de salvar a conclusão, pois na nota de conclusão só é possível utilizar texto</li>
                                    <li>Em <strong>"Motivo do Status"</strong>, use apenas <strong>"Utilização de procedimentos"</strong></li>
                                    <li>Ao capturar o chamado, ajuste a categorização em <strong>"Categorização"</strong> &gt;&gt; <strong>"Categorização Operacional"</strong></li>
                                    <li>Em caso de dúvidas acione a <strong>Supervisão</strong> ou <strong>Ticket Manager</strong></li>
                                  </ul>
                                  <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-800 text-center text-sm">
                                    <p className="font-bold">!! Atenção !!</p>
                                    <p>Notificar usuário com a solução realizada: <strong>SIM</strong></p>
                                    <p>Modo de execução: <strong>Remoto</strong></p>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                            <Button
                              size="sm"
                              className="w-full bg-primary hover:bg-primary/90"
                              onClick={() => {
                                const nome = compartNome || '_________________';
                                const pib = compartPib || '';
                                const pibMicro = compartPibMicro || '';
                                const link = compartLink || '';
                                const atalho = compartAtalho || '';
                                const nota = `EM CONTATO COM O USUÁRIO ${nome}, FOI REALIZADO ACESSO REMOTO AO MICRO E
FORAM EXECUTADOS OS PROCEDIMENTOS DE:

==================

PIB: ${pib}

PIB Micro: ${pibMicro}

COMPARTILHAMENTO LINK: ${link}

ATALHO SALVO NO CAMINHO: ${atalho}

==================

- PROCEDIMENTO 1
- PROCEDIMENTO 2
- PROCEDIMENTO 3

ATENCIOSAMENTE,
SUPORTE TÉCNICO HEPTA`;
                                navigator.clipboard.writeText(nota);
                                toast.success('Nota de Conclusão - Compartilhamento copiada!');
                              }}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copiar Nota
                            </Button>
                          </div>
                        )}
                        {cat.id === "diagnostico-remoto" && (
                          <div className="mt-3 space-y-2">
                            <Input
                              placeholder="Setor direcionado"
                              value={diagRemotoSetor}
                              onChange={(e) => setDiagRemotoSetor(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Input
                              placeholder="Nome do usuário"
                              value={diagRemotoNome}
                              onChange={(e) => setDiagRemotoNome(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Input
                              placeholder="PIB do equipamento"
                              value={diagRemotoPib}
                              onChange={(e) => setDiagRemotoPib(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Input
                              placeholder="PIB Micro"
                              value={diagRemotoPibMicro}
                              onChange={(e) => setDiagRemotoPibMicro(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50">
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  Orientações
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80 p-4" align="center">
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-amber-700 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Orientações
                                  </h4>
                                  <ul className="text-sm space-y-1.5 text-muted-foreground list-disc list-inside">
                                    <li>Detalhe todos os procedimentos e testes realizados e anexe os prints comprobatórios</li>
                                    <li>Informe os documentos do BC Suporte utilizados como referência</li>
                                    <li><strong>Mais detalhes &gt;&gt; Bloqueado:</strong> (Sim)</li>
                                    <li>Ao capturar o chamado, ajuste a categorização do chamado em <strong>"Categorização"</strong> &gt;&gt; <strong>"Categorização Operacional"</strong></li>
                                    <li>Em caso de dúvidas acione a <strong>Supervisão</strong> ou <strong>Ticket Manager</strong></li>
                                  </ul>
                                  <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-800 text-center text-sm">
                                    <p className="font-bold">!! Atenção !!</p>
                                    <p>Em "Tipo de informação de trabalho",</p>
                                    <p className="font-bold">marque "DIAGNÓSTICO"</p>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                            <Button
                              size="sm"
                              className="w-full bg-amber-600 hover:bg-amber-700"
                              onClick={() => {
                                const setor = diagRemotoSetor || '__________';
                                const nome = diagRemotoNome || '_________________';
                                const pib = diagRemotoPib || '';
                                const pibMicro = diagRemotoPibMicro || '';
                                const nota = `FAVOR DIRECIONAR AO SETOR ${setor}

==================

PIB indicada pelo usuário: ${pib}

PIB Micro: ${pibMicro}

==================

EM CONTATO COM O USUÁRIO ${nome}, FORAM REALIZADOS OS PROCEDIMENTOS DE:

- PROCEDIMENTO 1
- PROCEDIMENTO 2
- PROCEDIMENTO 3

APÓS PROCEDIMENTOS FOI VERIFICADO QUE:

< JUSTIFICATIVA >

Possui procedimento no BC-Suporte? ( X ) SIM ( X ) Não
Se sim, Nome do arquivo:_____________________

ATENCIOSAMENTE,
SUPORTE TÉCNICO HEPTA`;
                                navigator.clipboard.writeText(nota);
                                toast.success('Nota de Diagnóstico Remoto copiada!');
                              }}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copiar Nota
                            </Button>
                          </div>
                        )}
                        {cat.id === "devolucao-remoto-presencial" && (
                          <div className="mt-3 space-y-2">
                            <Input
                              placeholder="Nome do usuário"
                              value={devolucaoNome}
                              onChange={(e) => setDevolucaoNome(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Input
                              placeholder="PIB do equipamento"
                              value={devolucaoPib}
                              onChange={(e) => setDevolucaoPib(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Input
                              placeholder="PIB Micro"
                              value={devolucaoPibMicro}
                              onChange={(e) => setDevolucaoPibMicro(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Input
                              placeholder="Nº da WO"
                              value={devolucaoWo}
                              onChange={(e) => setDevolucaoWo(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50">
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  Orientações
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80 p-4" align="center">
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-blue-700 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Orientações
                                  </h4>
                                  <ul className="text-sm space-y-1.5 text-muted-foreground list-disc list-inside">
                                    <li>Detalhe todos os procedimentos e testes realizados e anexe os prints comprobatórios</li>
                                    <li>Informe os documentos do BC Suporte utilizados como referência</li>
                                    <li><strong>Mais detalhes &gt;&gt; Bloqueado:</strong> (Sim)</li>
                                    <li>Ao capturar o chamado, ajuste a categorização do chamado em <strong>"Categorização"</strong> &gt;&gt; <strong>"Categorização Operacional"</strong></li>
                                    <li>Em caso de dúvidas acione a <strong>Supervisão</strong> ou <strong>Ticket Manager</strong></li>
                                  </ul>
                                  <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-800 text-center text-sm">
                                    <p className="font-bold">!! Atenção !!</p>
                                    <p>Em "Tipo de informação de trabalho",</p>
                                    <p className="font-bold">marque "Informações Gerais"</p>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                            <Button
                              size="sm"
                              className="w-full bg-blue-600 hover:bg-blue-700"
                              onClick={() => {
                                const nome = devolucaoNome || '_________________';
                                const pib = devolucaoPib || '';
                                const pibMicro = devolucaoPibMicro || '';
                                const wo = devolucaoWo ? `WO: ${devolucaoWo}\n\n` : '';
                                const nota = `${wo}FAVOR DIRECIONAR AO SUPORTE PRESENCIAL

EM CONTATO COM O USUÁRIO ${nome}, FOI REALIZADO ACESSO REMOTO AO MICRO E
FORAM EXECUTADOS OS PROCEDIMENTOS DE:

==================

PIB: ${pib}

PIB Micro: ${pibMicro}

==================

- PROCEDIMENTO 1
- PROCEDIMENTO 2
- PROCEDIMENTO 3

APÓS PROCEDIMENTOS FOI IDENTIFICADO A NECESSIDADE DE ATENDIMENTO IN LOCO, SENDO ASSIM, FAVOR DIRECIONAR A FILA PRESENCIAL

ATENCIOSAMENTE,
SUPORTE TÉCNICO HEPTA`;
                                navigator.clipboard.writeText(nota);
                                toast.success('Nota de Devolução Remoto copiada!');
                              }}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copiar Nota
                            </Button>
                          </div>
                        )}
                        {cat.id === "improdutivo-remoto" && (
                          <div className="mt-3 space-y-3">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="w-full border-red-300 text-red-700 hover:bg-red-50">
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  Orientações
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-96 p-4" align="start">
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-red-700 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Orientações
                                  </h4>
                                  <ul className="text-sm space-y-1.5 text-muted-foreground list-disc list-inside">
                                    <li>Realize a tentativa de contato e tentativa de atendimento remoto previamente</li>
                                    <li>O envio do e-mail da tentativa de contato é <strong>obrigatório</strong></li>
                                    <li>Utilizar o modelo de e-mail específico do PO – Improdutivo Remoto</li>
                                    <li>Ao chegar na unidade/setor caso seja impedido de iniciar o atendimento prossiga com o fechamento de imediato</li>
                                    <li>Caso não possa realizar o envio do e-mail de fechamento e/ou a conclusão do chamado, solicite a um colega no Teams para fazer por você ou acione a Supervisão ou Ticket Manager</li>
                                    <li><strong>Atenção !</strong> A conclusão sem o envio prévio dos e-mails gera bloqueio</li>
                                    <li>Anexe quaisquer print/foto em nota normal, <strong>ANTES</strong> de salvar a conclusão, pois na nota de conclusão só é possível utilizar texto</li>
                                    <li>Em "Motivo do Status", use apenas <strong>"Utilização de procedimentos"</strong></li>
                                    <li>Em caso de dúvidas acione a Supervisão ou Ticket Manager</li>
                                  </ul>
                                  <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-800 text-center text-sm">
                                    <p className="font-bold">!! Atenção !!</p>
                                    <p>Notificar usuário com a solução realizada: <strong>SIM</strong></p>
                                    <p>Modo de execução: <strong>Remoto</strong></p>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                            <Button
                              size="sm"
                              className="w-full bg-red-600 hover:bg-red-700"
                              onClick={() => {
                                const nota = `IMPRODUTIVO

Este chamado necessita de realização de contato direto com o usuário para autorização de procedimentos.

Foram realizadas 3 tentativas de contato sem sucesso no intervalo de 40 minutos a 1 hora entre elas.

Este chamado será fechado como improdutivo, e sua reabertura será considerada indevida.

Caso ainda necessite do suporte técnico, solicitamos que registre um novo chamado.`;
                                navigator.clipboard.writeText(nota);
                                toast.success('Nota de Improdutivo copiada!');
                              }}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copiar Nota
                            </Button>
                          </div>
                        )}
                        {cat.id === "improdutivo-outras" && (
                          <div className="mt-3 space-y-3">
                            <Input
                              placeholder="Nome do usuário"
                              value={improdOutrasNome}
                              onChange={(e) => setImprodOutrasNome(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Input
                              placeholder="Justificativa"
                              value={improdOutrasJustificativa}
                              onChange={(e) => setImprodOutrasJustificativa(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="w-full border-red-300 text-red-700 hover:bg-red-50">
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  Orientações
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-96 p-4" align="start">
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-red-700 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Orientações
                                  </h4>
                                  <ul className="text-sm space-y-1.5 text-muted-foreground list-disc list-inside">
                                    <li>(Remoto ou Presencial) Na Justificativa informe o motivo pelo qual o atendimento não pode ser realizado
                                      <ul className="list-disc list-inside ml-4 mt-1">
                                        <li>Detalhar o melhor possível a justificativa</li>
                                      </ul>
                                    </li>
                                    <li>Utilize apenas nos seguintes casos:
                                      <ul className="list-disc list-inside ml-4 mt-1">
                                        <li>(Remoto ou Presencial) Recusa do atendimento pelo usuário</li>
                                        <li>(Presencial) Acesso ao ambiente/equipamento indisponível</li>
                                        <li>(Presencial) ausência ou indisponibilidade</li>
                                        <li>(Remoto ou Presencial) Retorno em outro dia</li>
                                        <li>(Remoto ou Presencial) Indisponibilidade da unidade</li>
                                      </ul>
                                    </li>
                                    <li><strong>Exemplo:</strong> Unidade Fechada ou horário incompatível; informação na planilha ou Nenhum colaborador disponível para acompanhar o atendimento</li>
                                    <li><strong>[Fila Remota]</strong> Em caso de falta de rede ou energia na unidade, siga o PO Improdutivo com as 3 tentativas de contato</li>
                                    <li>Caso não possa fechar o chamado no momento, solicite no Teams que alguém faça o fechamento e abrir tarefa no OTRS depois</li>
                                    <li>Nesta situação não é necessário enviar os e-mails</li>
                                    <li>Em caso de dúvidas acione a <strong>Supervisão</strong> ou <strong>Ticket Manager</strong></li>
                                  </ul>
                                  <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-800 text-center text-sm">
                                    <p className="font-bold">!! Atenção !!</p>
                                    <p>Notificar usuário com a solução realizada: <strong>SIM</strong></p>
                                    <p>Modo de execução: <strong>Remoto</strong></p>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                            <Button
                              size="sm"
                              className="w-full bg-red-600 hover:bg-red-700"
                              onClick={() => {
                                const nome = improdOutrasNome || '___________';
                                const justificativa = improdOutrasJustificativa || '<< JUSTIFICATIVA >>';
                                const nota = `IMPRODUTIVO

Conforme verificado com Usuário ${nome}, Não foi possível realizar o atendimento devido:

${justificativa}

Foi indicado outro colaborador para acompanhar o atendimento? SIM ( x )  NÃO ( x ) (Não se aplica)

Desta forma, este chamado será fechado como improdutivo, e sua reabertura será considerada indevida.

Caso ainda necessite do suporte técnico, solicitamos que registre um novo chamado.`;
                                navigator.clipboard.writeText(nota);
                                toast.success('Nota de Improdutivo - Outras Situações copiada!');
                              }}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copiar Nota
                            </Button>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="fila-presencial">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-bold">Fila Presencial</h2>
                </div>
                <p className="text-muted-foreground">
                  Procedimentos e orientações para atendimento presencial.
                </p>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filaPresencialCategories.map((cat) => {
                    const assignedProcedures = procedures.filter(p => p.filaPresencialCategory === cat.id);
                    return (
                      <Card key={cat.id} className={`p-4 border-l-4 ${cat.color}`}>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{cat.label}</h3>
                          <Badge variant="secondary" className="text-xs">{assignedProcedures.length}</Badge>
                        </div>
                        {assignedProcedures.length > 0 ? (
                          <div className="mt-2">
                            <div
                              className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-muted/50 transition-colors rounded text-sm"
                              onClick={() => {
                                const qKey = `presencial-${cat.id}-list`;
                                const next = new Set(expandedQueueProcs);
                                if (next.has(qKey)) next.delete(qKey); else next.add(qKey);
                                setExpandedQueueProcs(next);
                              }}
                            >
                              <ChevronDown className={`w-3 h-3 text-muted-foreground shrink-0 transition-transform ${expandedQueueProcs.has(`presencial-${cat.id}-list`) ? 'rotate-0' : '-rotate-90'}`} />
                              <span className="text-xs font-medium text-foreground">Procedimentos</span>
                            </div>
                            {expandedQueueProcs.has(`presencial-${cat.id}-list`) && (
                              <div className="space-y-1 mt-1 pl-5">
                                {assignedProcedures.map((proc) => (
                                  <div
                                    key={proc.id}
                                    className="px-2 py-1 rounded text-xs cursor-pointer hover:bg-muted/50 transition-colors border border-border/30"
                                    onClick={() => {
                                      const updatedProcedure = { ...proc, createdAt: new Date().toISOString() };
                                      const updatedProcedures = procedures.map(p => p.id === proc.id ? updatedProcedure : p);
                                      setProcedures(updatedProcedures);
                                      saveProcedures(updatedProcedures);
                                      setSelectedProcedure(updatedProcedure);
                                    }}
                                  >
                                    <p className="font-medium text-foreground">{proc.title}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-1">Nenhum procedimento atribuído</p>
                        )}
                        {cat.id === "conclusao-presencial" && (
                          <div className="mt-3 space-y-2">
                            <Input
                              placeholder="Data da visita (ex: 27/02/2026)"
                              value={presencialData}
                              onChange={(e) => setPresencialData(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Input
                              placeholder="Nome do usuário"
                              value={presencialNome}
                              onChange={(e) => setPresencialNome(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Input
                              placeholder="PIB do equipamento"
                              value={presencialPib}
                              onChange={(e) => setPresencialPib(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Input
                              placeholder="IP do equipamento"
                              value={presencialIp}
                              onChange={(e) => setPresencialIp(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Input
                              placeholder="PIB Micro"
                              value={presencialPibMicro}
                              onChange={(e) => setPresencialPibMicro(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="w-full border-primary/50 text-primary hover:bg-primary/10">
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  Orientações
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80 p-4" align="center">
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-primary flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Orientações
                                  </h4>
                                  <ul className="text-sm space-y-1.5 text-muted-foreground list-disc list-inside">
                                    <li>Detalhe todos os procedimentos e testes realizados</li>
                                    <li>Informe os documentos do BC Suporte utilizados como referência</li>
                                    <li>Anexe quaisquer print/foto em nota normal, <strong>ANTES</strong> de salvar a conclusão, pois na nota de conclusão só é possível utilizar texto</li>
                                    <li>Em <strong>"Motivo do Status"</strong>, use apenas <strong>"Utilização de procedimentos"</strong></li>
                                    <li>Ao capturar o chamado, ajuste a categorização em <strong>"Categorização"</strong> &gt;&gt; <strong>"Categorização Operacional"</strong></li>
                                    <li>Caso seja resolvido remotamente verifique o SLA do chamado</li>
                                    <li>Devolva apenas se a solicitação tiver menos de 10h de SLA e se já estiver resolvida e validada com o cliente</li>
                                    <li>Em caso de dúvidas acione a <strong>Supervisão</strong> ou <strong>Ticket Manager</strong></li>
                                  </ul>
                                  <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-800 text-center text-sm">
                                    <p className="font-bold">!! Atenção !!</p>
                                    <p>Notificar usuário com a solução realizada: <strong>SIM</strong></p>
                                    <p>Modo de execução: <strong>presencial</strong></p>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                            <Button
                              size="sm"
                              className="w-full bg-primary hover:bg-primary/90"
                              onClick={() => {
                                const data = presencialData || '__/__/202X';
                                const nome = presencialNome || '________';
                                const pib = presencialPib || '';
                                const ip = presencialIp || '';
                                const pibMicro = presencialPibMicro || '';
                                const nota = `PROCEDIMENTOS REALIZADOS DURANTE VISITA TÉCNICA NO DIA ${data}

USUÁRIO: ${nome}

===================

PIB: ${pib}

PIB Micro: ${pibMicro}

IP: ${ip}

===================

FORAM REALIZADOS OS PROCEDIMENTOS DE:

- PROCEDIMENTO_1
- PROCEDIMENTO_2
- PROCEDIMENTO_3

APÓS PROCEDIMENTOS FORAM REALIZADOS TESTES, QUE CONFIRMARAM A SOLUÇÃO DO PROBLEMA

ATENCIOSAMENTE,
SUPORTE TÉCNICO HEPTA`;
                                navigator.clipboard.writeText(nota);
                                toast.success('Nota de Conclusão - Presencial copiada!');
                              }}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copiar Nota
                            </Button>
                          </div>
                        )}
                        {cat.id === "conclusao-formatacao" && (
                          <div className="mt-3 space-y-2">
                            <Input
                              placeholder="Data da visita (ex: 27/02/2026)"
                              value={formatData}
                              onChange={(e) => setFormatData(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Input
                              placeholder="Nome do usuário"
                              value={formatNome}
                              onChange={(e) => setFormatNome(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Input
                              placeholder="PIB do equipamento"
                              value={formatPib}
                              onChange={(e) => setFormatPib(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Input
                              placeholder="IP do equipamento"
                              value={formatIp}
                              onChange={(e) => setFormatIp(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Input
                              placeholder="PIB Micro"
                              value={formatPibMicro}
                              onChange={(e) => setFormatPibMicro(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="w-full border-primary/50 text-primary hover:bg-primary/10">
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  Orientações
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80 p-4" align="center">
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-primary flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Orientações
                                  </h4>
                                  <ul className="text-sm space-y-1.5 text-muted-foreground list-disc list-inside">
                                    <li>Chamados de Formatação <strong>abrangem a configuração de periféricos</strong> e instalação de softwares essenciais</li>
                                    <li><strong>Atenção!</strong> Softwares proprietário devem ser tratados em um chamado separado pois a SLTI deve validar se o acesso aos mesmos ainda é autorizado</li>
                                    <li>Detalhe todos os procedimentos e testes realizados</li>
                                    <li>Informe os documentos do BC Suporte utilizados como referência</li>
                                    <li>Anexe quaisquer print/foto em nota normal, <strong>ANTES</strong> de salvar a conclusão, pois na nota de conclusão só é possível utilizar texto</li>
                                    <li>Ao capturar o chamado, ajuste a categorização em <strong>"Categorização"</strong> &gt;&gt; <strong>"Categorização Operacional"</strong></li>
                                    <li>Em <strong>"Motivo do Status"</strong>, use apenas <strong>"Utilização de procedimentos"</strong></li>
                                    <li>Em caso de dúvidas acione a <strong>Supervisão</strong> ou <strong>Ticket Manager</strong></li>
                                  </ul>
                                  <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-800 text-center text-sm">
                                    <p className="font-bold">!! Atenção !!</p>
                                    <p>Notificar usuário com a solução realizada: <strong>SIM</strong></p>
                                    <p>Modo de execução: <strong>presencial</strong></p>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                            <Button
                              size="sm"
                              className="w-full bg-primary hover:bg-primary/90"
                              onClick={() => {
                                const data = formatData || '__/__/202X';
                                const nome = formatNome || '________';
                                const pib = formatPib || '';
                                const ip = formatIp || '';
                                const pibMicro = formatPibMicro || '';
                                const nota = `PROCEDIMENTOS REALIZADOS DURANTE VISITA TÉCNICA NO DIA ${data}

USUÁRIO: ${nome}

===================

PIB: ${pib}

PIB Micro: ${pibMicro}

IP: ${ip}

===================

Demais periféricos configurados

===================

PIB PINPAD: (Não se aplica)

PIB IMPRESSORA CUPOM: (Não se aplica)

PIB/IP IMPRESSORA REDE: (Não se aplica)

PIB IMPRESSORA ETIQUETA: (Não se aplica)

==================

FORAM REALIZADOS OS PROCEDIMENTOS DE:

- PROCEDIMENTO_1
- PROCEDIMENTO_2
- PROCEDIMENTO_3

APÓS PROCEDIMENTOS FORAM REALIZADOS TESTES, QUE CONFIRMARAM A SOLUÇÃO DO PROBLEMA

ATENCIOSAMENTE,
SUPORTE TÉCNICO HEPTA`;
                                navigator.clipboard.writeText(nota);
                                toast.success('Nota de Conclusão - Formatação copiada!');
                              }}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copiar Nota
                            </Button>
                          </div>
                        )}
                        {cat.id === "conclusao-impressora-p" && (
                          <div className="mt-3 space-y-2">
                            <Input
                              placeholder="Data da visita (ex: 27/02/2026)"
                              value={impPresData}
                              onChange={(e) => setImpPresData(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Input
                              placeholder="Nome do usuário"
                              value={impPresNome}
                              onChange={(e) => setImpPresNome(e.target.value)}
                              className="text-sm h-8"
                            />
                            {impPresPibImps.map((pibVal, idx) => (
                              <div key={idx} className="flex gap-1 items-center">
                                <Input
                                  placeholder={`PIB Impressora ${impPresPibImps.length > 1 ? idx + 1 : ''}`}
                                  value={pibVal}
                                  onChange={(e) => { const u = [...impPresPibImps]; u[idx] = e.target.value; setImpPresPibImps(u); }}
                                  className="text-sm h-8"
                                />
                                {idx === impPresPibImps.length - 1 && (
                                  <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => setImpPresPibImps([...impPresPibImps, ""])}><Plus className="w-4 h-4" /></Button>
                                )}
                                {impPresPibImps.length > 1 && (
                                  <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0 text-destructive hover:text-destructive" onClick={() => setImpPresPibImps(impPresPibImps.filter((_, i) => i !== idx))}><X className="w-3 h-3" /></Button>
                                )}
                              </div>
                            ))}
                            {impPresIpImps.map((ipVal, idx) => (
                              <div key={idx} className="flex gap-1 items-center">
                                <Input
                                  placeholder={`IP Impressora ${impPresIpImps.length > 1 ? idx + 1 : ''}`}
                                  value={ipVal}
                                  onChange={(e) => { const u = [...impPresIpImps]; u[idx] = e.target.value; setImpPresIpImps(u); }}
                                  className="text-sm h-8"
                                />
                                {idx === impPresIpImps.length - 1 && (
                                  <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => setImpPresIpImps([...impPresIpImps, ""])}><Plus className="w-4 h-4" /></Button>
                                )}
                                {impPresIpImps.length > 1 && (
                                  <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0 text-destructive hover:text-destructive" onClick={() => setImpPresIpImps(impPresIpImps.filter((_, i) => i !== idx))}><X className="w-3 h-3" /></Button>
                                )}
                              </div>
                            ))}
                            <Input
                              placeholder="Setor"
                              value={impPresSetor}
                              onChange={(e) => setImpPresSetor(e.target.value)}
                              className="text-sm h-8"
                            />
                            {impPresPibMicros.map((pibVal, idx) => (
                              <div key={idx} className="flex gap-1 items-center">
                                <Input
                                  placeholder={`PIB Micro ${impPresPibMicros.length > 1 ? idx + 1 : ''}`}
                                  value={pibVal}
                                  onChange={(e) => { const u = [...impPresPibMicros]; u[idx] = e.target.value; setImpPresPibMicros(u); }}
                                  className="text-sm h-8"
                                />
                                {idx === impPresPibMicros.length - 1 && (
                                  <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => setImpPresPibMicros([...impPresPibMicros, ""])}><Plus className="w-4 h-4" /></Button>
                                )}
                                {impPresPibMicros.length > 1 && (
                                  <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0 text-destructive hover:text-destructive" onClick={() => setImpPresPibMicros(impPresPibMicros.filter((_, i) => i !== idx))}><X className="w-3 h-3" /></Button>
                                )}
                              </div>
                            ))}
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="w-full border-primary/50 text-primary hover:bg-primary/10">
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  Orientações
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80 p-4" align="center">
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-primary flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Orientações
                                  </h4>
                                  <ul className="text-sm space-y-1.5 text-muted-foreground list-disc list-inside">
                                    <li>Para o atendimento <strong>PRESENCIAL</strong>, um único chamado abrange a instalação do equipamento NOVO e a configuração de todos os micros <strong>NO SETOR</strong></li>
                                    <li>Abrir tarefa no OTRS para cada micro configurado</li>
                                    <li>Detalhe todos os procedimentos e testes realizados</li>
                                    <li>Anexe quaisquer print/foto em nota normal, <strong>ANTES</strong> de salvar a conclusão, pois na nota de conclusão só é possível utilizar texto</li>
                                    <li>Em <strong>"Motivo do Status"</strong>, use apenas <strong>"Utilização de procedimentos"</strong></li>
                                    <li>Registre todas as PIB dos micros configurados <strong>NO SETOR</strong></li>
                                    <li>É <strong>OBRIGATÓRIO A REALIZAÇÃO DO TESTE DE IMPRESSÃO</strong></li>
                                    <li>Ao capturar o chamado, ajuste a categorização em <strong>"Categorização"</strong> &gt;&gt; <strong>"Categorização Operacional"</strong></li>
                                    <li>Em caso de dúvidas acione a <strong>Supervisão</strong> ou <strong>Ticket Manager</strong></li>
                                  </ul>
                                  <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-800 text-center text-sm">
                                    <p className="font-bold">!! Atenção !!</p>
                                    <p>Notificar usuário com a solução realizada: <strong>SIM</strong></p>
                                    <p>Modo de execução: <strong>presencial</strong></p>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                            <Button
                              size="sm"
                              className="w-full bg-primary hover:bg-primary/90"
                              onClick={() => {
                                const data = impPresData || '__/__/202X';
                                const nome = impPresNome || '________';
                                const pibImps = impPresPibImps.filter(p => p.trim());
                                const pibImpText = pibImps.length > 0 ? pibImps.join(', ') : '';
                                const ipImps = impPresIpImps.filter(p => p.trim());
                                const ipImpText = ipImps.length > 0 ? ipImps.join(', ') : '';
                                const setor = impPresSetor || '________';
                                const pibMicros = impPresPibMicros.filter(p => p.trim());
                                const pibMicroText = pibMicros.length > 0 ? pibMicros.join(', ') : '';
                                const nota = `PROCEDIMENTOS REALIZADOS DURANTE VISITA TÉCNICA NO DIA ${data}

USUÁRIO: ${nome}

=========================

É A PRIMEIRA INSTALAÇÃO DESTA IMPRESSORA NO SETOR? SIM ( x )    NÃO ( x )

PIB Impressora: ${pibImpText}

PIB Micro: ${pibMicroText}

IP Impressora: ${ipImpText}

========================

FORAM REALIZADOS OS PROCEDIMENTOS DE:

- PROCEDIMENTO_1
- PROCEDIMENTO_2
- PROCEDIMENTO_3

APÓS PROCEDIMENTOS FORAM REALIZADOS TESTES (CONEXÃO E IMPRESSÃO), QUE CONFIRMARAM A SOLUÇÃO DO PROBLEMA.

================

Micros indicados configurados no Setor ${setor}

================

PIB:
PIB:
PIB:
PIB:

================

ATENCIOSAMENTE,
SUPORTE TÉCNICO HEPTA`;
                                navigator.clipboard.writeText(nota);
                                toast.success('Nota de Conclusão - Impressora Presencial copiada!');
                              }}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copiar Nota
                            </Button>
                          </div>
                        )}
                        {cat.id === "diagnostico-generico" && (
                          <div className="mt-3 space-y-2">
                            <Input
                              placeholder="Setor direcionado"
                              value={diagGenSetor}
                              onChange={(e) => setDiagGenSetor(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Input
                              placeholder="Nome do usuário"
                              value={diagGenNome}
                              onChange={(e) => setDiagGenNome(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Input
                              placeholder="PIB do equipamento"
                              value={diagGenPib}
                              onChange={(e) => setDiagGenPib(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Input
                              placeholder="PIB Micro"
                              value={diagGenPibMicro}
                              onChange={(e) => setDiagGenPibMicro(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50">
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  Orientações
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80 p-4" align="center">
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-amber-700 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Orientações
                                  </h4>
                                  <ul className="text-sm space-y-1.5 text-muted-foreground list-disc list-inside">
                                    <li>Detalhe todos os procedimentos e testes realizados e anexe os prints e fotos comprobatórios</li>
                                    <li>Informe os documentos do BC Suporte utilizados como referência</li>
                                    <li><strong>Mais detalhes &gt;&gt; Bloqueado:</strong> (Sim)</li>
                                    <li>Ao capturar o chamado, ajuste a categorização em <strong>"Categorização"</strong> &gt;&gt; <strong>"Categorização Operacional"</strong></li>
                                    <li>Em caso de dúvidas acione a <strong>Supervisão</strong> ou <strong>Ticket Manager</strong></li>
                                  </ul>
                                  <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-800 text-center text-sm">
                                    <p className="font-bold">!! Atenção !!</p>
                                    <p>Em "Tipo de informação de trabalho",</p>
                                    <p className="font-bold">marque "DIAGNÓSTICO"</p>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                            <Button
                              size="sm"
                              className="w-full bg-amber-600 hover:bg-amber-700"
                              onClick={() => {
                                const setor = diagGenSetor || '__________';
                                const nome = diagGenNome || '_________________';
                                const pib = diagGenPib || '';
                                const pibMicro = diagGenPibMicro || '';
                                const nota = `FAVOR DIRECIONAR AO SETOR ${setor}

==================

PIB: ${pib}

PIB Micro: ${pibMicro}

==================

EM CONTATO COM O USUÁRIO ${nome}, FORAM REALIZADOS OS PROCEDIMENTOS DE:

- PROCEDIMENTO 1
- PROCEDIMENTO 2
- PROCEDIMENTO 3

APÓS PROCEDIMENTOS FOI VERIFICADO QUE:

< JUSTIFICATIVA >

Possui procedimento no BC-Suporte? ( X ) SIM ( X ) Não
Se sim, Nome do arquivo:_____________________

ATENCIOSAMENTE,
SUPORTE TÉCNICO HEPTA`;
                                navigator.clipboard.writeText(nota);
                                toast.success('Nota de Diagnóstico - Genérico copiada!');
                              }}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copiar Nota
                            </Button>
                          </div>
                        )}
                        {cat.id === "diagnostico-sigesf" && (
                          <div className="mt-3 space-y-2">
                            <Input
                              placeholder="Direcionar a..."
                              value={sigesfDirecionar}
                              onChange={(e) => setSigesfDirecionar(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Input
                              placeholder="Data da visita (ex: 27/02/2026)"
                              value={sigesfData}
                              onChange={(e) => setSigesfData(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Input
                              placeholder="Nome do usuário"
                              value={sigesfNome}
                              onChange={(e) => setSigesfNome(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Input
                              placeholder="Modelo do equipamento"
                              value={sigesfModelo}
                              onChange={(e) => setSigesfModelo(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Input
                              placeholder="PIB do equipamento"
                              value={sigesfPib}
                              onChange={(e) => setSigesfPib(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Input
                              placeholder="IP do equipamento"
                              value={sigesfIp}
                              onChange={(e) => setSigesfIp(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Input
                              placeholder="PIB Micro"
                              value={sigesfPibMicro}
                              onChange={(e) => setSigesfPibMicro(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50">
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  Orientações
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80 p-4" align="center">
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-amber-700 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Orientações
                                  </h4>
                                  <ul className="text-sm space-y-1.5 text-muted-foreground list-disc list-inside">
                                    <li>Detalhe todos os procedimentos e testes realizados e anexe os prints comprobatórios</li>
                                    <li>Informe os documentos do BC Suporte utilizados como referência</li>
                                    <li><strong>Mais detalhes &gt;&gt; Bloqueado:</strong> (Sim)</li>
                                    <li>Ao capturar o chamado, ajuste a categorização em <strong>"Categorização"</strong> &gt;&gt; <strong>"Categorização Operacional"</strong></li>
                                    <li><a href="#" className="text-blue-600 underline">Link manual</a></li>
                                    <li><a href="#" className="text-blue-600 underline">Link Manual Correios</a></li>
                                    <li>Em caso de dúvidas acione a <strong>Supervisão</strong> ou <strong>Ticket Manager</strong></li>
                                  </ul>
                                  <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-800 text-center text-sm">
                                    <p className="font-bold">!! Atenção !!</p>
                                    <p>Em "Tipo de informação de trabalho",</p>
                                    <p className="font-bold">marque "DIAGNÓSTICO"</p>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                            <Button
                              size="sm"
                              className="w-full bg-amber-600 hover:bg-amber-700"
                              onClick={() => {
                                const direcionar = sigesfDirecionar || '________';
                                const data = sigesfData || '__/__/202X';
                                const nome = sigesfNome || '________';
                                const modelo = sigesfModelo || '';
                                const pib = sigesfPib || '';
                                const ip = sigesfIp || '';
                                const pibMicro = sigesfPibMicro || '';
                                const nota = `FAVOR DIRECIONAR A ${direcionar}

DIAGNÓSTICO PRESENCIAL

PIB Micro: ${pibMicro}

PROCEDIMENTOS REALIZADOS DURANTE VISITA TÉCNICA NO DIA ${data}

USUÁRIO: ${nome}

FOI REALIZADO OS PROCEDIMENTOS DE:

Verificação de Hardware

Cabos de energia Funcionais? SIM ( x )    NÃO ( x )
O modelo é um Totem ou MiniPC? ( x )Totem ou ( x )MiniPC
Estabilizador\\nobreak Funcionando? SIM ( x )    NÃO ( x )
Fonte Ligando? SIM ( x )    NÃO ( x )
Placa mãe funcionando? SIM ( x )    NÃO ( x )
Ventoinhas funcionais? SIM ( x )    NÃO ( x )
Possui placa de vídeo? SIM ( x )    NÃO ( x )
se não, Entrada HDMI funcional na placa mãe? SIM ( x )    NÃO ( x )
Impressora externa? SIM ( x )    NÃO ( x )
se sim, modelo da impressora externa: __________
Painel (TV) liga? SIM ( x )    NÃO ( x )
Usa adaptador HDMI ou cabo HDMI completo? Adaptador ( x ) Cabo Direto ( x )
Monitor TouchScreen funcional? SIM ( x )    NÃO ( x )
Entradas USB funcionais? SIM ( x )    NÃO ( x )
Teste de integridade no cabo e ponto de rede normal? SIM ( x )    NÃO ( x )

Verificação de software

Boot normal? __________
Windows 7 ou 10? __________
Autologon normal?__________
Sigesf Atualizado? __________
Emissor e Painel na configuração padrão?__________
Emissor apresenta erro ou falha?__________
Painel apresenta erro ou falha?__________
Impressora genérica SIGESF configurada e funcionando?__________
Configuração do Emissor para impressora interna ou externa (SIGESF ou EscPos) realizado?__________
Impressora Externa na porta COM2 ?__________

Scripts executados

Sigesf_Ajusta_Variaveis ?_________
SigesfAjustes (somente caso autologon não funcione)_________

APÓS PROCEDIMENTOS FOI VERIFICADO QUE:

< JUSTIFICATIVA >

===================
Equipamento indicado pelo Usuário
===================

MODELO: ${modelo}
PIB: ${pib}
IP: ${ip}

===================

ATENCIOSAMENTE,
SUPORTE TÉCNICO HEPTA`;
                                navigator.clipboard.writeText(nota);
                                toast.success('Nota de Diagnóstico - Sigesf copiada!');
                              }}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copiar Nota
                            </Button>
                          </div>
                        )}
                        {cat.id === "improdutivo-presencial" && (
                          <div className="mt-3 space-y-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="w-full border-red-300 text-red-700 hover:bg-red-50">
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  Orientações
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-96 p-4" align="start">
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-red-700 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Orientações
                                  </h4>
                                  <ul className="text-sm space-y-1.5 text-muted-foreground list-disc list-inside">
                                    <li>Realize a tentativa de contato e tentativa de atendimento remoto previamente</li>
                                    <li><strong>O envio do e-mail da tentativa de contato é obrigatório</strong></li>
                                    <li>Utilizar o modelo de e-mail específico do PO – Improdutivo Presencial</li>
                                    <li>Ao chegar na unidade/setor caso seja impedido de iniciar o atendimento prossiga com o fechamento de imediato</li>
                                    <li>Caso não possa realizar o envio do e-mail de fechamento e/ou a conclusão do chamado, solicite a um colega no Teams para fazer por você ou acione a Supervisão ou Ticket Manager</li>
                                    <li><strong>Atenção!</strong> A conclusão sem o envio prévio dos e-mails gera bloqueio</li>
                                    <li>Anexe quaisquer print/foto em nota normal, <strong>ANTES</strong> de salvar a conclusão, pois na nota de conclusão só é possível utilizar texto</li>
                                    <li>Em <strong>"Motivo do Status"</strong>, use apenas <strong>"Utilização de procedimentos"</strong></li>
                                    <li>Em caso de dúvidas acione a <strong>Supervisão</strong> ou <strong>Ticket Manager</strong></li>
                                  </ul>
                                  <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-800 text-center text-sm">
                                    <p className="font-bold">!! Atenção !!</p>
                                    <p>Notificar usuário com a solução realizada: <strong>SIM</strong></p>
                                    <p>Modo de execução: <strong>presencial</strong></p>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                            <Button
                              size="sm"
                              className="w-full bg-red-600 hover:bg-red-700"
                              onClick={() => {
                                const nota = `IMPRODUTIVO

Este chamado necessita de realização de contato telefônico com o usuário para confirmação dos dados do chamado.

Foi realizada tentativa de contato telefônico, assim como foi encaminhado e-mail notificando que um técnico desta empresa se deslocou para atendimento da demanda presencial. Ao chegar na unidade, o usuário ou algum outro colaborador indicado não se encontrava presente ou não tinha disponibilidade para o atendimento.

Desta forma, este chamado será fechado como improdutivo, e sua reabertura será considerada indevida.

Caso ainda necessite do suporte técnico, solicitamos que registre um novo chamado.`;
                                navigator.clipboard.writeText(nota);
                                toast.success('Nota de Improdutivo - Presencial copiada!');
                              }}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copiar Nota
                            </Button>
                          </div>
                        )}
                        {cat.id === "improdutivo-outras-p" && (
                          <div className="mt-3 space-y-2">
                            <Input
                              placeholder="Nome do usuário"
                              value={improdOutrasPNome}
                              onChange={(e) => setImprodOutrasPNome(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Input
                              placeholder="Justificativa"
                              value={improdOutrasPJustificativa}
                              onChange={(e) => setImprodOutrasPJustificativa(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="w-full border-red-300 text-red-700 hover:bg-red-50">
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  Orientações
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-96 p-4" align="start">
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-red-700 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Orientações
                                  </h4>
                                  <ul className="text-sm space-y-1.5 text-muted-foreground list-disc list-inside">
                                    <li><strong>(Remoto ou Presencial)</strong> Na <strong>Justificativa</strong> informe o motivo pelo qual o atendimento não pode ser realizado
                                      <ul className="list-disc list-inside ml-4 mt-1">
                                        <li>Detalhar o melhor possível a justificativa</li>
                                      </ul>
                                    </li>
                                    <li>Utilize apenas nos seguintes casos:
                                      <ul className="list-disc list-inside ml-4 mt-1">
                                        <li>(Remoto ou Presencial) Recusa do atendimento pelo usuário</li>
                                        <li>(Presencial) Acesso ao ambiente/equipamento não autorizado ou indisponível</li>
                                        <li>(Remoto ou Presencial) Solicitação de retorno em outra data</li>
                                        <li>(Remoto ou Presencial) Indisponibilidade da unidade</li>
                                      </ul>
                                    </li>
                                    <li><strong>Exemplo:</strong> Unidade fechada no horário informado na planilha ou Nenhum colaborador disponível para acompanhar o atendimento</li>
                                    <li><strong>(Presencial)</strong> Em caso de falta de rede ou energia na unidade, verifique com o usuário se há uma previsão para retorno; caso não houver, conclua como Improdutivo – Outras Situações</li>
                                    <li>Caso não possa fechar o chamado no momento, solicite no Teams que algum colega feche e você abre tarefa no OTRS depois</li>
                                    <li>Nesta situação <strong>não é necessário</strong> enviar os e-mails</li>
                                    <li>Em caso de dúvidas acione a <strong>Supervisão</strong> ou <strong>Ticket Manager</strong></li>
                                  </ul>
                                  <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-800 text-center text-sm">
                                    <p className="font-bold">!! Atenção !!</p>
                                    <p>Notificar usuário com a solução realizada: <strong>SIM</strong></p>
                                    <p>Modo de execução: <strong>presencial</strong></p>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                            <Button
                              size="sm"
                              className="w-full bg-red-600 hover:bg-red-700"
                              onClick={() => {
                                const nome = improdOutrasPNome || '___________';
                                const justificativa = improdOutrasPJustificativa || '<< JUSTIFICATIVA >>';
                                const nota = `IMPRODUTIVO

Conforme verificado com Usuário ${nome}, Não foi possível realizar o atendimento devido:

${justificativa}

Foi indicado outro colaborador para acompanhar o atendimento? SIM ( x )    NÃO ( x ) (Não se aplica)

Desta forma, este chamado será fechado como improdutivo, e sua reabertura será considerada indevida.

Caso ainda necessite do suporte técnico, solicitamos que registre um novo chamado.`;
                                navigator.clipboard.writeText(nota);
                                toast.success('Nota de Improdutivo - Outras Situações (Presencial) copiada!');
                              }}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copiar Nota
                            </Button>
                          </div>
                        )}
                        {cat.id === "devolucao-presencial" && (
                          <div className="mt-3 space-y-2">
                            <Input
                              placeholder="PIB do equipamento"
                              value={devPresPib}
                              onChange={(e) => setDevPresPib(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Input
                              placeholder="IP do equipamento"
                              value={devPresIp}
                              onChange={(e) => setDevPresIp(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Input
                              placeholder="PIB Micro"
                              value={devPresPibMicro}
                              onChange={(e) => setDevPresPibMicro(e.target.value)}
                              className="text-sm h-8"
                            />
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50">
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  Orientações
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-96 p-4" align="start">
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-blue-700 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Orientações
                                  </h4>
                                  <ul className="text-sm space-y-1.5 text-muted-foreground list-disc list-inside">
                                    <li>Caso seja resolvido remotamente verifique o SLA do chamado</li>
                                    <li>Devolva apenas se a solicitação tiver menos de 10h de SLA e se já estiver resolvida e validada com o cliente</li>
                                    <li><strong>Observação:</strong> Atenção ao SLA de chamados de Call-back – a Conclusão do chamado deve ser na mesma fila do atendimento anterior</li>
                                    <li>Capture e conclua imediatamente ao retornar a fila, caso não possa, peça a algum colega para fazer a conclusão do chamado (anote a WO para abrir tarefa no OTRS depois)</li>
                                    <li>Detalhe todos os procedimentos e testes realizados</li>
                                    <li>Informe os documentos do BC Suporte utilizados como referência</li>
                                    <li>Mais detalhes &gt;&gt; Bloqueado: <strong>(Sim)</strong></li>
                                    <li>Ao capturar o chamado, ajuste a categorização em <strong>"Categorização"</strong> &gt;&gt; <strong>"Categorização Operacional"</strong></li>
                                    <li>Em caso de dúvidas acione a <strong>Supervisão</strong> ou <strong>Ticket Manager</strong></li>
                                  </ul>
                                  <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-800 text-center text-sm">
                                    <p className="font-bold">!! Atenção !!</p>
                                    <p>Em "Tipo de informação de trabalho", marque <strong>"Informações Gerais"</strong></p>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                            <Button
                              size="sm"
                              className="w-full bg-blue-600 hover:bg-blue-700"
                              onClick={() => {
                                const pib = devPresPib || '';
                                const ip = devPresIp || '';
                                const pibMicro = devPresPibMicro || '';
                                const nota = `FAVOR DIRECIONAR A FILA REMOTA

ATENDIMENTO CONCLUIDO REMOTAMENTE

===================

PIB: ${pib}

PIB Micro: ${pibMicro}

IP: ${ip}

===================

FORAM REALIZADOS OS PROCEDIMENTOS DE:

- PROCEDIMENTO_1
- PROCEDIMENTO_2
- PROCEDIMENTO_3

APÓS PROCEDIMENTOS FORAM REALIZADOS TESTES DE:

- TESTE 1
- TESTE 2
- TESTE 3

QUE CONFIRMARAM A SOLUÇÃO DO PROBLEMA.

ATENCIOSAMENTE,
SUPORTE TÉCNICO HEPTA`;
                                navigator.clipboard.writeText(nota);
                                toast.success('Nota de Devolução - Presencial copiada!');
                              }}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copiar Nota
                            </Button>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="checklists">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-bold">Checklists</h2>
                </div>
                <p className="text-muted-foreground">
                  Checklists de verificação para procedimentos padronizados.
                </p>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card className={`p-4 border-l-4 border-l-primary ${analiseProblemasOpen ? 'col-span-full' : 'hover:shadow-md cursor-pointer'}`}>
                    {!analiseProblemasOpen ? (
                      <div onClick={() => setAnaliseProblemasOpen(true)}>
                        <h3 className="font-semibold">Análise de Problemas de Rede/Internet</h3>
                        <p className="text-xs text-muted-foreground mt-1">Confirmar padrão e identificar escopo do problema</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">Análise de Problemas de Rede/Internet</h3>
                          <Button variant="ghost" size="sm" onClick={() => setAnaliseProblemasOpen(false)}>✕</Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <strong>Objetivo:</strong> Confirmar se o micro está no padrão e identificar o escopo do problema.
                        </p>

                        {/* Camada física e transporte */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-primary border-b pb-1">Checklist - Camada Física e Transporte</h4>
                          {[
                            { key: 'cabo_rede', label: 'O cabo de rede apresenta rompimento ou danos? (se tiver o testador, faça um teste de continuidade)' },
                            { key: 'continuidade_ponto', label: 'Teste a continuidade e sinal do ponto de rede e porta de rede' },
                            { key: 'leds_porta', label: 'Os LEDs da porta de rede estão acesos quando o cabo está conectado?' },
                            { key: 'ip_configurado', label: 'O IP está configurado corretamente? (compare com um micro funcional próximo)' },
                          ].map(item => (
                            <label key={item.key} className="flex items-start gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1.5 rounded">
                              <Checkbox
                                checked={analiseChecks[item.key] || false}
                                onCheckedChange={(checked) => setAnaliseChecks(prev => ({ ...prev, [item.key]: !!checked }))}
                                className="mt-0.5"
                              />
                              <span className={analiseChecks[item.key] ? 'line-through text-muted-foreground' : ''}>{item.label}</span>
                            </label>
                          ))}
                        </div>

                        {/* Padrão de configuração */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-primary border-b pb-1">Checklist - Padrão de Configuração</h4>
                          {[
                            { key: 'acesso_vnc', label: 'Acesso VNC (verificar se o micro está acessível remotamente)' },
                            { key: 'rede_dominio', label: 'Rede e domínio (verificar se não há conflito de IP e se o micro está no domínio correiosnet.int)' },
                            { key: 'proxy_sistema', label: 'Proxy do sistema' },
                            { key: 'acesso_correios', label: 'Acesso a internet - sites Correios (sroweb, unicorreios, etc)' },
                            { key: 'acesso_terceiros', label: 'Acesso a internet - sites terceiros (Google, G1, etc)' },
                            { key: 'acesso_intranet', label: 'Acesso a intranet - sites internos Correios (rastreio, SRO Monitor, etc)' },
                          ].map(item => (
                            <label key={item.key} className="flex items-start gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1.5 rounded">
                              <Checkbox
                                checked={analiseChecks[item.key] || false}
                                onCheckedChange={(checked) => setAnaliseChecks(prev => ({ ...prev, [item.key]: !!checked }))}
                                className="mt-0.5"
                              />
                              <span className={analiseChecks[item.key] ? 'line-through text-muted-foreground' : ''}>{item.label}</span>
                            </label>
                          ))}
                        </div>

                        {/* Avançado */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-amber-600 border-b border-amber-200 pb-1">Checklist - Avançado (caso o problema persista)</h4>
                          {[
                            { key: 'limpeza_cache', label: 'Limpeza de cache dos navegadores' },
                            { key: 'teste_navegadores', label: 'Teste de acesso nos 3 navegadores (Edge, Chrome e Firefox)' },
                            { key: 'limpeza_temp', label: 'Limpeza de arquivos temporários do sistema' },
                            { key: 'reboot', label: 'Reboot do micro' },
                          ].map(item => (
                            <label key={item.key} className="flex items-start gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1.5 rounded">
                              <Checkbox
                                checked={analiseChecks[item.key] || false}
                                onCheckedChange={(checked) => setAnaliseChecks(prev => ({ ...prev, [item.key]: !!checked }))}
                                className="mt-0.5"
                              />
                              <span className={analiseChecks[item.key] ? 'line-through text-muted-foreground' : ''}>{item.label}</span>
                            </label>
                          ))}
                        </div>

                        {/* Escopo */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-blue-600 border-b border-blue-200 pb-1">Checklist - Escopo</h4>
                          {[
                            { key: 'outro_perfil', label: 'Funciona em outro perfil?' },
                            { key: 'outro_micro', label: 'O usuário acessa normalmente em outro micro?' },
                            { key: 'outros_usuarios', label: 'Outros usuários estão com o mesmo problema?' },
                            { key: 'site_especifico', label: 'É um site específico ou são vários? Quais sites por exemplo?' },
                          ].map(item => (
                            <label key={item.key} className="flex items-start gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1.5 rounded">
                              <Checkbox
                                checked={analiseChecks[item.key] || false}
                                onCheckedChange={(checked) => setAnaliseChecks(prev => ({ ...prev, [item.key]: !!checked }))}
                                className="mt-0.5"
                              />
                              <span className={analiseChecks[item.key] ? 'line-through text-muted-foreground' : ''}>{item.label}</span>
                            </label>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAnaliseChecks({})}
                          >
                            Limpar
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                  <Card className={`p-4 border-l-4 border-l-primary ${milestoneOpen ? 'col-span-full' : 'hover:shadow-md cursor-pointer'}`}>
                    {!milestoneOpen ? (
                      <div onClick={() => setMilestoneOpen(true)}>
                        <h3 className="font-semibold">Procedimento Milestone</h3>
                        <p className="text-xs text-muted-foreground mt-1">Impressora Milestone não funciona no Suporte Fácil</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">Procedimento Milestone</h3>
                          <Button variant="ghost" size="sm" onClick={() => setMilestoneOpen(false)}>✕</Button>
                        </div>
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm font-semibold text-red-800">Problema:</p>
                          <p className="text-sm text-red-700">Impressora Milestone não funciona no Suporte Fácil – Impressora Milestone apitando.</p>
                        </div>

                        <div className="space-y-3 text-sm text-foreground">
                          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                            <p className="font-semibold text-primary">1. Preparação inicial</p>
                            <p>Antes de qualquer atendimento no micro, rode o script <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">_basicoMicro</code> para ajustar as rotinas de acesso remoto e garantir que os scripts padronizados funcionem.</p>
                            <p className="text-muted-foreground text-xs">O _basicoMicro também corrige outras coisas que as instalações antigas não tinham e que são necessárias para o bom funcionamento dos computadores na rede.</p>
                          </div>

                          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                            <p className="font-semibold text-primary">2. Remover dispositivos ocultos</p>
                            <p>Vá no <strong>Gerenciador de Dispositivos</strong>. No menu <strong>Exibir</strong>, selecione <strong>"Mostrar dispositivos ocultos"</strong>.</p>
                            <p>Com a impressora <strong>ligada</strong>, remova os dispositivos que ficam apagados referentes à impressora Milestone. Geralmente ficam nas seções <strong>Controladores USB</strong> e/ou <strong>Portas (COM e LPT)</strong>.</p>
                            <p className="text-amber-700 font-medium">💡 Também remova o driver da Prolific, pois o Suporte Fácil vai adicionar o que foi testado e padronizado.</p>
                          </div>

                          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                            <p className="font-semibold text-primary">3. Reiniciar o computador</p>
                            <p>Após remover os dispositivos, <strong>reinicie o computador</strong>.</p>
                          </div>

                          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                            <p className="font-semibold text-primary">4. Ajustar periféricos no Suporte Fácil</p>
                            <p>Entre no Suporte Fácil → <strong>Atendimento</strong> → <strong>Ajustes dos Periféricos</strong> → mande ajustar.</p>
                            <p className="text-amber-700 font-medium">⚠️ Na hora de ajustar os periféricos, deixe a impressora Milestone <strong>desligada</strong>. Ele vai limpar as entradas antigas dela também. Se houver alguma incompatibilidade, ele vai limpar.</p>
                          </div>

                          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                            <p className="font-semibold text-primary">5. Reinstalar impressora</p>
                            <p>Refaça a instalação usando o próprio Suporte Fácil pela <strong>Instalação de Impressoras Térmicas</strong>.</p>
                            <p className="text-muted-foreground text-xs">O Suporte Fácil entra na máquina e apaga todos os dispositivos ocultos antes de instalar, o que diminui o problema.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                  <Card className={`p-4 border-l-4 border-l-primary ${formatacaoRemotaOpen ? 'col-span-full' : 'hover:shadow-md cursor-pointer'}`}>
                    {!formatacaoRemotaOpen ? (
                      <div onClick={() => setFormatacaoRemotaOpen(true)}>
                        <h3 className="font-semibold">Formatação Remota</h3>
                        <p className="text-xs text-muted-foreground mt-1">Requisitos e procedimentos para formatação remota</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">Formatação Remota</h3>
                          <Button variant="ghost" size="sm" onClick={() => setFormatacaoRemotaOpen(false)}>✕</Button>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-primary border-b pb-1">Verificar Requisitos</h4>
                          <ul className="text-sm space-y-1.5 list-disc list-inside text-foreground">
                            <li>Micro em rede e acessível remotamente?</li>
                            <li>Micro possui o recovery?</li>
                            <li>O recovery está, ou foi possível configurar, para acessar remotamente?</li>
                            <li>Qual a versão do recovery?</li>
                          </ul>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                            <p className="font-semibold text-amber-800 text-sm">Se Recovery 8 ou anterior</p>
                            <ul className="text-sm space-y-1 list-disc list-inside text-amber-900">
                              <li>Só é possível formatar utilizando um <strong>deploy antigo</strong></li>
                              <li>Verifique se a unidade possui um deploy local</li>
                              <li>Para confirmar a versão do deploy, cheque a pasta <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-xs">\operating systems</code></li>
                              <li>Se tiver uma pasta com <strong>Win7</strong> significa que o deploy é antigo e pode ser usado</li>
                            </ul>
                            <p className="text-xs text-amber-700 mt-2 font-medium">📄 POP - Formatação de micros no ambiente Correios.pdf</p>
                          </div>

                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                            <p className="font-semibold text-blue-800 text-sm">Se Recovery 9 ou superior</p>
                            <ul className="text-sm space-y-1 list-disc list-inside text-blue-900">
                              <li>É possível usar o deploy de <strong>qualquer SE</strong> que tenha o deploy atualizado</li>
                            </ul>
                            <p className="text-xs text-blue-700 mt-2 font-medium">📄 [v2.0]-Windows 10 e 11 - POP - Baixa de Master no Ambiente Correios.pdf</p>
                          </div>
                        </div>

                        <div className="p-3 bg-red-50 border border-red-300 rounded-lg">
                          <p className="text-sm text-red-800 font-semibold">⚠️ Atenção</p>
                          <p className="text-sm text-red-700">Utilizar um deploy incompatível para o recovery disponível pode ocasionar <strong>falha no processo de formatação</strong>, o indisponibilizando para nova tentativa remota.</p>
                        </div>
                      </div>
                    )}
                  </Card>
                  <Card className={`p-4 border-l-4 border-l-amber-500 ${espansoOpen ? 'col-span-full' : 'hover:shadow-md cursor-pointer'}`}>
                    {!espansoOpen ? (
                      <div onClick={() => setEspansoOpen(true)}>
                        <h3 className="font-semibold">Ferramenta - Espanso</h3>
                        <p className="text-xs text-muted-foreground mt-1">Expansor de texto para produtividade</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">Ferramenta - Espanso</h3>
                          <Button variant="ghost" size="sm" onClick={() => setEspansoOpen(false)}>✕</Button>
                        </div>

                        <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-2">
                          <p><strong>Espanso</strong> é um expansor de texto gratuito e de código aberto que funciona em Linux, Windows e macOS.</p>
                          <p>Um expansor de texto é um programa que permite substituir abreviações por frases ou palavras mais longas. Por exemplo, se você digitar <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">:tentativa1</code> no seu editor de texto, o expansor pode substituir automaticamente pelo texto do email de primeira tentativa.</p>
                          <p className="text-muted-foreground">Isso pode economizar muito tempo e aumentar a produtividade, especialmente para textos repetitivos usados com frequência.</p>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-amber-700 border-b border-amber-200 pb-1">Como Instalar e Configurar</h4>
                          <ol className="text-sm space-y-1.5 list-decimal list-inside text-foreground">
                            <li>Acesse <a href="https://espanso.org/install/" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">espanso.org/install</a> e baixe a versão <strong>(portable)</strong> correspondente para seu S.O.</li>
                            <li>Descompacte no disco <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">C:\</code> (para facilitar a configuração)</li>
                            <li>Vá em <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">C:\espanso-portable</code> e execute <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">START_ESPANSO.bat</code></li>
                            <li>Marque para <strong>iniciar com o sistema</strong></li>
                            <li>Vá em <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">C:\espanso-portable\.espanso\match</code></li>
                            <li>Cole os <strong>arquivos de configuração .yml</strong></li>
                          </ol>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-amber-700 border-b border-amber-200 pb-1">Utilizando o Espanso</h4>
                          <p className="text-sm">Basta digitar o <strong>atalho correspondente</strong> em qualquer campo de texto. O Espanso irá identificar a sequência de teclas e substituirá o atalho pelo texto correspondente.</p>
                        </div>

                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-sm font-semibold text-amber-800">📁 Arquivos de configuração</p>
                          <p className="text-sm text-amber-700">Os arquivos <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-xs">.yml</code> de configuração prontos (Espanso-config) devem ser obtidos com a Supervisão ou Ticket Manager.</p>
                        </div>
                      </div>
                    )}
                  </Card>
                  <Card className={`p-4 border-l-4 border-l-amber-500 ${atualizacaoFerramentaOpen ? 'col-span-full' : 'hover:shadow-md cursor-pointer'}`}>
                    {!atualizacaoFerramentaOpen ? (
                      <div onClick={() => setAtualizacaoFerramentaOpen(true)}>
                        <h3 className="font-semibold">Atualização da Ferramenta</h3>
                        <p className="text-xs text-muted-foreground mt-1">Estrutura e atualização do pendrive de deploy</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">Atualização da Ferramenta</h3>
                          <Button variant="ghost" size="sm" onClick={() => setAtualizacaoFerramentaOpen(false)}>✕</Button>
                        </div>

                        <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-1">
                          <p className="font-semibold text-primary mb-2">Estrutura de Diretórios do Pendrive</p>
                          <div className="font-mono text-xs space-y-0.5 bg-background p-3 rounded border">
                            <p>📁 <strong>\Deploy_Win7</strong></p>
                            <p>📁 <strong>\DeployPendrive</strong></p>
                            <p className="ml-4">📁 \DeployPendrive\Operating Systems</p>
                            <p>📁 <strong>\ISOS</strong></p>
                            <p className="text-muted-foreground">📁 \ISOS_ECT</p>
                            <p className="text-muted-foreground">📁 \TEMP</p>
                            <p className="text-muted-foreground">📁 \ventoy</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-amber-700 border-b border-amber-200 pb-1">Preparação do Pendrive</h4>
                          <p className="text-sm">O Pendrive deve ser formatado com a ferramenta <strong>Cria_Boot_MDT</strong> dos Correios e deve possuir os seguintes arquivos e diretórios:</p>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="grid gap-2">
                            <div className="flex items-start gap-2 p-2 bg-muted/50 rounded">
                              <span className="font-mono text-xs bg-primary/10 px-2 py-0.5 rounded whitespace-nowrap">\DeployPendrive</span>
                              <span>Deploy Padrão (Versão 0325) ~55GB</span>
                            </div>
                            <div className="flex items-start gap-2 p-2 bg-muted/50 rounded">
                              <span className="font-mono text-xs bg-primary/10 px-2 py-0.5 rounded whitespace-nowrap">\Deploy_Win7</span>
                              <span>Deploy WIN7 (Versão 0325) ~15,5GB</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-amber-700 border-b border-amber-200 pb-1">ISOs - Salvar em \ISOS</h4>
                          <ul className="text-sm space-y-1 list-disc list-inside">
                            <li><code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">Boot_Recovery.v9.24f.ISO</code></li>
                            <li><code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">Boot_Recovery.v9.23i.ISO</code></li>
                            <li><code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">Boot_Recovery.v9.23j.ISO</code></li>
                          </ul>
                        </div>

                        <div className="p-3 bg-red-50 border border-red-300 rounded-lg">
                          <p className="text-sm text-red-800 font-semibold">⚠️ Atenção</p>
                          <p className="text-sm text-red-700">Os diretórios <code className="bg-red-100 px-1 py-0.5 rounded font-mono text-xs">\ISOS_ECT</code>, <code className="bg-red-100 px-1 py-0.5 rounded font-mono text-xs">\ventoy</code> e <code className="bg-red-100 px-1 py-0.5 rounded font-mono text-xs">\TEMP</code> <strong>NÃO</strong> devem ser modificados ou removidos.</p>
                        </div>

                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">📄 Mais detalhes em <strong>[v2.0]-Preparação do Pendrive para Baixa de Master.pdf</strong></p>
                        </div>
                      </div>
                    )}
                  </Card>
                  <Card className={`p-4 border-l-4 border-l-amber-500 ${preparacaoFerramentaOpen ? 'col-span-full' : 'hover:shadow-md cursor-pointer'}`}>
                    {!preparacaoFerramentaOpen ? (
                      <div onClick={() => setPreparacaoFerramentaOpen(true)}>
                        <h3 className="font-semibold">Preparação da Ferramenta</h3>
                        <p className="text-xs text-muted-foreground mt-1">Preparação do pendrive para baixa de master</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">Preparação da Ferramenta</h3>
                          <Button variant="ghost" size="sm" onClick={() => setPreparacaoFerramentaOpen(false)}>✕</Button>
                        </div>

                        <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-1">
                          <p>📄 Documentação: <strong>Preparação do Pendrive para Baixa de Master</strong></p>
                          <p>🎬 Passo a passo em vídeo: <strong>Preparando Pendrive - Boot_Correios.mp4</strong></p>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-amber-700 border-b border-amber-200 pb-1">Download Deploy Correios</h4>
                          <div className="text-sm space-y-1">
                            <p>🔗 Link: <strong>02 - Deploy</strong></p>
                            <p>📋 Procedimento de download: <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">LEIA-ME_DEPLOY.txt</code></p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-amber-700 border-b border-amber-200 pb-1">Download do Deploy para SIGESF e Windows 7</h4>
                          <div className="text-sm space-y-1">
                            <p>🔗 Link: <strong>Deploy_Win7-0325</strong></p>
                            <p>Basta descompactar o diretório na raiz do pendrive com o <strong>7zip</strong>. O caminho para a raiz do deploy deve ficar: <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">\Deploy_Win7</code></p>
                          </div>
                        </div>

                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                          <p className="text-blue-800">💡 <strong>Obs:</strong> Se tiver espaço, recomendo levar uma ISO do <strong>Hirens Boot</strong> também. Basta copiar o arquivo para <code className="bg-blue-100 px-1 py-0.5 rounded font-mono text-xs">\ISOS</code> que estará acessível pelo Ventoy.</p>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-primary border-b pb-1">Estrutura do Pendrive</h4>
                          <div className="font-mono text-xs space-y-0.5 bg-background p-3 rounded border">
                            <p>📁 <strong>\Deploy_Win7</strong> — Deploy SIGESF/Win7</p>
                            <p>📁 <strong>\DeployPendrive</strong> — Deploy Padrão</p>
                            <p className="ml-4">📁 \Operating Systems</p>
                            <p>📁 <strong>\ISOS</strong> — ISOs de boot/recovery</p>
                            <p className="text-muted-foreground">📁 \ISOS_ECT — <em>não modificar</em></p>
                            <p className="text-muted-foreground">📁 \TEMP — <em>não modificar</em></p>
                            <p className="text-muted-foreground">📁 \ventoy — <em>não modificar</em></p>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                  <Card className={`p-4 border-l-4 border-l-blue-500 ${totemOpen ? 'col-span-full' : 'hover:shadow-md cursor-pointer'}`}>
                    {!totemOpen ? (
                      <div onClick={() => setTotemOpen(true)}>
                        <h3 className="font-semibold">Para Atualizar o Totem SIGESF</h3>
                        <p className="text-xs text-muted-foreground mt-1">Procedimento de atualização do SIGESF nos totens</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">Para Atualizar o Totem SIGESF</h3>
                          <Button variant="ghost" size="sm" onClick={() => setTotemOpen(false)}>✕</Button>
                        </div>

                        <div className="p-3 bg-muted/50 rounded-lg text-sm">
                          <p className="font-medium">Caminho do atualizador:</p>
                          <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs block mt-1">\\sac3144\Deploy\Applications\SIGESF_12_2016_V1</code>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-blue-700 border-b border-blue-200 pb-1">Procedimento Padrão</h4>
                          <ol className="text-sm space-y-2 list-decimal list-inside">
                            <li>Copie para o totem o arquivo <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">SetupSIGESFUpdateSilent.exe</code> de um deploy atualizado (sedes ou SAC3144)
                              <p className="text-xs text-muted-foreground ml-5 mt-0.5">(existe uma versão para instalações no D: e no C:, use a correspondente)</p>
                            </li>
                            <li>Execute no cmd: <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">taskkill -f -im javaw*</code></li>
                            <li>Execute o <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">SetupSIGESFUpdateSilent.exe</code> <strong>como administrador</strong></li>
                            <li>Após a conclusão, o micro será <strong>reiniciado automaticamente</strong></li>
                          </ol>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-amber-700 border-b border-amber-200 pb-1">Caso o totem use impressora externa (CIS, Perto, etc)</h4>
                          <ol className="text-sm space-y-2 list-decimal list-inside">
                            <li>Execute no cmd: <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">taskkill -f -im javaw*</code></li>
                            <li>Vá em <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">c:\sigesf\aplicacao\sigesfEmissorDeSenhas\</code></li>
                            <li>Abra o <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">sigesfEmissorDeSenhas.jar</code> com o 7zip ("Abrir arquivo compactado")</li>
                            <li>Edite o arquivo <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">config.properties</code></li>
                            <li>Procure a linha começada por <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">tipoImpressao=</code> e comente colocando <strong>#</strong> no início</li>
                            <li>Adicione uma nova linha (cuidado para não colocar espaços a mais):
                              <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs block mt-1 break-all">tipoImpressao=br.com.correios.gerenciadorImpressao.impressora.ImpressoraTermicaEscPos</code>
                            </li>
                            <li>Salve e inicie os atalhos do <strong>Emissor</strong> e <strong>Painel</strong></li>
                            <li>Faça um <strong>teste de chamada</strong> com o usuário</li>
                          </ol>
                        </div>

                        <div className="p-3 bg-red-50 border border-red-300 rounded-lg space-y-2">
                          <p className="text-sm text-red-800 font-semibold">⚠️ Atenção</p>
                          <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                            <li>A execução do atualizador <strong>afeta a operação</strong>. Só pode ser executada com autorização do usuário e de preferência <strong>fora do expediente</strong> da unidade.</li>
                            <li>É recomendado fazer <strong>backup</strong> dos diretórios <code className="bg-red-100 px-1 py-0.5 rounded font-mono text-xs">\sigesf\media</code> e <code className="bg-red-100 px-1 py-0.5 rounded font-mono text-xs">\sigesf\database</code> antes da atualização, pois há chance destes arquivos serem perdidos ou desconfigurados.</li>
                            <li>Também é recomendado executar o script <code className="bg-red-100 px-1 py-0.5 rounded font-mono text-xs">ajusta_variaveis</code> para colocar no padrão e evitar falha de comunicação.</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </Card>
                  <Card className={`p-4 border-l-4 border-l-blue-500 ${baseConhecimentoOpen ? 'col-span-full' : 'hover:shadow-md cursor-pointer'}`}>
                    {!baseConhecimentoOpen ? (
                      <div onClick={() => setBaseConhecimentoOpen(true)}>
                        <h3 className="font-semibold">Base de Conhecimento</h3>
                        <p className="text-xs text-muted-foreground mt-1">POPs e Informações Operacionais</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">Base de Conhecimento</h3>
                          <Button variant="ghost" size="sm" onClick={() => setBaseConhecimentoOpen(false)}>✕</Button>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-blue-700 border-b border-blue-200 pb-1">Procedimentos Operacionais Padrão - POP</h4>
                          <p className="text-sm text-muted-foreground">Documentos padronizados com instruções detalhadas para execução de procedimentos técnicos. Consulte a Supervisão ou Ticket Manager para acesso aos POPs atualizados.</p>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-blue-700 border-b border-blue-200 pb-1">Informações Operacionais</h4>
                          <p className="text-sm text-muted-foreground">Dados e orientações operacionais relevantes para o dia a dia do suporte técnico. Consulte a Supervisão ou Ticket Manager para informações atualizadas.</p>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="manual">
            <Card className="p-4 sm:p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-violet-600" />
                  <h2 className="text-xl font-bold text-foreground">Manual do Sistema</h2>
                </div>

                {/* Guia de Uso do App */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">📱 Guia de Uso do Aplicativo</h3>
                  
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-left">
                      <span className="font-medium text-sm">⏱️ Timer de Ordens de Serviço</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-3 text-sm space-y-2 text-muted-foreground">
                      <p><strong>1.</strong> Digite o número da WO (apenas números) no campo e clique <strong>Adicionar</strong>.</p>
                      <p><strong>2.</strong> O timer inicia automaticamente ao adicionar a WO.</p>
                      <p><strong>3.</strong> Aos <strong>35 minutos</strong>, um aviso sonoro indica que faltam 5 minutos.</p>
                      <p><strong>4.</strong> Aos <strong>40 minutos</strong>, um alarme contínuo toca — insira uma nota no Remedy.</p>
                      <p><strong>5.</strong> Use <strong>Silenciar</strong> para parar o alarme e adicionar +40 min, ou <strong>Concluir</strong> para salvar no histórico.</p>
                      <p><strong>6.</strong> WOs concluídas ficam registradas no <strong>Histórico de WOs</strong> abaixo do timer.</p>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-left">
                      <span className="font-medium text-sm">📋 Procedimentos</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-3 text-sm space-y-2 text-muted-foreground">
                      <p><strong>Cadastrar:</strong> Clique em <strong>Novo Procedimento</strong>, preencha os campos obrigatórios e salve.</p>
                      <p><strong>Buscar:</strong> Use o campo de pesquisa para filtrar por título, descrição ou tags.</p>
                      <p><strong>Filtrar:</strong> Use o filtro de categoria para ver apenas procedimentos de uma área específica.</p>
                      <p><strong>Copiar solução:</strong> Clique no ícone de cópia para copiar a solução direto para o clipboard.</p>
                      <p><strong>Editar:</strong> Abra o procedimento e clique em <strong>Editar</strong> para modificar os campos.</p>
                      <p><strong>Backup:</strong> Use <strong>Gravar Histórico</strong> para exportar e <strong>Importar Backup</strong> para restaurar.</p>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-left">
                      <span className="font-medium text-sm">📡 Filas (Remota / Presencial)</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-3 text-sm space-y-2 text-muted-foreground">
                      <p><strong>Fila Remota:</strong> Cards com modelos de notas para atendimentos remotos (devolução, diagnóstico, improdutividade, etc.).</p>
                      <p><strong>Fila Presencial:</strong> Cards para atendimentos presenciais (conclusão, formatação, impressora, SIGESF, etc.).</p>
                      <p>Preencha os campos de cada card e clique no botão <strong>Copiar</strong> para copiar o texto formatado.</p>
                      <p>Os cards expandem/recolhem para manter a tela organizada.</p>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-left">
                      <span className="font-medium text-sm">✅ Checklists</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-3 text-sm space-y-2 text-muted-foreground">
                      <p>Guias técnicos interativos com procedimentos passo a passo.</p>
                      <p>Marque os checkboxes conforme completa cada etapa do procedimento.</p>
                      <p>Inclui guias para: Impressoras Milestone, Formatação Remota, Espanso, SIGESF e Preparação de Pendrive.</p>
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                {/* Documentação Técnica */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">🔧 Documentação Técnica</h3>
                  
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-left">
                      <span className="font-medium text-sm">🖥️ Acesso Remoto (VNC / Área de Trabalho Remota)</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-3 text-sm space-y-2 text-muted-foreground">
                      <p><strong>VNC:</strong> Utilizar o UltraVNC Viewer para acesso via PIB do equipamento.</p>
                      <p><strong>Área de Trabalho Remota (RDP):</strong> Usar IP do equipamento quando VNC não estiver disponível.</p>
                      <p><strong>Portas:</strong> VNC usa porta 5900, RDP usa porta 3389.</p>
                      <p><strong>Importante:</strong> Sempre solicitar autorização do usuário antes de acessar remotamente.</p>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-left">
                      <span className="font-medium text-sm">🔄 Formatação de Estações</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-3 text-sm space-y-2 text-muted-foreground">
                      <p><strong>Recovery Windows 8/8.1:</strong> Boot pelo pendrive → Restaurar imagem via ghost.</p>
                      <p><strong>Recovery Windows 9+:</strong> Boot pelo pendrive → Selecionar imagem compatível → Aguardar restore completo.</p>
                      <p><strong>Pós-formatação:</strong> Ingressar no domínio, instalar drivers, configurar impressoras, ativar agentes de monitoramento.</p>
                      <p><strong>Validação:</strong> Testar login do usuário, acesso aos sistemas, impressão e rede.</p>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-left">
                      <span className="font-medium text-sm">🖨️ Impressoras</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-3 text-sm space-y-2 text-muted-foreground">
                      <p><strong>Instalação:</strong> Adicionar via IP da impressora no painel de controle → Dispositivos e Impressoras.</p>
                      <p><strong>Driver:</strong> Usar driver PCL6 ou Universal conforme modelo.</p>
                      <p><strong>Problemas comuns:</strong> Fila travada (reiniciar spooler), offline (verificar IP/cabo), qualidade (trocar toner/cilindro).</p>
                      <p><strong>Milestone:</strong> Consultar checklist específico na aba Checklists para configuração completa.</p>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-left">
                      <span className="font-medium text-sm">🌐 Rede e Conectividade</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-3 text-sm space-y-2 text-muted-foreground">
                      <p><strong>Diagnóstico:</strong> ipconfig /all, ping, tracert, nslookup para identificar problemas.</p>
                      <p><strong>Cabo:</strong> Verificar conexão física, testar ponto de rede, usar testador de cabos.</p>
                      <p><strong>DNS:</strong> Verificar se está apontando para o servidor correto (primário e secundário).</p>
                      <p><strong>DHCP:</strong> Se IP não atribuído, verificar se cabo está no ponto correto e porta do switch ativa.</p>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-left">
                      <span className="font-medium text-sm">🔐 Segurança e Boas Práticas</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-3 text-sm space-y-2 text-muted-foreground">
                      <p><strong>Backup:</strong> Sempre faça backup dos dados do usuário antes de qualquer procedimento de formatação.</p>
                      <p><strong>Senhas:</strong> Nunca armazene senhas de usuários. Oriente o uso do portal de reset de senha.</p>
                      <p><strong>Registro:</strong> Documente todas as ações realizadas nas notas do Remedy.</p>
                      <p><strong>Autorização:</strong> Sempre confirme autorização do usuário antes de acessar remotamente ou realizar alterações.</p>
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                {/* Info */}
                <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-violet-600">💡 Dica:</strong> Este manual é atualizado junto com o app. Consulte sempre que tiver dúvidas sobre funcionalidades ou procedimentos técnicos.
                  </p>
                </div>

                {/* Botão Contribuir */}
                <div className="flex justify-center">
                  <Button
                    className="gap-2"
                    onClick={() => {
                      const subject = encodeURIComponent("Contribuição de Procedimento - Base de Procedimentos");
                      const body = encodeURIComponent(
`Olá Ticket Manager,

Gostaria de contribuir com um novo procedimento para o aplicativo.

TÍTULO DO PROCEDIMENTO:
[Descreva o título aqui]

CATEGORIA:
[Ex: CONFIGURAÇÃO, INSTALAÇÃO, REDE, etc.]

DESCRIÇÃO DO PROBLEMA:
[Descreva o problema que este procedimento resolve]

SOLUÇÃO / PASSO A PASSO:
[Descreva a solução detalhada]

TAGS:
[Palavras-chave separadas por vírgula]

---
Enviado via Base de Procedimentos`
                      );
                      window.open(`mailto:ticketmanager@empresa.com?subject=${subject}&body=${body}`, '_blank');
                      toast.success("Abrindo seu app de email...");
                    }}
                  >
                    <Mail className="w-4 h-4" />
                    Contribuir com Procedimento
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modal de detalhes do procedimento */}
      <Dialog 
        open={!!selectedProcedure} 
        onOpenChange={() => {
          setSelectedProcedure(null);
          setIsEditMode(false);
          setEditedProcedure(null);
        }}
      >
        <DialogContent className="max-w-3xl w-[95vw] max-h-[85vh] overflow-y-auto p-3 sm:p-6 [&_*]:break-words [&_*]:overflow-wrap-anywhere">
          {selectedProcedure && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl break-words">{selectedProcedure.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedProcedure.noteType === "diagnostico" && (
                    <Badge className="bg-amber-500 text-white">DIAGNÓSTICO</Badge>
                  )}
                  <Badge variant="secondary">{selectedProcedure.category}</Badge>
                  {selectedProcedure.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline">{tag}</Badge>
                  ))}
                </div>

                {/* Campos específicos de Diagnóstico */}
                {selectedProcedure.noteType === "diagnostico" && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                    <p className="text-sm text-amber-800 font-semibold">Informações de Diagnóstico</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-amber-700">Setor Direcionado:</span>{" "}
                        <span className="font-medium">{selectedProcedure.setorDirecionado || "Não informado"}</span>
                      </div>
                      <div>
                        <span className="text-amber-700">BC-Suporte:</span>{" "}
                        <span className="font-medium">
                          {selectedProcedure.possuiProcedimentoBC === "sim" ? "SIM" : selectedProcedure.possuiProcedimentoBC === "nao" ? "NÃO" : "Não informado"}
                          {selectedProcedure.possuiProcedimentoBC === "sim" && selectedProcedure.nomeArquivoBC && ` (${selectedProcedure.nomeArquivoBC})`}
                        </span>
                      </div>
                    </div>
                    {selectedProcedure.justificativa && (
                      <div>
                        <span className="text-amber-700 text-sm">Justificativa:</span>
                        <p className="text-sm mt-1">{selectedProcedure.justificativa}</p>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2 text-foreground">Descrição</h3>
                  <p className="text-muted-foreground">{selectedProcedure.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-foreground">Solução Aplicada</h3>
                  <div className="bg-muted p-3 sm:p-4 rounded-lg overflow-x-auto">
                    <p className="text-foreground whitespace-pre-wrap break-words text-sm sm:text-base" style={{ overflowWrap: 'anywhere' }}>{selectedProcedure.solution}</p>
                  </div>
                </div>

                {isEditMode && editedProcedure ? (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-usuario">Usuário Atendido (EM CONTATO COM)</Label>
                        <Input
                          id="edit-usuario"
                          value={editedProcedure.usuarioAtendido || ""}
                          onChange={(e) => setEditedProcedure({ ...editedProcedure, usuarioAtendido: e.target.value })}
                          placeholder="Nome do usuário atendido"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-pib">PIB do Equipamento</Label>
                        <Input
                          id="edit-pib"
                          value={editedProcedure.pibEquipamento || ""}
                          onChange={(e) => setEditedProcedure({ ...editedProcedure, pibEquipamento: e.target.value })}
                          placeholder="PIB do equipamento"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-tecnico">Técnico Responsável</Label>
                        <Input
                          id="edit-tecnico"
                          value="SUPORTE TÉCNICO HEPTA"
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-category">Categoria</Label>
                        <Select 
                          value={editedProcedure.category} 
                          onValueChange={(value) => setEditedProcedure({ ...editedProcedure, category: value })}
                        >
                          <SelectTrigger id="edit-category">
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-title">Título</Label>
                      <Input
                        id="edit-title"
                        value={editedProcedure.title}
                        onChange={(e) => setEditedProcedure({ ...editedProcedure, title: e.target.value })}
                        placeholder="Título do procedimento"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-description">Descrição</Label>
                      <Textarea
                        id="edit-description"
                        value={editedProcedure.description}
                        onChange={(e) => setEditedProcedure({ ...editedProcedure, description: e.target.value })}
                        placeholder="Descrição do procedimento"
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-solution">Solução Aplicada</Label>
                      <Textarea
                        id="edit-solution"
                        value={editedProcedure.solution}
                        onChange={(e) => setEditedProcedure({ ...editedProcedure, solution: e.target.value })}
                        placeholder="Solução aplicada"
                        rows={6}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-tags">Tags (separadas por vírgula)</Label>
                      <Input
                        id="edit-tags"
                        value={editedProcedure.tags.join(", ")}
                        onChange={(e) => setEditedProcedure({ 
                          ...editedProcedure, 
                          tags: e.target.value.split(",").map(tag => tag.trim()).filter(tag => tag)
                        })}
                        placeholder="Ex: VNC, Driver, Pinpad"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Data de Registro</p>
                      <p className="font-medium text-foreground">
                        {new Date(selectedProcedure.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Usuário Atendido (EM CONTATO COM)</p>
                        <p className="font-medium text-foreground">{selectedProcedure.usuarioAtendido || "Não informado"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">PIB do Equipamento</p>
                        <p className="font-medium text-foreground">{selectedProcedure.pibEquipamento || "Não informado"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Técnico Responsável</p>
                        <p className="font-medium text-foreground">{selectedProcedure.createdBy}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Data de Registro</p>
                        <p className="font-medium text-foreground">
                          {new Date(selectedProcedure.createdAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    
                    {/* Botão para copiar nota no formato oficial */}
                    <div className="pt-2 space-y-2">
                      {selectedProcedure.noteType === "diagnostico" ? (
                        <Button
                          variant="secondary"
                          className="w-full bg-amber-100 hover:bg-amber-200 text-amber-800"
                          onClick={() => {
                            const notaDiagnostico = `FAVOR DIRECIONAR AO SETOR ${selectedProcedure.setorDirecionado || '_____________'}

==================

PIB indicada pelo usuário: ${selectedProcedure.pibEquipamento || '_____________'}

==================

EM CONTATO COM O USUÁRIO ${selectedProcedure.usuarioAtendido || '_____________'}, FORAM REALIZADOS OS PROCEDIMENTOS DE:

${selectedProcedure.solution.split('\n').map(line => line.trim() ? `- ${line.trim()}` : '').filter(Boolean).join('\n')}

APÓS PROCEDIMENTOS FOI VERIFICADO QUE:

${selectedProcedure.justificativa || '< JUSTIFICATIVA >'}

Possui procedimento no BC-Suporte? ( ${selectedProcedure.possuiProcedimentoBC === 'sim' ? 'X' : ' '} ) SIM ( ${selectedProcedure.possuiProcedimentoBC === 'nao' ? 'X' : ' '} ) Não

${selectedProcedure.possuiProcedimentoBC === 'sim' && selectedProcedure.nomeArquivoBC ? `Se sim, Nome do arquivo: ${selectedProcedure.nomeArquivoBC}` : 'Se sim, Nome do arquivo:_____________________'}

ATENCIOSAMENTE,
SUPORTE TÉCNICO HEPTA`;
                            navigator.clipboard.writeText(notaDiagnostico);
                            toast.success('Nota de Diagnóstico copiada para a área de transferência!');
                          }}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar Nota de Diagnóstico
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          className="w-full"
                          onClick={() => {
                            const notaOficial = `EM CONTATO COM O USUÁRIO: ${selectedProcedure.usuarioAtendido || '_____________'},FOI REALIZADO ACESSO REMOTO AO MICRO E 
FORAM EXECUTADOS OS PROCEDIMENTOS DE: ${selectedProcedure.title}

================== 

PIB: ${selectedProcedure.pibEquipamento || '_____________'}

================== 

${selectedProcedure.solution}

APÓS PROCEDIMENTOS FORAM REALIZADOS TESTES DE: 

${selectedProcedure.description}

QUE CONFIRMARAM A SOLUÇÃO DO PROBLEMA.


ATENCIOSAMENTE, 
SUPORTE TÉCNICO HEPTA`;
                            navigator.clipboard.writeText(notaOficial);
                            toast.success('Nota oficial copiada para a área de transferência!');
                          }}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar Nota no Formato Oficial
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-between pt-4 border-t">
                  <div className="flex gap-3">
                    {isEditMode ? (
                      <>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setIsEditMode(false);
                            setEditedProcedure(null);
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button onClick={handleUpdateProcedure}>
                          Salvar Alterações
                        </Button>
                      </>
                    ) : (
                      <>
                        {selectedProcedure.noteType === "diagnostico" && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Orientações
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-96 p-4" align="end">
                              <div className="space-y-3">
                                <h4 className="font-semibold text-red-700 flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4" />
                                  Orientações para Diagnóstico
                                </h4>
                                <ul className="text-sm space-y-2 text-muted-foreground">
                                  <li>• Detalhe todos os procedimentos e testes realizados e anexe os prints comprobatórios</li>
                                  <li>• Informe os documentos do BC Suporte utilizados como referência</li>
                                  <li>• <strong>Mais detalhes &gt;&gt; Bloqueado:</strong> (Sim)</li>
                                  <li>• <strong>ANTES</strong> de Devolver o chamado, ajuste a categorização em "Categorização" &gt;&gt; "Categorização Operacional"</li>
                                  <li>• Em caso de dúvidas acione a <strong>Supervisão</strong> ou <strong>Ticket Manager</strong></li>
                                </ul>
                                <div className="mt-3 p-2 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded text-red-800 dark:text-red-300 text-center text-sm">
                                  <p className="font-bold">!! ATENÇÃO !!</p>
                                  <p>Em "Tipo de informação de trabalho",</p>
                                  <p className="font-bold">marque "DIAGNÓSTICO"</p>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                              <FileText className="w-4 h-4 mr-2" />
                              Devolução Remoto
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-96 p-4" align="end">
                            <div className="space-y-3">
                              <h4 className="font-semibold text-blue-700 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Nota de Devolução Remoto → Presencial
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Clique no botão abaixo para copiar o modelo de nota para direcionar à fila presencial.
                              </p>
                              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-xs space-y-1">
                                <p className="font-semibold text-amber-800 flex items-center gap-1">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  Lembrete antes de concluir:
                                </p>
                                <ul className="list-disc list-inside text-amber-700 space-y-0.5">
                                  <li>Detalhe todos os procedimentos e testes realizados e anexe os prints comprobatórios</li>
                                  <li>Informe os documentos do BC Suporte utilizados como referência</li>
                                  <li><strong>Mais detalhes &gt;&gt; Bloqueado:</strong> (Sim)</li>
                                  <li>Ao capturar o chamado, ajuste a categorização do chamado em <strong>"Categorização"</strong> &gt;&gt; <strong>"Categorização Operacional"</strong></li>
                                  <li>Em caso de dúvidas acione a Supervisão ou Ticket Manager</li>
                                </ul>
                                <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-800 text-center text-sm">
                                  <p className="font-bold">!! Atenção !!</p>
                                  <p>Em "Tipo de informação de trabalho",</p>
                                  <p className="font-bold">marque "Informações Gerais"</p>
                                </div>
                              </div>
                              <Button
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                onClick={() => {
                                  const notaDevolucao = `FAVOR DIRECIONAR AO SUPORTE PRESENCIAL

EM CONTATO COM O USUÁRIO ${selectedProcedure.usuarioAtendido || '_________________'}, FOI REALIZADO ACESSO REMOTO AO MICRO E
FORAM EXECUTADOS OS PROCEDIMENTOS DE:

==================

PIB: ${selectedProcedure.pibEquipamento || '_________________'}

==================

${selectedProcedure.solution.split('\n').map(line => line.trim() ? `- ${line.trim()}` : '').filter(Boolean).join('\n') || '- PROCEDIMENTO 1\n- PROCEDIMENTO 2\n- PROCEDIMENTO 3'}

APÓS PROCEDIMENTOS FOI IDENTIFICADO A NECESSIDADE DE ATENDIMENTO IN LOCO, SENDO ASSIM, FAVOR DIRECIONAR A FILA PRESENCIAL

ATENCIOSAMENTE,
SUPORTE TÉCNICO HEPTA`;
                                  navigator.clipboard.writeText(notaDevolucao);
                                  toast.success('Nota de Devolução Remoto copiada!');
                                }}
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                Copiar Nota
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                        <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Orientações
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-96 p-4" align="end">
                              <div className="space-y-3">
                                <h4 className="font-semibold text-amber-700 flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4" />
                                  Orientações
                                </h4>
                                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-xs space-y-1">
                                  <p className="font-semibold text-amber-800 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    Lembrete antes de concluir:
                                  </p>
                                  <ul className="list-disc list-inside text-amber-700 space-y-0.5">
                                    <li>Detalhe todos os procedimentos e testes realizados</li>
                                    <li>Informe os documentos do BC Suporte utilizados como referência</li>
                                    <li>Anexe quaisquer print/foto em nota normal, <strong>ANTES</strong> de salvar a conclusão, pois na nota de conclusão só é possível utilizar texto</li>
                                    <li>Em "Motivo do Status", use apenas <strong>"Utilização de procedimentos"</strong></li>
                                    <li>Ao capturar o chamado, ajuste a categorização do chamado em <strong>"Categorização"</strong> &gt;&gt; <strong>"Categorização Operacional"</strong></li>
                                    <li>Em caso de dúvidas acione a Supervisão ou Ticket Manager</li>
                                  </ul>
                                  <div className="mt-1 pt-1 border-t border-amber-300">
                                    <p className="text-amber-800 font-bold text-center">!! Atenção !!</p>
                                    <p className="text-amber-700">Notificar usuário com a solução realizada: <strong>SIM</strong></p>
                                    <p className="text-amber-700">Modo de execução: <strong>Remoto</strong></p>
                                  </div>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        <Button 
                          onClick={() => {
                            setIsEditMode(true);
                            setEditedProcedure(selectedProcedure);
                          }}
                        >
                          Editar Informações
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
