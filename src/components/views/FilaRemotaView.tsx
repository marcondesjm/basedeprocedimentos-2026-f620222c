import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Monitor, Plus, X, Copy, AlertCircle, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Procedure, FILA_REMOTA_CATEGORIES } from "@/types/procedure";

interface FilaRemotaViewProps {
  procedures: Procedure[];
  onSelectProcedure: (proc: Procedure) => void;
  touchProcedureDate: (id: string) => Procedure | null;
}

export const FilaRemotaView = ({ procedures, onSelectProcedure, touchProcedureDate }: FilaRemotaViewProps) => {
  const [expandedQueueProcs, setExpandedQueueProcs] = useState<Set<string>>(new Set());
  const [conclusaoNome, setConclusaoNome] = useState("");
  const [conclusaoPib, setConclusaoPib] = useState("");
  const [conclusaoPibMicro, setConclusaoPibMicro] = useState("");
  const [impressoraNome, setImpressoraNome] = useState("");
  const [impressoraPibImps, setImpressoraPibImps] = useState<string[]>([""]);
  const [impressoraIpImps, setImpressoraIpImps] = useState<string[]>([""]);
  const [impressoraPibMicros, setImpressoraPibMicros] = useState<string[]>([""]);
  const [compartNome, setCompartNome] = useState("");
  const [compartPib, setCompartPib] = useState("");
  const [compartPibMicro, setCompartPibMicro] = useState("");
  const [compartLink, setCompartLink] = useState("");
  const [compartAtalho, setCompartAtalho] = useState("");
  const [diagRemotoSetor, setDiagRemotoSetor] = useState("");
  const [diagRemotoNome, setDiagRemotoNome] = useState("");
  const [diagRemotoPib, setDiagRemotoPib] = useState("");
  const [diagRemotoPibMicro, setDiagRemotoPibMicro] = useState("");
  const [devolucaoNome, setDevolucaoNome] = useState("");
  const [devolucaoPib, setDevolucaoPib] = useState("");
  const [devolucaoPibMicro, setDevolucaoPibMicro] = useState("");
  const [devolucaoWo, setDevolucaoWo] = useState("");
  const [improdOutrasNome, setImprodOutrasNome] = useState("");
  const [improdOutrasJustificativa, setImprodOutrasJustificativa] = useState("");

  const toggleQueueProc = (key: string) => {
    const next = new Set(expandedQueueProcs);
    if (next.has(key)) next.delete(key); else next.add(key);
    setExpandedQueueProcs(next);
  };

  const renderAssignedProcedures = (catId: string) => {
    const assigned = procedures.filter(p => p.filaRemotaCategory === catId);
    if (assigned.length === 0) return <p className="text-xs text-muted-foreground mt-1">Nenhum procedimento atribuído</p>;
    const qKey = `remota-${catId}-list`;
    return (
      <div className="mt-2">
        <div className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-muted/50 transition-colors rounded text-sm" onClick={() => toggleQueueProc(qKey)}>
          <ChevronDown className={`w-3 h-3 text-muted-foreground shrink-0 transition-transform ${expandedQueueProcs.has(qKey) ? 'rotate-0' : '-rotate-90'}`} />
          <span className="text-xs font-medium text-foreground">Procedimentos</span>
        </div>
        {expandedQueueProcs.has(qKey) && (
          <div className="space-y-1 mt-1 pl-5">
            {assigned.map((proc) => (
              <div key={proc.id} className="px-2 py-1 rounded text-xs cursor-pointer hover:bg-muted/50 transition-colors border border-border/30"
                onClick={() => { const u = touchProcedureDate(proc.id); if (u) onSelectProcedure(u); }}>
                <p className="font-medium text-foreground">{proc.title}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const OrientacoesPopover = ({ children, color = "primary" }: { children: React.ReactNode; color?: string }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={`w-full border-${color === "primary" ? "primary/50" : color + "-300"} text-${color === "primary" ? "primary" : color + "-700"} hover:bg-${color === "primary" ? "primary/10" : color + "-50"}`}>
          <AlertCircle className="w-4 h-4 mr-2" />Orientações
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="center">{children}</PopoverContent>
    </Popover>
  );

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Monitor className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold">Fila Remota</h2>
        </div>
        <p className="text-muted-foreground">Procedimentos e orientações para atendimento remoto.</p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FILA_REMOTA_CATEGORIES.map((cat) => {
            const assignedProcedures = procedures.filter(p => p.filaRemotaCategory === cat.id);
            return (
              <Card key={cat.id} className={`p-4 border-l-4 ${cat.color}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{cat.label}</h3>
                  <Badge variant="secondary" className="text-xs">{assignedProcedures.length}</Badge>
                </div>
                {renderAssignedProcedures(cat.id)}

                {cat.id === "conclusao-remoto" && (
                  <div className="mt-3 space-y-2">
                    <Input placeholder="Nome do usuário" value={conclusaoNome} onChange={(e) => setConclusaoNome(e.target.value)} className="text-sm h-8" />
                    <Input placeholder="PIB do equipamento" value={conclusaoPib} onChange={(e) => setConclusaoPib(e.target.value)} className="text-sm h-8" />
                    <Input placeholder="PIB Micro" value={conclusaoPibMicro} onChange={(e) => setConclusaoPibMicro(e.target.value)} className="text-sm h-8" />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full border-primary/50 text-primary hover:bg-primary/10">
                          <AlertCircle className="w-4 h-4 mr-2" />Orientações
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-4" align="center">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-primary flex items-center gap-2"><AlertCircle className="w-4 h-4" />Orientações</h4>
                          <ul className="text-sm space-y-1.5 text-muted-foreground list-disc list-inside">
                            <li>Detalhe todos os procedimentos e testes realizados</li>
                            <li>Informe os documentos do BC Suporte utilizados como referência</li>
                            <li>Anexe quaisquer print/foto em nota normal, <strong>ANTES</strong> de salvar a conclusão</li>
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
                    <Button size="sm" className="w-full bg-primary hover:bg-primary/90" onClick={() => {
                      const nome = conclusaoNome || '_________________';
                      const pib = conclusaoPib || '';
                      const pibMicro = conclusaoPibMicro || '';
                      const nota = `EM CONTATO COM O USUÁRIO ${nome}, FOI REALIZADO ACESSO REMOTO AO MICRO E\nFORAM EXECUTADOS OS PROCEDIMENTOS DE:\n\n==================\n\nPIB do equipamento: ${pib}\n\nPIB Micro: ${pibMicro}\n\n==================\n\n- PROCEDIMENTO 1\n- PROCEDIMENTO 2\n- PROCEDIMENTO 3\n\nAPÓS PROCEDIMENTOS FORAM REALIZADOS TESTES DE:\n\n- TESTE 1\n- TESTE 2\n- TESTE 3\n\nQUE CONFIRMARAM A SOLUÇÃO DO PROBLEMA.\n\nATENCIOSAMENTE,\nSUPORTE TÉCNICO HEPTA`;
                      navigator.clipboard.writeText(nota);
                      toast.success('Nota de Conclusão - Remoto copiada!');
                    }}>
                      <Copy className="w-4 h-4 mr-2" />Copiar Nota
                    </Button>
                  </div>
                )}

                {cat.id === "conclusao-impressora" && (
                  <div className="mt-3 space-y-2">
                    <Input placeholder="Nome do usuário" value={impressoraNome} onChange={(e) => setImpressoraNome(e.target.value)} className="text-sm h-8" />
                    {impressoraPibImps.map((pibVal, idx) => (
                      <div key={idx} className="flex gap-1 items-center">
                        <Input placeholder={`PIB Impressora ${impressoraPibImps.length > 1 ? idx + 1 : ''}`} value={pibVal} onChange={(e) => { const u = [...impressoraPibImps]; u[idx] = e.target.value; setImpressoraPibImps(u); }} className="text-sm h-8" />
                        {idx === impressoraPibImps.length - 1 && <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => setImpressoraPibImps([...impressoraPibImps, ""])}><Plus className="w-4 h-4" /></Button>}
                        {impressoraPibImps.length > 1 && <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0 text-destructive hover:text-destructive" onClick={() => setImpressoraPibImps(impressoraPibImps.filter((_, i) => i !== idx))}><X className="w-3 h-3" /></Button>}
                      </div>
                    ))}
                    {impressoraIpImps.map((ipVal, idx) => (
                      <div key={idx} className="flex gap-1 items-center">
                        <Input placeholder={`IP Impressora ${impressoraIpImps.length > 1 ? idx + 1 : ''}`} value={ipVal} onChange={(e) => { const u = [...impressoraIpImps]; u[idx] = e.target.value; setImpressoraIpImps(u); }} className="text-sm h-8" />
                        {idx === impressoraIpImps.length - 1 && <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => setImpressoraIpImps([...impressoraIpImps, ""])}><Plus className="w-4 h-4" /></Button>}
                        {impressoraIpImps.length > 1 && <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0 text-destructive hover:text-destructive" onClick={() => setImpressoraIpImps(impressoraIpImps.filter((_, i) => i !== idx))}><X className="w-3 h-3" /></Button>}
                      </div>
                    ))}
                    {impressoraPibMicros.map((pibVal, idx) => (
                      <div key={idx} className="flex gap-1 items-center">
                        <Input placeholder={`PIB Micro ${impressoraPibMicros.length > 1 ? idx + 1 : ''}`} value={pibVal} onChange={(e) => { const u = [...impressoraPibMicros]; u[idx] = e.target.value; setImpressoraPibMicros(u); }} className="text-sm h-8" />
                        {idx === impressoraPibMicros.length - 1 && <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => setImpressoraPibMicros([...impressoraPibMicros, ""])}><Plus className="w-4 h-4" /></Button>}
                        {impressoraPibMicros.length > 1 && <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0 text-destructive hover:text-destructive" onClick={() => setImpressoraPibMicros(impressoraPibMicros.filter((_, i) => i !== idx))}><X className="w-3 h-3" /></Button>}
                      </div>
                    ))}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full border-primary/50 text-primary hover:bg-primary/10">
                          <AlertCircle className="w-4 h-4 mr-2" />Orientações
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-4" align="center">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-primary flex items-center gap-2"><AlertCircle className="w-4 h-4" />Orientações</h4>
                          <ul className="text-sm space-y-1.5 text-muted-foreground list-disc list-inside">
                            <li>Para o atendimento <strong>REMOTO</strong>, um único chamado abrange a instalação do equipamento NOVO e a configuração de todos os micros <strong>NO SETOR</strong></li>
                            <li>Abrir tarefa no OTRS para cada micro configurado</li>
                            <li>Detalhe todos os procedimentos e testes realizados</li>
                            <li>Anexe quaisquer print/foto em nota normal, <strong>ANTES</strong> de salvar a conclusão</li>
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
                    <Button size="sm" className="w-full bg-primary hover:bg-primary/90" onClick={() => {
                      const nome = impressoraNome || '________';
                      const pibImps = impressoraPibImps.filter(p => p.trim());
                      const pibImpText = pibImps.length > 0 ? pibImps.join(', ') : '';
                      const ipImps = impressoraIpImps.filter(p => p.trim());
                      const ipImpText = ipImps.length > 0 ? ipImps.join(', ') : '';
                      const pibMicros = impressoraPibMicros.filter(p => p.trim());
                      const pibMicroText = pibMicros.length > 0 ? pibMicros.join(', ') : '';
                      const nota = `EM CONTATO COM O USUÁRIO, ${nome} FOI VERIFICADO QUE:\n\n=========================\n\nA IMPRESSORA JÁ ESTÁ CONFIGURADA EM REDE? SIM ( x )    NÃO ( x )\n\nPIB Impressora: ${pibImpText}\n\nIP Impressora: ${ipImpText}\n\nPIB Micro: ${pibMicroText}\n\n========================\n\nFOI REALIZADO OS PROCEDIMENTOS DE:\n\n- PROCEDIMENTO_1\n- PROCEDIMENTO_2\n- PROCEDIMENTO_3\n\nAPÓS PROCEDIMENTOS, EM CONTATO COM O USUARIO ${nome} FORAM REALIZADOS TESTES DE CONEXÃO E IMPRESSÃO, QUE CONFIRMARAM A SOLUÇÃO DO PROBLEMA.\n\nATENCIOSAMENTE,\nSUPORTE TÉCNICO HEPTA`;
                      navigator.clipboard.writeText(nota);
                      toast.success('Nota de Conclusão - Impressora copiada!');
                    }}>
                      <Copy className="w-4 h-4 mr-2" />Copiar Nota
                    </Button>
                  </div>
                )}

                {cat.id === "conclusao-compartilhamento" && (
                  <div className="mt-3 space-y-2">
                    <Input placeholder="Nome do usuário" value={compartNome} onChange={(e) => setCompartNome(e.target.value)} className="text-sm h-8" />
                    <Input placeholder="PIB do equipamento" value={compartPib} onChange={(e) => setCompartPib(e.target.value)} className="text-sm h-8" />
                    <Input placeholder="PIB Micro" value={compartPibMicro} onChange={(e) => setCompartPibMicro(e.target.value)} className="text-sm h-8" />
                    <Input placeholder="Compartilhamento Link" value={compartLink} onChange={(e) => setCompartLink(e.target.value)} className="text-sm h-8" />
                    <Input placeholder="Atalho salvo no caminho" value={compartAtalho} onChange={(e) => setCompartAtalho(e.target.value)} className="text-sm h-8" />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full border-primary/50 text-primary hover:bg-primary/10">
                          <AlertCircle className="w-4 h-4 mr-2" />Orientações
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-4" align="center">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-primary flex items-center gap-2"><AlertCircle className="w-4 h-4" />Orientações</h4>
                          <ul className="text-sm space-y-1.5 text-muted-foreground list-disc list-inside">
                            <li>Detalhe todos os procedimentos e testes realizados</li>
                            <li>Inclua um print em nota normal, com o atalho criado no perfil do usuário</li>
                            <li>Informe os documentos do BC Suporte utilizados como referência</li>
                            <li>Anexe quaisquer print/foto em nota normal, <strong>ANTES</strong> de salvar a conclusão</li>
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
                    <Button size="sm" className="w-full bg-primary hover:bg-primary/90" onClick={() => {
                      const nome = compartNome || '_________________';
                      const pib = compartPib || '';
                      const pibMicro = compartPibMicro || '';
                      const link = compartLink || '';
                      const atalho = compartAtalho || '';
                      const nota = `EM CONTATO COM O USUÁRIO ${nome}, FOI REALIZADO ACESSO REMOTO AO MICRO E\nFORAM EXECUTADOS OS PROCEDIMENTOS DE:\n\n==================\n\nPIB do equipamento: ${pib}\n\nPIB Micro: ${pibMicro}\n\nCOMPARTILHAMENTO LINK: ${link}\n\nATALHO SALVO NO CAMINHO: ${atalho}\n\n==================\n\n- PROCEDIMENTO 1\n- PROCEDIMENTO 2\n- PROCEDIMENTO 3\n\nATENCIOSAMENTE,\nSUPORTE TÉCNICO HEPTA`;
                      navigator.clipboard.writeText(nota);
                      toast.success('Nota de Conclusão - Compartilhamento copiada!');
                    }}>
                      <Copy className="w-4 h-4 mr-2" />Copiar Nota
                    </Button>
                  </div>
                )}

                {cat.id === "diagnostico-remoto" && (
                  <div className="mt-3 space-y-2">
                    <Input placeholder="Setor direcionado" value={diagRemotoSetor} onChange={(e) => setDiagRemotoSetor(e.target.value)} className="text-sm h-8" />
                    <Input placeholder="Nome do usuário" value={diagRemotoNome} onChange={(e) => setDiagRemotoNome(e.target.value)} className="text-sm h-8" />
                    <Input placeholder="PIB do equipamento" value={diagRemotoPib} onChange={(e) => setDiagRemotoPib(e.target.value)} className="text-sm h-8" />
                    <Input placeholder="PIB Micro" value={diagRemotoPibMicro} onChange={(e) => setDiagRemotoPibMicro(e.target.value)} className="text-sm h-8" />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50">
                          <AlertCircle className="w-4 h-4 mr-2" />Orientações
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-4" align="center">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-amber-700 flex items-center gap-2"><AlertCircle className="w-4 h-4" />Orientações</h4>
                          <ul className="text-sm space-y-1.5 text-muted-foreground list-disc list-inside">
                            <li>Detalhe todos os procedimentos e testes realizados e anexe os prints comprobatórios</li>
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
                    <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-700" onClick={() => {
                      const setor = diagRemotoSetor || '__________';
                      const nome = diagRemotoNome || '_________________';
                      const pib = diagRemotoPib || '';
                      const pibMicro = diagRemotoPibMicro || '';
                      const nota = `FAVOR DIRECIONAR AO SETOR ${setor}\n\n==================\n\nPIB do equipamento: ${pib}\n\nPIB Micro: ${pibMicro}\n\n==================\n\nEM CONTATO COM O USUÁRIO ${nome}, FORAM REALIZADOS OS PROCEDIMENTOS DE:\n\n- PROCEDIMENTO 1\n- PROCEDIMENTO 2\n- PROCEDIMENTO 3\n\nAPÓS PROCEDIMENTOS FOI VERIFICADO QUE:\n\n< JUSTIFICATIVA >\n\nPossui procedimento no BC-Suporte? ( X ) SIM ( X ) Não\nSe sim, Nome do arquivo:_____________________\n\nATENCIOSAMENTE,\nSUPORTE TÉCNICO HEPTA`;
                      navigator.clipboard.writeText(nota);
                      toast.success('Nota de Diagnóstico Remoto copiada!');
                    }}>
                      <Copy className="w-4 h-4 mr-2" />Copiar Nota
                    </Button>
                  </div>
                )}

                {cat.id === "devolucao-remoto-presencial" && (
                  <div className="mt-3 space-y-2">
                    <Input placeholder="Nome do usuário" value={devolucaoNome} onChange={(e) => setDevolucaoNome(e.target.value)} className="text-sm h-8" />
                    <Input placeholder="PIB do equipamento" value={devolucaoPib} onChange={(e) => setDevolucaoPib(e.target.value)} className="text-sm h-8" />
                    <Input placeholder="PIB Micro" value={devolucaoPibMicro} onChange={(e) => setDevolucaoPibMicro(e.target.value)} className="text-sm h-8" />
                    <Input placeholder="Nº da WO" value={devolucaoWo} onChange={(e) => setDevolucaoWo(e.target.value)} className="text-sm h-8" />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50">
                          <AlertCircle className="w-4 h-4 mr-2" />Orientações
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-4" align="center">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-blue-700 flex items-center gap-2"><AlertCircle className="w-4 h-4" />Orientações</h4>
                          <ul className="text-sm space-y-1.5 text-muted-foreground list-disc list-inside">
                            <li>Detalhe todos os procedimentos e testes realizados e anexe os prints comprobatórios</li>
                            <li>Informe os documentos do BC Suporte utilizados como referência</li>
                            <li><strong>Mais detalhes &gt;&gt; Bloqueado:</strong> (Sim)</li>
                            <li>Ao capturar o chamado, ajuste a categorização em <strong>"Categorização"</strong> &gt;&gt; <strong>"Categorização Operacional"</strong></li>
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
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => {
                      const nome = devolucaoNome || '_________________';
                      const pib = devolucaoPib || '';
                      const pibMicro = devolucaoPibMicro || '';
                      const wo = devolucaoWo ? `WO: ${devolucaoWo}\n\n` : '';
                      const nota = `${wo}FAVOR DIRECIONAR AO SUPORTE PRESENCIAL\n\nEM CONTATO COM O USUÁRIO ${nome}, FOI REALIZADO ACESSO REMOTO AO MICRO E\nFORAM EXECUTADOS OS PROCEDIMENTOS DE:\n\n==================\n\nPIB do equipamento: ${pib}\n\nPIB Micro: ${pibMicro}\n\n==================\n\n- PROCEDIMENTO 1\n- PROCEDIMENTO 2\n- PROCEDIMENTO 3\n\nAPÓS PROCEDIMENTOS FOI IDENTIFICADO A NECESSIDADE DE ATENDIMENTO IN LOCO, SENDO ASSIM, FAVOR DIRECIONAR A FILA PRESENCIAL\n\nATENCIOSAMENTE,\nSUPORTE TÉCNICO HEPTA`;
                      navigator.clipboard.writeText(nota);
                      toast.success('Nota de Devolução Remoto copiada!');
                    }}>
                      <Copy className="w-4 h-4 mr-2" />Copiar Nota
                    </Button>
                  </div>
                )}

                {cat.id === "improdutivo-remoto" && (
                  <div className="mt-3 space-y-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full border-red-300 text-red-700 hover:bg-red-50">
                          <AlertCircle className="w-4 h-4 mr-2" />Orientações
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-96 p-4" align="start">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-red-700 flex items-center gap-2"><AlertCircle className="w-4 h-4" />Orientações</h4>
                          <ul className="text-sm space-y-1.5 text-muted-foreground list-disc list-inside">
                            <li>Realize a tentativa de contato e tentativa de atendimento remoto previamente</li>
                            <li>O envio do e-mail da tentativa de contato é <strong>obrigatório</strong></li>
                            <li>Utilizar o modelo de e-mail específico do PO – Improdutivo Remoto</li>
                            <li><strong>Atenção !</strong> A conclusão sem o envio prévio dos e-mails gera bloqueio</li>
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
                    <Button size="sm" className="w-full bg-red-600 hover:bg-red-700" onClick={() => {
                      const nota = `IMPRODUTIVO\n\nEste chamado necessita de realização de contato direto com o usuário para autorização de procedimentos.\n\nForam realizadas 3 tentativas de contato sem sucesso no intervalo de 40 minutos a 1 hora entre elas.\n\nEste chamado será fechado como improdutivo, e sua reabertura será considerada indevida.\n\nCaso ainda necessite do suporte técnico, solicitamos que registre um novo chamado.`;
                      navigator.clipboard.writeText(nota);
                      toast.success('Nota de Improdutivo copiada!');
                    }}>
                      <Copy className="w-4 h-4 mr-2" />Copiar Nota
                    </Button>
                  </div>
                )}

                {cat.id === "improdutivo-outras" && (
                  <div className="mt-3 space-y-3">
                    <Input placeholder="Nome do usuário" value={improdOutrasNome} onChange={(e) => setImprodOutrasNome(e.target.value)} className="text-sm h-8" />
                    <Input placeholder="Justificativa" value={improdOutrasJustificativa} onChange={(e) => setImprodOutrasJustificativa(e.target.value)} className="text-sm h-8" />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full border-red-300 text-red-700 hover:bg-red-50">
                          <AlertCircle className="w-4 h-4 mr-2" />Orientações
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-96 p-4" align="start">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-red-700 flex items-center gap-2"><AlertCircle className="w-4 h-4" />Orientações</h4>
                          <ul className="text-sm space-y-1.5 text-muted-foreground list-disc list-inside">
                            <li>Na Justificativa informe o motivo pelo qual o atendimento não pode ser realizado</li>
                            <li>Utilize apenas nos seguintes casos:
                              <ul className="list-disc list-inside ml-4 mt-1">
                                <li>Recusa do atendimento pelo usuário</li>
                                <li>Retorno em outro dia</li>
                                <li>Indisponibilidade da unidade</li>
                              </ul>
                            </li>
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
                    <Button size="sm" className="w-full bg-red-600 hover:bg-red-700" onClick={() => {
                      const nome = improdOutrasNome || '___________';
                      const justificativa = improdOutrasJustificativa || '<< JUSTIFICATIVA >>';
                      const nota = `IMPRODUTIVO\n\nConforme verificado com Usuário ${nome}, Não foi possível realizar o atendimento devido:\n\n${justificativa}\n\nFoi indicado outro colaborador para acompanhar o atendimento? SIM ( x )  NÃO ( x ) (Não se aplica)\n\nDesta forma, este chamado será fechado como improdutivo, e sua reabertura será considerada indevida.\n\nCaso ainda necessite do suporte técnico, solicitamos que registre um novo chamado.`;
                      navigator.clipboard.writeText(nota);
                      toast.success('Nota de Improdutivo - Outras Situações copiada!');
                    }}>
                      <Copy className="w-4 h-4 mr-2" />Copiar Nota
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
