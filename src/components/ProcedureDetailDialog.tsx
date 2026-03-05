import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FileText, Copy, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Procedure, CATEGORIES } from "@/types/procedure";

interface ProcedureDetailDialogProps {
  selectedProcedure: Procedure | null;
  onClose: () => void;
  onUpdate: (proc: Procedure) => void;
}

export const ProcedureDetailDialog = ({ selectedProcedure, onClose, onUpdate }: ProcedureDetailDialogProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedProcedure, setEditedProcedure] = useState<Procedure | null>(null);

  const handleClose = () => {
    setIsEditMode(false);
    setEditedProcedure(null);
    onClose();
  };

  const handleUpdateProcedure = () => {
    if (!editedProcedure) return;
    onUpdate(editedProcedure);
    setIsEditMode(false);
    setEditedProcedure(null);
  };

  return (
    <Dialog open={!!selectedProcedure} onOpenChange={handleClose}>
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

              {selectedProcedure.noteType === "diagnostico" && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                  <p className="text-sm text-amber-800 font-semibold">Informações de Diagnóstico</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div><span className="text-amber-700">Setor Direcionado:</span> <span className="font-medium">{selectedProcedure.setorDirecionado || "Não informado"}</span></div>
                    <div><span className="text-amber-700">BC-Suporte:</span> <span className="font-medium">
                      {selectedProcedure.possuiProcedimentoBC === "sim" ? "SIM" : selectedProcedure.possuiProcedimentoBC === "nao" ? "NÃO" : "Não informado"}
                      {selectedProcedure.possuiProcedimentoBC === "sim" && selectedProcedure.nomeArquivoBC && ` (${selectedProcedure.nomeArquivoBC})`}
                    </span></div>
                  </div>
                  {selectedProcedure.justificativa && (
                    <div><span className="text-amber-700 text-sm">Justificativa:</span><p className="text-sm mt-1">{selectedProcedure.justificativa}</p></div>
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
                      <Label htmlFor="edit-usuario">Usuário Atendido</Label>
                      <Input id="edit-usuario" value={editedProcedure.usuarioAtendido || ""} onChange={(e) => setEditedProcedure({ ...editedProcedure, usuarioAtendido: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-pib">PIB do Equipamento</Label>
                      <Input id="edit-pib" value={editedProcedure.pibEquipamento || ""} onChange={(e) => setEditedProcedure({ ...editedProcedure, pibEquipamento: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Técnico Responsável</Label>
                      <Input value="SUPORTE TÉCNICO HEPTA" disabled className="bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select value={editedProcedure.category} onValueChange={(value) => setEditedProcedure({ ...editedProcedure, category: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{CATEGORIES.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input value={editedProcedure.title} onChange={(e) => setEditedProcedure({ ...editedProcedure, title: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea value={editedProcedure.description} onChange={(e) => setEditedProcedure({ ...editedProcedure, description: e.target.value })} rows={4} />
                  </div>
                  <div className="space-y-2">
                    <Label>Solução Aplicada</Label>
                    <Textarea value={editedProcedure.solution} onChange={(e) => setEditedProcedure({ ...editedProcedure, solution: e.target.value })} rows={6} />
                  </div>
                  <div className="space-y-2">
                    <Label>Tags (separadas por vírgula)</Label>
                    <Input value={editedProcedure.tags.join(", ")} onChange={(e) => setEditedProcedure({ ...editedProcedure, tags: e.target.value.split(",").map(tag => tag.trim()).filter(tag => tag) })} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Registro</p>
                    <p className="font-medium text-foreground">{new Date(selectedProcedure.createdAt).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><p className="text-sm text-muted-foreground">Usuário Atendido</p><p className="font-medium text-foreground">{selectedProcedure.usuarioAtendido || "Não informado"}</p></div>
                    <div><p className="text-sm text-muted-foreground">PIB do Equipamento</p><p className="font-medium text-foreground">{selectedProcedure.pibEquipamento || "Não informado"}</p></div>
                    <div><p className="text-sm text-muted-foreground">Técnico Responsável</p><p className="font-medium text-foreground">{selectedProcedure.createdBy}</p></div>
                    <div><p className="text-sm text-muted-foreground">Data de Registro</p><p className="font-medium text-foreground">{new Date(selectedProcedure.createdAt).toLocaleString('pt-BR')}</p></div>
                  </div>

                  <div className="pt-2 space-y-2">
                    {selectedProcedure.noteType === "diagnostico" ? (
                      <Button variant="secondary" className="w-full bg-amber-100 hover:bg-amber-200 text-amber-800" onClick={() => {
                        const nota = `FAVOR DIRECIONAR AO SETOR ${selectedProcedure.setorDirecionado || '_____________'}\n\n==================\n\nPIB do equipamento: ${selectedProcedure.pibEquipamento || '_____________'}\n\n==================\n\nEM CONTATO COM O USUÁRIO ${selectedProcedure.usuarioAtendido || '_____________'}, FORAM REALIZADOS OS PROCEDIMENTOS DE:\n\n${selectedProcedure.solution.split('\n').map(line => line.trim() ? `- ${line.trim()}` : '').filter(Boolean).join('\n')}\n\nAPÓS PROCEDIMENTOS FOI VERIFICADO QUE:\n\n${selectedProcedure.justificativa || '< JUSTIFICATIVA >'}\n\nPossui procedimento no BC-Suporte? ( ${selectedProcedure.possuiProcedimentoBC === 'sim' ? 'X' : ' '} ) SIM ( ${selectedProcedure.possuiProcedimentoBC === 'nao' ? 'X' : ' '} ) Não\n\n${selectedProcedure.possuiProcedimentoBC === 'sim' && selectedProcedure.nomeArquivoBC ? `Se sim, Nome do arquivo: ${selectedProcedure.nomeArquivoBC}` : 'Se sim, Nome do arquivo:_____________________'}\n\nATENCIOSAMENTE,\nSUPORTE TÉCNICO HEPTA`;
                        navigator.clipboard.writeText(nota);
                        toast.success('Nota de Diagnóstico copiada!');
                      }}>
                        <Copy className="w-4 h-4 mr-2" />Copiar Nota de Diagnóstico
                      </Button>
                    ) : (
                      <Button variant="secondary" className="w-full" onClick={() => {
                        const nota = `EM CONTATO COM O USUÁRIO: ${selectedProcedure.usuarioAtendido || '_____________'},FOI REALIZADO ACESSO REMOTO AO MICRO E \nFORAM EXECUTADOS OS PROCEDIMENTOS DE: ${selectedProcedure.title}\n\n================== \n\nPIB do equipamento: ${selectedProcedure.pibEquipamento || '_____________'}\n\n================== \n\n${selectedProcedure.solution}\n\nAPÓS PROCEDIMENTOS FORAM REALIZADOS TESTES DE: \n\n${selectedProcedure.description}\n\nQUE CONFIRMARAM A SOLUÇÃO DO PROBLEMA.\n\n\nATENCIOSAMENTE, \nSUPORTE TÉCNICO HEPTA`;
                        navigator.clipboard.writeText(nota);
                        toast.success('Nota oficial copiada!');
                      }}>
                        <Copy className="w-4 h-4 mr-2" />Copiar Nota no Formato Oficial
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-4 border-t">
                <div className="flex flex-wrap gap-2">
                  {isEditMode ? (
                    <>
                      <Button variant="outline" onClick={() => { setIsEditMode(false); setEditedProcedure(null); }}>Cancelar</Button>
                      <Button onClick={handleUpdateProcedure}>Salvar Alterações</Button>
                    </>
                  ) : (
                    <>
                      {selectedProcedure.noteType === "diagnostico" && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                              <AlertCircle className="w-4 h-4 mr-2" />Orientações
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[90vw] max-w-96 p-3 sm:p-4" align="center" side="top">
                            <div className="space-y-3">
                              <h4 className="font-semibold text-red-700 flex items-center gap-2 text-sm"><AlertCircle className="w-4 h-4 shrink-0" />Orientações para Diagnóstico</h4>
                              <ul className="text-sm space-y-2 text-muted-foreground">
                                <li>• Detalhe procedimentos e testes, anexe prints</li>
                                <li>• <strong>Mais detalhes &gt;&gt; Bloqueado:</strong> (Sim)</li>
                                <li>• Ajuste a categorização operacional</li>
                              </ul>
                              <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-red-800 text-center text-sm">
                                <p className="font-bold">marque "DIAGNÓSTICO"</p>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                            <FileText className="w-4 h-4 mr-2" />Devolução Remoto
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[90vw] max-w-96 p-3 sm:p-4" align="center" side="top">
                          <div className="space-y-3">
                            <h4 className="font-semibold text-blue-700 flex items-center gap-2 text-sm"><FileText className="w-4 h-4 shrink-0" />Nota de Devolução Remoto → Presencial</h4>
                            <p className="text-sm text-muted-foreground">Clique no botão abaixo para copiar o modelo.</p>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => {
                              const nota = `FAVOR DIRECIONAR AO SUPORTE PRESENCIAL\n\nEM CONTATO COM O USUÁRIO ${selectedProcedure.usuarioAtendido || '_________________'}, FOI REALIZADO ACESSO REMOTO AO MICRO E\nFORAM EXECUTADOS OS PROCEDIMENTOS DE:\n\n==================\n\nPIB do equipamento: ${selectedProcedure.pibEquipamento || '_________________'}\n\n==================\n\n${selectedProcedure.solution.split('\n').map(line => line.trim() ? `- ${line.trim()}` : '').filter(Boolean).join('\n') || '- PROCEDIMENTO 1\n- PROCEDIMENTO 2\n- PROCEDIMENTO 3'}\n\nAPÓS PROCEDIMENTOS FOI IDENTIFICADO A NECESSIDADE DE ATENDIMENTO IN LOCO, SENDO ASSIM, FAVOR DIRECIONAR A FILA PRESENCIAL\n\nATENCIOSAMENTE,\nSUPORTE TÉCNICO HEPTA`;
                              navigator.clipboard.writeText(nota);
                              toast.success('Nota de Devolução Remoto copiada!');
                            }}>
                              <Copy className="w-4 h-4 mr-2" />Copiar Nota
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                            <AlertCircle className="w-4 h-4 mr-2" />Orientações
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[90vw] max-w-96 p-3 sm:p-4" align="center" side="top">
                          <div className="space-y-3">
                            <h4 className="font-semibold text-amber-700 flex items-center gap-2 text-sm"><AlertCircle className="w-4 h-4 shrink-0" />Orientações</h4>
                            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-xs space-y-1">
                              <ul className="list-disc list-inside text-amber-700 space-y-0.5">
                                <li>Detalhe procedimentos e testes realizados</li>
                                <li>Anexe prints <strong>ANTES</strong> da conclusão</li>
                                <li>Em "Motivo do Status": <strong>"Utilização de procedimentos"</strong></li>
                                <li>Ajuste a categorização operacional</li>
                              </ul>
                              <div className="mt-1 pt-1 border-t border-amber-300">
                                <p className="text-amber-800 font-bold text-center">!! Atenção !!</p>
                                <p className="text-amber-700">Notificar usuário: <strong>SIM</strong></p>
                                <p className="text-amber-700">Modo: <strong>Remoto</strong></p>
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Button onClick={() => { setIsEditMode(true); setEditedProcedure(selectedProcedure); }}>Editar Informações</Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
