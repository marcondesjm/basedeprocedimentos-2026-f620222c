import { useState, useEffect } from "react";
import { toast } from "sonner";
import { logActivity } from "@/lib/activityLogger";
import { Procedure, NoteType, ALL_FILA_CATEGORIES } from "@/types/procedure";

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

export function useProcedures() {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showImportDialog, setShowImportDialog] = useState(false);

  const saveProcedures = (updatedProcedures: Procedure[]) => {
    try {
      localStorage.setItem('procedures', JSON.stringify(updatedProcedures));
    } catch (error) {
      console.error('Erro ao salvar procedimentos:', error);
      toast.error('Erro ao salvar procedimentos');
    }
  };

  const loadProcedures = () => {
    try {
      const savedProcedures = localStorage.getItem('procedures');
      if (savedProcedures) {
        const parsed = JSON.parse(savedProcedures);
        if (parsed.length > 0) {
          setProcedures(parsed);
        } else {
          setProcedures(defaultProcedures);
          saveProcedures(defaultProcedures);
        }
      } else {
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

  useEffect(() => {
    loadProcedures();
    const savedProcedures = localStorage.getItem('procedures');
    if (!savedProcedures || JSON.parse(savedProcedures).length === 0) {
      setShowImportDialog(true);
    }
  }, []);

  const createProcedure = (newProcedure: {
    title: string;
    description: string;
    category: string;
    tags: string;
    solution: string;
    pibEquipamento: string;
    usuarioAtendido: string;
    noteType: NoteType;
    setorDirecionado: string;
    justificativa: string;
    possuiProcedimentoBC: "sim" | "nao" | "";
    nomeArquivoBC: string;
  }) => {
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
    toast.success("Procedimento cadastrado com sucesso!");
    logActivity("create", "procedure", undefined, { title: newProcedure.title });
    return true;
  };

  const updateProcedure = (editedProcedure: Procedure) => {
    const updatedProcedures = procedures.map(proc =>
      proc.id === editedProcedure.id ? editedProcedure : proc
    );
    setProcedures(updatedProcedures);
    saveProcedures(updatedProcedures);
    toast.success("Procedimento atualizado com sucesso!");
    logActivity("update", "procedure", editedProcedure.id, { title: editedProcedure.title });
  };

  const moveProcedure = (procedureId: string, targetCategory: string) => {
    const allCat = ALL_FILA_CATEGORIES.find(c => c.id === targetCategory);
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

  const importBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const backup = JSON.parse(content);

        if (backup.procedures && Array.isArray(backup.procedures)) {
          const currentDate = new Date().toISOString();
          const importedProcedures = backup.procedures.map((proc: Procedure) => ({
            ...proc,
            createdAt: currentDate
          }));

          const existingIds = new Set(procedures.map(p => p.id));
          const newProcedures = importedProcedures.filter((p: Procedure) => !existingIds.has(p.id));

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

  const exportBackup = () => {
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

  const touchProcedureDate = (procId: string) => {
    const proc = procedures.find(p => p.id === procId);
    if (!proc) return null;
    const updated = { ...proc, createdAt: new Date().toISOString() };
    const updatedProcedures = procedures.map(p => p.id === procId ? updated : p);
    setProcedures(updatedProcedures);
    saveProcedures(updatedProcedures);
    return updated;
  };

  return {
    procedures,
    isLoading,
    showImportDialog,
    setShowImportDialog,
    createProcedure,
    updateProcedure,
    moveProcedure,
    importBackup,
    exportBackup,
    saveProcedures,
    touchProcedureDate,
  };
}
