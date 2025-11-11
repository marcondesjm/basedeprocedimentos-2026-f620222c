import { useState, useEffect } from "react";
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
import { Plus, Search, FileText, Calendar, Tag, Download, Upload, Save, Shield, X, Copy } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { WorkTimer } from "@/components/WorkTimer";

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
}

const Index = () => {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedProcedure, setEditedProcedure] = useState<Procedure | null>(null);
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
  });

  useEffect(() => {
    loadProcedures();
    
    // Mostrar dialog de importação se não houver dados salvos
    const savedProcedures = localStorage.getItem('procedures');
    if (!savedProcedures || JSON.parse(savedProcedures).length === 0) {
      setShowImportDialog(true);
    }

    // Aviso ao sair da aplicação
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (procedures.length > 0) {
        e.preventDefault();
        e.returnValue = 'Você tem procedimentos salvos. Lembre-se de fazer backup antes de sair!';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [procedures.length]);

  // Atualizar data e hora a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadProcedures = () => {
    try {
      const savedProcedures = localStorage.getItem('procedures');
      if (savedProcedures) {
        setProcedures(JSON.parse(savedProcedures));
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
        createdBy: newProcedure.createdBy,
        pibEquipamento: newProcedure.pibEquipamento,
        usuarioAtendido: newProcedure.usuarioAtendido,
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
      });
      toast.success("Procedimento cadastrado com sucesso!");
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

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-primary text-white shadow-elevated">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div>
              <h1 className="text-3xl font-bold">Gestão de procedimentos by Marcondes</h1>
              <p className="text-white/90 mt-1">Histórico de procedimentos e soluções realizadas</p>
            </div>
            <div className="text-white/95 font-mono text-lg">
              DATA: {format(currentDateTime, "dd/MM/yyyy, HH:mm:ss")}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Timer de Trabalho */}
        <div className="mb-6">
          <WorkTimer />
        </div>

        {/* Aviso LGPD */}
        <Alert className="mb-6 border-primary/20 bg-primary/5">
          <Shield className="h-5 w-5 text-primary" />
          <AlertDescription className="ml-2">
            <strong>Proteção de Dados (LGPD - Lei nº 13.709/2018):</strong> Todos os seus procedimentos são armazenados 
            exclusivamente no seu computador local (localStorage do navegador). Nenhuma informação é enviada para servidores 
            externos ou compartilhada com terceiros. Você tem total controle e propriedade dos seus dados. 
            Recomendamos fazer backups regulares usando o botão "Gravar Histórico".
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
              <Button variant="default" size="lg" onClick={handleExportBackup}>
                <Save className="w-5 h-5 mr-2" />
                Gravar Histórico
              </Button>
              <Button variant="default" size="lg" onClick={() => document.getElementById('import-file')?.click()}>
                <Upload className="w-5 h-5 mr-2" />
                Importar Backup
              </Button>
              <input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
              <Button variant="outline" onClick={handleDownloadDescriptions}>
                <Download className="w-4 h-4 mr-2" />
                Descrições
              </Button>
              <Button variant="outline" onClick={handleDownloadTXT}>
                <Download className="w-4 h-4 mr-2" />
                TXT Completo
              </Button>
              <Button variant="outline" onClick={handleDownloadCSV}>
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" onClick={handleDownloadJSON}>
                <Download className="w-4 h-4 mr-2" />
                JSON
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Procedimento
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Cadastrar Novo Procedimento</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateProcedure} className="space-y-4 mt-4">
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
                    <Label htmlFor="createdBy">Técnico Responsável *</Label>
                    <Input
                      id="createdBy"
                      required
                      value={newProcedure.createdBy}
                      onChange={(e) => setNewProcedure({ ...newProcedure, createdBy: e.target.value })}
                      placeholder="Nome do técnico"
                    />
                  </div>

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
            <DialogContent aria-describedby="import-dialog-description">
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
            <div className="grid grid-cols-1 gap-4">
              {filteredProcedures.map((procedure) => (
              <Card
                key={procedure.id}
                className="p-5 hover:shadow-elevated transition-all cursor-pointer"
                onClick={() => {
                  // Atualizar data para o momento da visualização
                  const updatedProcedure = {
                    ...procedure,
                    createdAt: new Date().toISOString()
                  };
                  
                  // Atualizar no estado local
                  const updatedProcedures = procedures.map(proc => 
                    proc.id === procedure.id ? updatedProcedure : proc
                  );
                  setProcedures(updatedProcedures);
                  saveProcedures(updatedProcedures);
                  
                  setSelectedProcedure(updatedProcedure);
                }}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-lg text-foreground">{procedure.title}</h3>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3">{procedure.description}</p>
                    </div>
                    <Badge variant="secondary">{procedure.category}</Badge>
                  </div>

                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm text-foreground">{procedure.solution}</p>
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
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
              ))}
            </div>
          )}

          {!isLoading && filteredProcedures.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum procedimento encontrado</p>
            </div>
          )}
        </div>
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedProcedure && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedProcedure.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{selectedProcedure.category}</Badge>
                  {selectedProcedure.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline">{tag}</Badge>
                  ))}
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-foreground">Descrição</h3>
                  <p className="text-muted-foreground">{selectedProcedure.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-foreground">Solução Aplicada</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-foreground whitespace-pre-wrap">{selectedProcedure.solution}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  {isEditMode && editedProcedure ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="edit-pib">PIB Equipamento</Label>
                        <Input
                          id="edit-pib"
                          value={editedProcedure.pibEquipamento || ""}
                          onChange={(e) => setEditedProcedure({ ...editedProcedure, pibEquipamento: e.target.value })}
                          placeholder="Digite o PIB do equipamento"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-usuario">Usuário Atendido</Label>
                        <Input
                          id="edit-usuario"
                          value={editedProcedure.usuarioAtendido || ""}
                          onChange={(e) => setEditedProcedure({ ...editedProcedure, usuarioAtendido: e.target.value })}
                          placeholder="Digite o nome do usuário atendido"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-tecnico">Técnico Responsável</Label>
                        <Input
                          id="edit-tecnico"
                          value={editedProcedure.createdBy}
                          onChange={(e) => setEditedProcedure({ ...editedProcedure, createdBy: e.target.value })}
                          placeholder="Nome do técnico"
                        />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Data de Registro</p>
                        <p className="font-medium text-foreground">
                          {new Date(selectedProcedure.createdAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">PIB Equipamento</p>
                        <p className="font-medium text-foreground">{selectedProcedure.pibEquipamento || "Não informado"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Usuário Atendido</p>
                        <p className="font-medium text-foreground">{selectedProcedure.usuarioAtendido || "Não informado"}</p>
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
                    </>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-between pt-4 border-t">
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const txtContent = `
═══════════════════════════════════════════════════════════════
PROCEDIMENTO
═══════════════════════════════════════════════════════════════

TÍTULO: ${selectedProcedure.title}

CATEGORIA: ${selectedProcedure.category}

DATA: ${new Date(selectedProcedure.createdAt).toLocaleString('pt-BR')}

TÉCNICO RESPONSÁVEL: ${selectedProcedure.createdBy}

PIB EQUIPAMENTO: ${selectedProcedure.pibEquipamento || 'Não informado'}

USUÁRIO ATENDIDO: ${selectedProcedure.usuarioAtendido || 'Não informado'}

TAGS: ${selectedProcedure.tags.join(', ')}

-------------------------------------------------------------------
DESCRIÇÃO:
-------------------------------------------------------------------
${selectedProcedure.description}

-------------------------------------------------------------------
SOLUÇÃO APLICADA:
-------------------------------------------------------------------
${selectedProcedure.solution}
`;
                        const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
                        const link = document.createElement('a');
                        const url = URL.createObjectURL(blob);
                        link.setAttribute('href', url);
                        link.setAttribute('download', `procedimento_${selectedProcedure.id}.txt`);
                        link.style.visibility = 'hidden';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        toast.success('Procedimento baixado em TXT!');
                      }}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      TXT
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const jsonData = JSON.stringify(selectedProcedure, null, 2);
                        const blob = new Blob([jsonData], { type: 'application/json' });
                        const link = document.createElement('a');
                        const url = URL.createObjectURL(blob);
                        link.setAttribute('href', url);
                        link.setAttribute('download', `procedimento_${selectedProcedure.id}.json`);
                        link.style.visibility = 'hidden';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        toast.success('Procedimento baixado em JSON!');
                      }}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      JSON
                    </Button>
                  </div>
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
                        <Button 
                          variant="outline"
                          onClick={() => {
                            const textToCopy = `PIB Equipamento: ${selectedProcedure.pibEquipamento || 'N/A'}
Usuário Atendido: ${selectedProcedure.usuarioAtendido || 'N/A'}
Técnico Responsável: ${selectedProcedure.createdBy}
Data de Registro: ${format(new Date(selectedProcedure.createdAt), 'dd/MM/yyyy, HH:mm:ss')}

Solução Aplicada:
${selectedProcedure.solution}`;
                            navigator.clipboard.writeText(textToCopy);
                            toast.success('Informações copiadas para a área de transferência!');
                          }}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar
                        </Button>
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
