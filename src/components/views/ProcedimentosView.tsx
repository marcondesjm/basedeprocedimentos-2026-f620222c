import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Search, FileText, Calendar, Tag, Upload, Save, Shield, X, ChevronDown, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { Procedure, NoteType, CATEGORIES, FILA_REMOTA_CATEGORIES, FILA_PRESENCIAL_CATEGORIES } from "@/types/procedure";
import type { BackupInfo } from "@/hooks/useProcedures";

interface ProcedimentosViewProps {
  procedures: Procedure[];
  isLoading: boolean;
  showImportDialog: boolean;
  setShowImportDialog: (v: boolean) => void;
  createProcedure: (p: any) => boolean;
  exportBackup: () => void;
  importBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
  moveProcedure: (id: string, cat: string) => void;
  onSelectProcedure: (proc: Procedure) => void;
  touchProcedureDate: (id: string) => Procedure | null;
  lastBackupInfo?: BackupInfo | null;
}

export const ProcedimentosView = ({
  procedures,
  isLoading,
  showImportDialog,
  setShowImportDialog,
  createProcedure,
  exportBackup,
  importBackup,
  moveProcedure,
  onSelectProcedure,
  touchProcedureDate,
  lastBackupInfo,
}: ProcedimentosViewProps) => {

export const ProcedimentosView = ({
  procedures,
  isLoading,
  showImportDialog,
  setShowImportDialog,
  createProcedure,
  exportBackup,
  importBackup,
  moveProcedure,
  onSelectProcedure,
  touchProcedureDate,
}: ProcedimentosViewProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedProcedures, setExpandedProcedures] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [letterFilter, setLetterFilter] = useState<string | null>(null);
  const ITEMS_PER_PAGE = 10;
  const ALPHABET = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

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

  const baseFiltered = procedures.filter((proc) => {
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
  }).sort((a, b) => a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' }));

  const availableLetters = new Set(
    baseFiltered.map(p => (p.title.trim()[0] || "").toUpperCase()).filter(c => /[A-Z]/.test(c))
  );

  const filteredProcedures = letterFilter
    ? baseFiltered.filter(p => (p.title.trim()[0] || "").toUpperCase() === letterFilter)
    : baseFiltered;

  const totalPages = Math.max(1, Math.ceil(filteredProcedures.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProcedures = filteredProcedures.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  const handleCreateProcedure = (e: React.FormEvent) => {
    e.preventDefault();
    const success = createProcedure(newProcedure);
    if (success) {
      setIsDialogOpen(false);
      setNewProcedure({
        title: "", description: "", category: "", tags: "", solution: "", createdBy: "",
        pibEquipamento: "", usuarioAtendido: "", workOrder: "",
        noteType: "procedimento", setorDirecionado: "", justificativa: "",
        possuiProcedimentoBC: "", nomeArquivoBC: "",
      });
    }
  };

  return (
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
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <Button variant="ghost" size="sm" className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0" onClick={() => { setSearchQuery(""); setCurrentPage(1); }}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="default" size="lg" onClick={exportBackup} title="Gravar Histórico">
              <Save className="w-5 h-5 sm:mr-2" />
              <span className="hidden sm:inline">Gravar Histórico</span>
            </Button>
            <Button variant="default" size="lg" onClick={() => document.getElementById('import-file')?.click()} title="Importar Backup">
              <Upload className="w-5 h-5 sm:mr-2" />
              <span className="hidden sm:inline">Importar Backup</span>
            </Button>
            <input id="import-file" type="file" accept=".json" onChange={importBackup} className="hidden" />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button title="Novo Procedimento">
                  <Plus className="w-5 h-5 sm:mr-2" />
                  <span className="hidden sm:inline">Novo</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl w-[95vw] max-h-[85vh] overflow-y-auto p-4 sm:p-6" aria-describedby="new-procedure-description">
                <DialogHeader>
                  <DialogTitle>Novo Procedimento</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateProcedure} className="space-y-4 mt-4">
                  <p id="new-procedure-description" className="sr-only">Formulário para cadastro de novo procedimento técnico</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título *</Label>
                      <Input id="title" required value={newProcedure.title} onChange={(e) => setNewProcedure({ ...newProcedure, title: e.target.value })} placeholder="Título do procedimento" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria *</Label>
                      <Select value={newProcedure.category} onValueChange={(value) => setNewProcedure({ ...newProcedure, category: value })}>
                        <SelectTrigger id="category"><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="noteType">Tipo de Nota *</Label>
                    <Select value={newProcedure.noteType} onValueChange={(value: NoteType) => setNewProcedure({ ...newProcedure, noteType: value })}>
                      <SelectTrigger id="noteType"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="procedimento">Procedimento (Conclusão)</SelectItem>
                        <SelectItem value="diagnostico">Diagnóstico (Devolução)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newProcedure.noteType === "diagnostico" && (
                    <div className="space-y-2">
                      <Label htmlFor="setorDirecionado">Setor Direcionado</Label>
                      <Input id="setorDirecionado" value={newProcedure.setorDirecionado} onChange={(e) => setNewProcedure({ ...newProcedure, setorDirecionado: e.target.value })} placeholder="Setor para direcionar" />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição *</Label>
                    <Textarea id="description" required value={newProcedure.description} onChange={(e) => setNewProcedure({ ...newProcedure, description: e.target.value })} placeholder="Descreva o contexto do problema..." rows={3} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="solution">Solução Aplicada *</Label>
                    <Textarea id="solution" required value={newProcedure.solution} onChange={(e) => setNewProcedure({ ...newProcedure, solution: e.target.value })} placeholder="Descreva os passos realizados e a solução aplicada..." rows={5} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input id="tags" value={newProcedure.tags} onChange={(e) => setNewProcedure({ ...newProcedure, tags: e.target.value })} placeholder="Separe por vírgula: PDF, Software, Deploy" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pibEquipamento">PIB Equipamento</Label>
                    <Input id="pibEquipamento" value={newProcedure.pibEquipamento} onChange={(e) => setNewProcedure({ ...newProcedure, pibEquipamento: e.target.value })} placeholder="Digite o PIB do equipamento" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="usuarioAtendido">Usuário Atendido</Label>
                    <Input id="usuarioAtendido" value={newProcedure.usuarioAtendido} onChange={(e) => setNewProcedure({ ...newProcedure, usuarioAtendido: e.target.value })} placeholder="Digite o nome do usuário atendido" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workOrder">WO (Work Order)</Label>
                    <Input id="workOrder" value={newProcedure.workOrder} onChange={(e) => setNewProcedure({ ...newProcedure, workOrder: e.target.value })} placeholder="Digite o número da WO" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="createdBy">Técnico Responsável</Label>
                    <Input id="createdBy" value="SUPORTE TÉCNICO HEPTA" disabled className="bg-muted" />
                  </div>

                  {newProcedure.noteType === "diagnostico" && (
                    <div className="space-y-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <h4 className="font-semibold text-amber-800">Campos de Diagnóstico</h4>
                      <div className="space-y-2">
                        <Label htmlFor="justificativa" className="text-amber-800">Justificativa *</Label>
                        <Textarea id="justificativa" required={newProcedure.noteType === "diagnostico"} value={newProcedure.justificativa} onChange={(e) => setNewProcedure({ ...newProcedure, justificativa: e.target.value })} placeholder="Após procedimentos foi verificado que..." rows={3} className="border-amber-300" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-amber-800">Possui procedimento no BC-Suporte?</Label>
                        <Select value={newProcedure.possuiProcedimentoBC} onValueChange={(value: "sim" | "nao") => setNewProcedure({ ...newProcedure, possuiProcedimentoBC: value })}>
                          <SelectTrigger className="border-amber-300"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sim">SIM</SelectItem>
                            <SelectItem value="nao">NÃO</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {newProcedure.possuiProcedimentoBC === "sim" && (
                        <div className="space-y-2">
                          <Label htmlFor="nomeArquivoBC" className="text-amber-800">Nome do Arquivo BC</Label>
                          <Input id="nomeArquivoBC" value={newProcedure.nomeArquivoBC} onChange={(e) => setNewProcedure({ ...newProcedure, nomeArquivoBC: e.target.value })} placeholder="Nome do arquivo no BC-Suporte" className="border-amber-300" />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 justify-end pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                    <Button type="submit">Cadastrar</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Import Dialog */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent className="w-[95vw] max-w-lg p-4 sm:p-6" aria-describedby="import-dialog-description">
            <DialogHeader><DialogTitle>Importar Procedimentos</DialogTitle></DialogHeader>
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
                <Input id="import-file" type="file" accept=".json" onChange={importBackup} className="hidden" />
                <Button variant="outline" onClick={() => setShowImportDialog(false)}>Começar sem importar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando procedimentos...</p>
          </div>
        ) : (
          <>
            {/* Alphabet filter bar */}
            <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/30 rounded-lg border">
              <button
                type="button"
                onClick={() => { setLetterFilter(null); setCurrentPage(1); }}
                className={`px-2 h-7 text-xs font-medium rounded transition-colors ${
                  letterFilter === null
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                Todas
              </button>
              {ALPHABET.map((letter) => {
                const enabled = availableLetters.has(letter);
                const isActive = letterFilter === letter;
                return (
                  <button
                    key={letter}
                    type="button"
                    disabled={!enabled}
                    onClick={() => { setLetterFilter(letter); setCurrentPage(1); }}
                    className={`w-7 h-7 text-xs font-semibold rounded transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : enabled
                          ? 'text-foreground hover:bg-muted'
                          : 'text-muted-foreground/40 cursor-not-allowed'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>{filteredProcedures.length} procedimento(s) • Página {safeCurrentPage} de {totalPages}</span>
              <span>{letterFilter ? `Letra: ${letterFilter}` : 'Ordenado A–Z'}</span>
            </div>
            <div className="space-y-1">
              {paginatedProcedures.map((procedure) => {
                const isOpen = expandedProcedures.has(procedure.id);
                return (
                  <Card key={procedure.id} className="overflow-hidden">
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
                          <div className="flex items-center gap-1"><span>•</span>{procedure.createdBy}</div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Tag className="w-4 h-4" />
                            {procedure.tags.map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <Button size="sm" className="text-xs bg-primary text-primary-foreground hover:bg-primary/90 shadow-md font-semibold" onClick={(e) => {
                            e.stopPropagation();
                            const updated = touchProcedureDate(procedure.id);
                            if (updated) onSelectProcedure(updated);
                          }}>
                            <FileText className="w-3 h-3 mr-1" />Abrir
                          </Button>
                          <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                            <Select
                              value={procedure.filaRemotaCategory || procedure.filaPresencialCategory || "none"}
                              onValueChange={(value) => moveProcedure(procedure.id, value === "none" ? "" : value)}
                            >
                              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Mover para..." /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Sem fila</SelectItem>
                                <SelectItem disabled value="__header_remota__" className="font-bold text-xs text-muted-foreground">── Fila Remota ──</SelectItem>
                                {FILA_REMOTA_CATEGORIES.map((cat) => (
                                  <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                                ))}
                                <SelectItem disabled value="__header_presencial__" className="font-bold text-xs text-muted-foreground">── Fila Presencial ──</SelectItem>
                                {FILA_PRESENCIAL_CATEGORIES.map((cat) => (
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safeCurrentPage <= 1}
                  onClick={() => setCurrentPage(safeCurrentPage - 1)}
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === safeCurrentPage ? "default" : "outline"}
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safeCurrentPage >= totalPages}
                  onClick={() => setCurrentPage(safeCurrentPage + 1)}
                  className="gap-1"
                >
                  <span className="hidden sm:inline">Próxima</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}

        {!isLoading && filteredProcedures.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum procedimento encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};
