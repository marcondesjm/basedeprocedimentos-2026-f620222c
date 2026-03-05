import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Users, Plus, X, Copy, AlertCircle, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Procedure, FILA_PRESENCIAL_CATEGORIES } from "@/types/procedure";

interface FilaPresencialViewProps {
  procedures: Procedure[];
  onSelectProcedure: (proc: Procedure) => void;
  touchProcedureDate: (id: string) => Procedure | null;
}

export const FilaPresencialView = ({ procedures, onSelectProcedure, touchProcedureDate }: FilaPresencialViewProps) => {
  const [expandedQueueProcs, setExpandedQueueProcs] = useState<Set<string>>(new Set());
  const [presencialNome, setPresencialNome] = useState("");
  const [presencialPib, setPresencialPib] = useState("");
  const [presencialIp, setPresencialIp] = useState("");
  const [presencialData, setPresencialData] = useState("");
  const [presencialPibMicro, setPresencialPibMicro] = useState("");
  const [formatNome, setFormatNome] = useState("");
  const [formatPib, setFormatPib] = useState("");
  const [formatIp, setFormatIp] = useState("");
  const [formatData, setFormatData] = useState("");
  const [formatPibMicro, setFormatPibMicro] = useState("");
  const [impPresNome, setImpPresNome] = useState("");
  const [impPresPibImps, setImpPresPibImps] = useState<string[]>([""]);
  const [impPresIpImps, setImpPresIpImps] = useState<string[]>([""]);
  const [impPresPibMicros, setImpPresPibMicros] = useState<string[]>([""]);
  const [impPresData, setImpPresData] = useState("");
  const [impPresSetor, setImpPresSetor] = useState("");
  const [diagGenNome, setDiagGenNome] = useState("");
  const [diagGenPib, setDiagGenPib] = useState("");
  const [diagGenSetor, setDiagGenSetor] = useState("");
  const [diagGenPibMicro, setDiagGenPibMicro] = useState("");
  const [sigesfDirecionar, setSigesfDirecionar] = useState("");
  const [sigesfData, setSigesfData] = useState("");
  const [sigesfNome, setSigesfNome] = useState("");
  const [sigesfPib, setSigesfPib] = useState("");
  const [sigesfIp, setSigesfIp] = useState("");
  const [sigesfModelo, setSigesfModelo] = useState("");
  const [sigesfPibMicro, setSigesfPibMicro] = useState("");
  const [improdOutrasPNome, setImprodOutrasPNome] = useState("");
  const [improdOutrasPJustificativa, setImprodOutrasPJustificativa] = useState("");
  const [devPresPib, setDevPresPib] = useState("");
  const [devPresIp, setDevPresIp] = useState("");
  const [devPresPibMicro, setDevPresPibMicro] = useState("");

  const toggleQueueProc = (key: string) => {
    const next = new Set(expandedQueueProcs);
    if (next.has(key)) next.delete(key); else next.add(key);
    setExpandedQueueProcs(next);
  };

  const renderAssignedProcedures = (catId: string) => {
    const assigned = procedures.filter(p => p.filaPresencialCategory === catId);
    if (assigned.length === 0) return <p className="text-xs text-muted-foreground mt-1">Nenhum procedimento atribuído</p>;
    const qKey = `presencial-${catId}-list`;
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

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold">Fila Presencial</h2>
        </div>
        <p className="text-muted-foreground">Procedimentos e orientações para atendimento presencial.</p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FILA_PRESENCIAL_CATEGORIES.map((cat) => {
            const assignedProcedures = procedures.filter(p => p.filaPresencialCategory === cat.id);
            return (
              <Card key={cat.id} className={`p-4 border-l-4 ${cat.color}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{cat.label}</h3>
                  <Badge variant="secondary" className="text-xs">{assignedProcedures.length}</Badge>
                </div>
                {renderAssignedProcedures(cat.id)}

                {cat.id === "conclusao-presencial" && (
                  <div className="mt-3 space-y-2">
                    <Input placeholder="Data da visita (ex: 27/02/2026)" value={presencialData} onChange={(e) => setPresencialData(e.target.value)} className="text-sm h-8" />
                    <Input placeholder="Nome do usuário" value={presencialNome} onChange={(e) => setPresencialNome(e.target.value)} className="text-sm h-8" />
                    <Input placeholder="PIB do equipamento" value={presencialPib} onChange={(e) => setPresencialPib(e.target.value)} className="text-sm h-8" />
                    <Input placeholder="IP do equipamento" value={presencialIp} onChange={(e) => setPresencialIp(e.target.value)} className="text-sm h-8" />
                    <Input placeholder="PIB Micro" value={presencialPibMicro} onChange={(e) => setPresencialPibMicro(e.target.value)} className="text-sm h-8" />
                    <Popover>
                      <PopoverTrigger asChild><Button variant="outline" size="sm" className="w-full border-primary/50 text-primary hover:bg-primary/10"><AlertCircle className="w-4 h-4 mr-2" />Orientações</Button></PopoverTrigger>
                      <PopoverContent className="w-80 p-4" align="center">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-primary flex items-center gap-2"><AlertCircle className="w-4 h-4" />Orientações</h4>
                          <ul className="text-sm space-y-1.5 text-muted-foreground list-disc list-inside">
                            <li>Detalhe todos os procedimentos e testes realizados</li>
                            <li>Informe os documentos do BC Suporte utilizados como referência</li>
                            <li>Anexe quaisquer print/foto em nota normal, <strong>ANTES</strong> de salvar a conclusão</li>
                            <li>Em <strong>"Motivo do Status"</strong>, use apenas <strong>"Utilização de procedimentos"</strong></li>
                            <li>Caso seja resolvido remotamente verifique o SLA do chamado</li>
                            <li>Devolva apenas se a solicitação tiver menos de 10h de SLA</li>
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
                    <Button size="sm" className="w-full bg-primary hover:bg-primary/90" onClick={() => {
                      const data = presencialData || '__/__/202X'; const nome = presencialNome || '________';
                      const pib = presencialPib || ''; const ip = presencialIp || ''; const pibMicro = presencialPibMicro || '';
                      const nota = `PROCEDIMENTOS REALIZADOS DURANTE VISITA TÉCNICA NO DIA ${data}\n\nUSUÁRIO: ${nome}\n\n===================\n\nPIB do equipamento: ${pib}\n\nPIB Micro: ${pibMicro}\n\nIP: ${ip}\n\n===================\n\nFORAM REALIZADOS OS PROCEDIMENTOS DE:\n\n- PROCEDIMENTO_1\n- PROCEDIMENTO_2\n- PROCEDIMENTO_3\n\nAPÓS PROCEDIMENTOS FORAM REALIZADOS TESTES, QUE CONFIRMARAM A SOLUÇÃO DO PROBLEMA\n\nATENCIOSAMENTE,\nSUPORTE TÉCNICO HEPTA`;
                      navigator.clipboard.writeText(nota); toast.success('Nota de Conclusão - Presencial copiada!');
                    }}><Copy className="w-4 h-4 mr-2" />Copiar Nota</Button>
                  </div>
                )}

                {cat.id === "conclusao-formatacao" && (
                  <div className="mt-3 space-y-2">
                    <Input placeholder="Data da visita (ex: 27/02/2026)" value={formatData} onChange={(e) => setFormatData(e.target.value)} className="text-sm h-8" />
                    <Input placeholder="Nome do usuário" value={formatNome} onChange={(e) => setFormatNome(e.target.value)} className="text-sm h-8" />
                    <Input placeholder="PIB do equipamento" value={formatPib} onChange={(e) => setFormatPib(e.target.value)} className="text-sm h-8" />
                    <Input placeholder="IP do equipamento" value={formatIp} onChange={(e) => setFormatIp(e.target.value)} className="text-sm h-8" />
                    <Input placeholder="PIB Micro" value={formatPibMicro} onChange={(e) => setFormatPibMicro(e.target.value)} className="text-sm h-8" />
                    <Popover>
                      <PopoverTrigger asChild><Button variant="outline" size="sm" className="w-full border-primary/50 text-primary hover:bg-primary/10"><AlertCircle className="w-4 h-4 mr-2" />Orientações</Button></PopoverTrigger>
                      <PopoverContent className="w-80 p-4" align="center">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-primary flex items-center gap-2"><AlertCircle className="w-4 h-4" />Orientações</h4>
                          <ul className="text-sm space-y-1.5 text-muted-foreground list-disc list-inside">
                            <li>Chamados de Formatação <strong>abrangem a configuração de periféricos</strong></li>
                            <li><strong>Atenção!</strong> Softwares proprietário devem ser tratados em chamado separado</li>
                            <li>Detalhe todos os procedimentos e testes realizados</li>
                            <li>Em <strong>"Motivo do Status"</strong>, use apenas <strong>"Utilização de procedimentos"</strong></li>
                            <li>Em caso de dúvidas acione a <strong>Supervisão</strong> ou <strong>Ticket Manager</strong></li>
                          </ul>
                          <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-800 text-center text-sm">
                            <p className="font-bold">!! Atenção !!</p>
                            <p>Modo de execução: <strong>presencial</strong></p>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Button size="sm" className="w-full bg-primary hover:bg-primary/90" onClick={() => {
                      const data = formatData || '__/__/202X'; const nome = formatNome || '________';
                      const pib = formatPib || ''; const ip = formatIp || ''; const pibMicro = formatPibMicro || '';
                      const nota = `PROCEDIMENTOS REALIZADOS DURANTE VISITA TÉCNICA NO DIA ${data}\n\nUSUÁRIO: ${nome}\n\n===================\n\nPIB do equipamento: ${pib}\n\nPIB Micro: ${pibMicro}\n\nIP: ${ip}\n\n===================\n\nDemais periféricos configurados\n\n===================\n\nPIB PINPAD: (Não se aplica)\n\nPIB IMPRESSORA CUPOM: (Não se aplica)\n\nPIB/IP IMPRESSORA REDE: (Não se aplica)\n\nPIB IMPRESSORA ETIQUETA: (Não se aplica)\n\n==================\n\nFORAM REALIZADOS OS PROCEDIMENTOS DE:\n\n- PROCEDIMENTO_1\n- PROCEDIMENTO_2\n- PROCEDIMENTO_3\n\nAPÓS PROCEDIMENTOS FORAM REALIZADOS TESTES, QUE CONFIRMARAM A SOLUÇÃO DO PROBLEMA\n\nATENCIOSAMENTE,\nSUPORTE TÉCNICO HEPTA`;
                      navigator.clipboard.writeText(nota); toast.success('Nota de Conclusão - Formatação copiada!');
                    }}><Copy className="w-4 h-4 mr-2" />Copiar Nota</Button>
                  </div>
                )}

                {cat.id === "conclusao-impressora-p" && (
                  <div className="mt-3 space-y-2">
                    <Input placeholder="Data da visita" value={impPresData} onChange={(e) => setImpPresData(e.target.value)} className="text-sm h-8" />
                    <Input placeholder="Nome do usuário" value={impPresNome} onChange={(e) => setImpPresNome(e.target.value)} className="text-sm h-8" />
                    {impPresPibImps.map((pibVal, idx) => (
                      <div key={idx} className="flex gap-1 items-center">
                        <Input placeholder={`PIB Impressora ${impPresPibImps.length > 1 ? idx + 1 : ''}`} value={pibVal} onChange={(e) => { const u = [...impPresPibImps]; u[idx] = e.target.value; setImpPresPibImps(u); }} className="text-sm h-8" />
                        {idx === impPresPibImps.length - 1 && <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => setImpPresPibImps([...impPresPibImps, ""])}><Plus className="w-4 h-4" /></Button>}
                        {impPresPibImps.length > 1 && <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0 text-destructive" onClick={() => setImpPresPibImps(impPresPibImps.filter((_, i) => i !== idx))}><X className="w-3 h-3" /></Button>}
                      </div>
                    ))}
                    {impPresIpImps.map((ipVal, idx) => (
                      <div key={idx} className="flex gap-1 items-center">
                        <Input placeholder={`IP Impressora ${impPresIpImps.length > 1 ? idx + 1 : ''}`} value={ipVal} onChange={(e) => { const u = [...impPresIpImps]; u[idx] = e.target.value; setImpPresIpImps(u); }} className="text-sm h-8" />
                        {idx === impPresIpImps.length - 1 && <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => setImpPresIpImps([...impPresIpImps, ""])}><Plus className="w-4 h-4" /></Button>}
                        {impPresIpImps.length > 1 && <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0 text-destructive" onClick={() => setImpPresIpImps(impPresIpImps.filter((_, i) => i !== idx))}><X className="w-3 h-3" /></Button>}
                      </div>
                    ))}
                    <Input placeholder="Setor" value={impPresSetor} onChange={(e) => setImpPresSetor(e.target.value)} className="text-sm h-8" />
                    {impPresPibMicros.map((pibVal, idx) => (
                      <div key={idx} className="flex gap-1 items-center">
                        <Input placeholder={`PIB Micro ${impPresPibMicros.length > 1 ? idx + 1 : ''}`} value={pibVal} onChange={(e) => { const u = [...impPresPibMicros]; u[idx] = e.target.value; setImpPresPibMicros(u); }} className="text-sm h-8" />
                        {idx === impPresPibMicros.length - 1 && <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => setImpPresPibMicros([...impPresPibMicros, ""])}><Plus className="w-4 h-4" /></Button>}
                        {impPresPibMicros.length > 1 && <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0 text-destructive" onClick={() => setImpPresPibMicros(impPresPibMicros.filter((_, i) => i !== idx))}><X className="w-3 h-3" /></Button>}
                      </div>
                    ))}
                    <Popover>
                      <PopoverTrigger asChild><Button variant="outline" size="sm" className="w-full border-primary/50 text-primary hover:bg-primary/10"><AlertCircle className="w-4 h-4 mr-2" />Orientações</Button></PopoverTrigger>
                      <PopoverContent className="w-80 p-4" align="center">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-primary flex items-center gap-2"><AlertCircle className="w-4 h-4" />Orientações</h4>
                          <ul className="text-sm space-y-1.5 text-muted-foreground list-disc list-inside">
                            <li>Para atendimento <strong>PRESENCIAL</strong>, um único chamado abrange instalação e configuração no setor</li>
                            <li>Abrir tarefa no OTRS para cada micro configurado</li>
                            <li>É <strong>OBRIGATÓRIO A REALIZAÇÃO DO TESTE DE IMPRESSÃO</strong></li>
                            <li>Em caso de dúvidas acione a <strong>Supervisão</strong> ou <strong>Ticket Manager</strong></li>
                          </ul>
                          <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-800 text-center text-sm">
                            <p className="font-bold">!! Atenção !!</p>
                            <p>Modo de execução: <strong>presencial</strong></p>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Button size="sm" className="w-full bg-primary hover:bg-primary/90" onClick={() => {
                      const data = impPresData || '__/__/202X'; const nome = impPresNome || '________';
                      const pibImps = impPresPibImps.filter(p => p.trim()); const ipImps = impPresIpImps.filter(p => p.trim());
                      const setor = impPresSetor || '________'; const pibMicros = impPresPibMicros.filter(p => p.trim());
                      const nota = `PROCEDIMENTOS REALIZADOS DURANTE VISITA TÉCNICA NO DIA ${data}\n\nUSUÁRIO: ${nome}\n\n=========================\n\nÉ A PRIMEIRA INSTALAÇÃO DESTA IMPRESSORA NO SETOR? SIM ( x )    NÃO ( x )\n\nPIB Impressora: ${pibImps.join(', ')}\n\nPIB Micro: ${pibMicros.join(', ')}\n\nIP Impressora: ${ipImps.join(', ')}\n\n========================\n\nFORAM REALIZADOS OS PROCEDIMENTOS DE:\n\n- PROCEDIMENTO_1\n- PROCEDIMENTO_2\n- PROCEDIMENTO_3\n\nAPÓS PROCEDIMENTOS FORAM REALIZADOS TESTES (CONEXÃO E IMPRESSÃO), QUE CONFIRMARAM A SOLUÇÃO DO PROBLEMA.\n\n================\n\nMicros indicados configurados no Setor ${setor}\n\n================\n\nPIB do equipamento:\nPIB do equipamento:\nPIB do equipamento:\nPIB do equipamento:\n\n================\n\nATENCIOSAMENTE,\nSUPORTE TÉCNICO HEPTA`;
                      navigator.clipboard.writeText(nota); toast.success('Nota de Conclusão - Impressora Presencial copiada!');
                    }}><Copy className="w-4 h-4 mr-2" />Copiar Nota</Button>
                  </div>
                )}

                {cat.id === "diagnostico-generico" && (
                  <div className="mt-3 space-y-2">
                    <Input placeholder="Setor direcionado" value={diagGenSetor} onChange={(e) => setDiagGenSetor(e.target.value)} className="text-sm h-8" />
                    <Input placeholder="Nome do usuário" value={diagGenNome} onChange={(e) => setDiagGenNome(e.target.value)} className="text-sm h-8" />
                    <Input placeholder="PIB do equipamento" value={diagGenPib} onChange={(e) => setDiagGenPib(e.target.value)} className="text-sm h-8" />
                    <Input placeholder="PIB Micro" value={diagGenPibMicro} onChange={(e) => setDiagGenPibMicro(e.target.value)} className="text-sm h-8" />
                    <Popover>
                      <PopoverTrigger asChild><Button variant="outline" size="sm" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"><AlertCircle className="w-4 h-4 mr-2" />Orientações</Button></PopoverTrigger>
                      <PopoverContent className="w-80 p-4" align="center">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-amber-700 flex items-center gap-2"><AlertCircle className="w-4 h-4" />Orientações</h4>
                          <ul className="text-sm space-y-1.5 text-muted-foreground list-disc list-inside">
                            <li>Detalhe procedimentos e testes, anexe prints</li>
                            <li><strong>Mais detalhes &gt;&gt; Bloqueado:</strong> (Sim)</li>
                            <li>Ajuste a categorização operacional</li>
                          </ul>
                          <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-800 text-center text-sm">
                            <p className="font-bold">marque "DIAGNÓSTICO"</p>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-700" onClick={() => {
                      const nota = `FAVOR DIRECIONAR AO SETOR ${diagGenSetor || '__________'}\n\n==================\n\nPIB do equipamento: ${diagGenPib || ''}\n\nPIB Micro: ${diagGenPibMicro || ''}\n\n==================\n\nEM CONTATO COM O USUÁRIO ${diagGenNome || '_________________'}, FORAM REALIZADOS OS PROCEDIMENTOS DE:\n\n- PROCEDIMENTO 1\n- PROCEDIMENTO 2\n- PROCEDIMENTO 3\n\nAPÓS PROCEDIMENTOS FOI VERIFICADO QUE:\n\n< JUSTIFICATIVA >\n\nPossui procedimento no BC-Suporte? ( X ) SIM ( X ) Não\nSe sim, Nome do arquivo:_____________________\n\nATENCIOSAMENTE,\nSUPORTE TÉCNICO HEPTA`;
                      navigator.clipboard.writeText(nota); toast.success('Nota de Diagnóstico - Genérico copiada!');
                    }}><Copy className="w-4 h-4 mr-2" />Copiar Nota</Button>
                  </div>
                )}

                {cat.id === "diagnostico-sigesf" && (
                  <div className="mt-3 space-y-2">
                    <Input placeholder="Direcionar a..." value={sigesfDirecionar} onChange={(e) => setSigesfDirecionar(e.target.value)} className="text-sm h-8" />
                    <Input placeholder="Data da visita" value={sigesfData} onChange={(e) => setSigesfData(e.target.value)} className="text-sm h-8" />
                    <Input placeholder="Nome do usuário" value={sigesfNome} onChange={(e) => setSigesfNome(e.target.value)} className="text-sm h-8" />
                    <Input placeholder="Modelo do equipamento" value={sigesfModelo} onChange={(e) => setSigesfModelo(e.target.value)} className="text-sm h-8" />
                    <Input placeholder="PIB do equipamento" value={sigesfPib} onChange={(e) => setSigesfPib(e.target.value)} className="text-sm h-8" />
                    <Input placeholder="IP do equipamento" value={sigesfIp} onChange={(e) => setSigesfIp(e.target.value)} className="text-sm h-8" />
                    <Input placeholder="PIB Micro" value={sigesfPibMicro} onChange={(e) => setSigesfPibMicro(e.target.value)} className="text-sm h-8" />
                    <Popover>
                      <PopoverTrigger asChild><Button variant="outline" size="sm" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"><AlertCircle className="w-4 h-4 mr-2" />Orientações</Button></PopoverTrigger>
                      <PopoverContent className="w-80 p-4" align="center">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-amber-700 flex items-center gap-2"><AlertCircle className="w-4 h-4" />Orientações</h4>
                          <ul className="text-sm space-y-1.5 text-muted-foreground list-disc list-inside">
                            <li>Detalhe procedimentos e testes, anexe prints</li>
                            <li><strong>Mais detalhes &gt;&gt; Bloqueado:</strong> (Sim)</li>
                            <li>Ajuste a categorização operacional</li>
                          </ul>
                          <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-800 text-center text-sm"><p className="font-bold">marque "DIAGNÓSTICO"</p></div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-700" onClick={() => {
                      const nota = `FAVOR DIRECIONAR A ${sigesfDirecionar || '________'}\n\nDIAGNÓSTICO PRESENCIAL\n\nPIB Micro: ${sigesfPibMicro || ''}\n\nPROCEDIMENTOS REALIZADOS DURANTE VISITA TÉCNICA NO DIA ${sigesfData || '__/__/202X'}\n\nUSUÁRIO: ${sigesfNome || '________'}\n\nFOI REALIZADO OS PROCEDIMENTOS DE:\n\nVerificação de Hardware\n\nCabos de energia Funcionais? SIM ( x )    NÃO ( x )\nO modelo é um Totem ou MiniPC? ( x )Totem ou ( x )MiniPC\nEstabilizador\\nobreak Funcionando? SIM ( x )    NÃO ( x )\nFonte Ligando? SIM ( x )    NÃO ( x )\nPlaca mãe funcionando? SIM ( x )    NÃO ( x )\nVentoinhas funcionais? SIM ( x )    NÃO ( x )\nPossui placa de vídeo? SIM ( x )    NÃO ( x )\nse não, Entrada HDMI funcional na placa mãe? SIM ( x )    NÃO ( x )\nImpressora externa? SIM ( x )    NÃO ( x )\nse sim, modelo da impressora externa: __________\nPainel (TV) liga? SIM ( x )    NÃO ( x )\nUsa adaptador HDMI ou cabo HDMI completo? Adaptador ( x ) Cabo Direto ( x )\nMonitor TouchScreen funcional? SIM ( x )    NÃO ( x )\nEntradas USB funcionais? SIM ( x )    NÃO ( x )\nTeste de integridade no cabo e ponto de rede normal? SIM ( x )    NÃO ( x )\n\nVerificação de software\n\nBoot normal? __________\nWindows 7 ou 10? __________\nAutologon normal?__________\nSigesf Atualizado? __________\nEmissor e Painel na configuração padrão?__________\nEmissor apresenta erro ou falha?__________\nPainel apresenta erro ou falha?__________\nImpressora genérica SIGESF configurada e funcionando?__________\nConfiguração do Emissor para impressora interna ou externa (SIGESF ou EscPos) realizado?__________\nImpressora Externa na porta COM2 ?__________\n\nScripts executados\n\nSigesf_Ajusta_Variaveis ?_________\nSigesfAjustes (somente caso autologon não funcione)_________\n\nAPÓS PROCEDIMENTOS FOI VERIFICADO QUE:\n\n< JUSTIFICATIVA >\n\n===================\nEquipamento indicado pelo Usuário\n===================\n\nMODELO: ${sigesfModelo || ''}\nPIB do equipamento: ${sigesfPib || ''}\nIP: ${sigesfIp || ''}\n\n===================\n\nATENCIOSAMENTE,\nSUPORTE TÉCNICO HEPTA`;
                      navigator.clipboard.writeText(nota); toast.success('Nota de Diagnóstico - Sigesf copiada!');
                    }}><Copy className="w-4 h-4 mr-2" />Copiar Nota</Button>
                  </div>
                )}

                {cat.id === "improdutivo-presencial" && (
                  <div className="mt-3 space-y-2">
                    <Popover>
                      <PopoverTrigger asChild><Button variant="outline" size="sm" className="w-full border-red-300 text-red-700 hover:bg-red-50"><AlertCircle className="w-4 h-4 mr-2" />Orientações</Button></PopoverTrigger>
                      <PopoverContent className="w-96 p-4" align="start">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-red-700 flex items-center gap-2"><AlertCircle className="w-4 h-4" />Orientações</h4>
                          <ul className="text-sm space-y-1.5 text-muted-foreground list-disc list-inside">
                            <li>Realize tentativa de contato e atendimento remoto previamente</li>
                            <li><strong>O envio do e-mail é obrigatório</strong></li>
                            <li>A conclusão sem e-mails gera bloqueio</li>
                            <li>Em caso de dúvidas acione a <strong>Supervisão</strong> ou <strong>Ticket Manager</strong></li>
                          </ul>
                          <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-800 text-center text-sm">
                            <p className="font-bold">!! Atenção !!</p><p>Modo de execução: <strong>presencial</strong></p>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Button size="sm" className="w-full bg-red-600 hover:bg-red-700" onClick={() => {
                      const nota = `IMPRODUTIVO\n\nEste chamado necessita de realização de contato telefônico com o usuário para confirmação dos dados do chamado.\n\nFoi realizada tentativa de contato telefônico, assim como foi encaminhado e-mail notificando que um técnico desta empresa se deslocou para atendimento da demanda presencial. Ao chegar na unidade, o usuário ou algum outro colaborador indicado não se encontrava presente ou não tinha disponibilidade para o atendimento.\n\nDesta forma, este chamado será fechado como improdutivo, e sua reabertura será considerada indevida.\n\nCaso ainda necessite do suporte técnico, solicitamos que registre um novo chamado.`;
                      navigator.clipboard.writeText(nota); toast.success('Nota de Improdutivo - Presencial copiada!');
                    }}><Copy className="w-4 h-4 mr-2" />Copiar Nota</Button>
                  </div>
                )}

                {cat.id === "improdutivo-outras-p" && (
                  <div className="mt-3 space-y-2">
                    <Input placeholder="Nome do usuário" value={improdOutrasPNome} onChange={(e) => setImprodOutrasPNome(e.target.value)} className="text-sm h-8" />
                    <Input placeholder="Justificativa" value={improdOutrasPJustificativa} onChange={(e) => setImprodOutrasPJustificativa(e.target.value)} className="text-sm h-8" />
                    <Popover>
                      <PopoverTrigger asChild><Button variant="outline" size="sm" className="w-full border-red-300 text-red-700 hover:bg-red-50"><AlertCircle className="w-4 h-4 mr-2" />Orientações</Button></PopoverTrigger>
                      <PopoverContent className="w-96 p-4" align="start">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-red-700 flex items-center gap-2"><AlertCircle className="w-4 h-4" />Orientações</h4>
                          <ul className="text-sm space-y-1.5 text-muted-foreground list-disc list-inside">
                            <li>Na Justificativa informe o motivo</li>
                            <li>Nesta situação <strong>não é necessário</strong> enviar e-mails</li>
                            <li>Em caso de dúvidas acione a <strong>Supervisão</strong></li>
                          </ul>
                          <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-800 text-center text-sm"><p className="font-bold">!! Atenção !!</p><p>Modo de execução: <strong>presencial</strong></p></div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Button size="sm" className="w-full bg-red-600 hover:bg-red-700" onClick={() => {
                      const nota = `IMPRODUTIVO\n\nConforme verificado com Usuário ${improdOutrasPNome || '___________'}, Não foi possível realizar o atendimento devido:\n\n${improdOutrasPJustificativa || '<< JUSTIFICATIVA >>'}\n\nFoi indicado outro colaborador para acompanhar o atendimento? SIM ( x )    NÃO ( x ) (Não se aplica)\n\nDesta forma, este chamado será fechado como improdutivo, e sua reabertura será considerada indevida.\n\nCaso ainda necessite do suporte técnico, solicitamos que registre um novo chamado.`;
                      navigator.clipboard.writeText(nota); toast.success('Nota de Improdutivo - Outras Situações (Presencial) copiada!');
                    }}><Copy className="w-4 h-4 mr-2" />Copiar Nota</Button>
                  </div>
                )}

                {cat.id === "devolucao-presencial" && (
                  <div className="mt-3 space-y-2">
                    <Input placeholder="PIB do equipamento" value={devPresPib} onChange={(e) => setDevPresPib(e.target.value)} className="text-sm h-8" />
                    <Input placeholder="IP do equipamento" value={devPresIp} onChange={(e) => setDevPresIp(e.target.value)} className="text-sm h-8" />
                    <Input placeholder="PIB Micro" value={devPresPibMicro} onChange={(e) => setDevPresPibMicro(e.target.value)} className="text-sm h-8" />
                    <Popover>
                      <PopoverTrigger asChild><Button variant="outline" size="sm" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"><AlertCircle className="w-4 h-4 mr-2" />Orientações</Button></PopoverTrigger>
                      <PopoverContent className="w-96 p-4" align="start">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-blue-700 flex items-center gap-2"><AlertCircle className="w-4 h-4" />Orientações</h4>
                          <ul className="text-sm space-y-1.5 text-muted-foreground list-disc list-inside">
                            <li>Caso resolvido remotamente, verifique o SLA</li>
                            <li>Devolva apenas se menos de 10h de SLA</li>
                            <li><strong>Mais detalhes &gt;&gt; Bloqueado:</strong> (Sim)</li>
                          </ul>
                          <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-800 text-center text-sm"><p className="font-bold">marque "Informações Gerais"</p></div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => {
                      const nota = `FAVOR DIRECIONAR A FILA REMOTA\n\nATENDIMENTO CONCLUIDO REMOTAMENTE\n\n===================\n\nPIB do equipamento: ${devPresPib || ''}\n\nPIB Micro: ${devPresPibMicro || ''}\n\nIP: ${devPresIp || ''}\n\n===================\n\nFORAM REALIZADOS OS PROCEDIMENTOS DE:\n\n- PROCEDIMENTO_1\n- PROCEDIMENTO_2\n- PROCEDIMENTO_3\n\nAPÓS PROCEDIMENTOS FORAM REALIZADOS TESTES DE:\n\n- TESTE 1\n- TESTE 2\n- TESTE 3\n\nQUE CONFIRMARAM A SOLUÇÃO DO PROBLEMA.\n\nATENCIOSAMENTE,\nSUPORTE TÉCNICO HEPTA`;
                      navigator.clipboard.writeText(nota); toast.success('Nota de Devolução - Presencial copiada!');
                    }}><Copy className="w-4 h-4 mr-2" />Copiar Nota</Button>
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
