import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckSquare } from "lucide-react";

export const ChecklistsView = () => {
  const [analiseProblemasOpen, setAnaliseProblemasOpen] = useState(false);
  const [analiseChecks, setAnaliseChecks] = useState<Record<string, boolean>>({});
  const [milestoneOpen, setMilestoneOpen] = useState(false);
  const [formatacaoRemotaOpen, setFormatacaoRemotaOpen] = useState(false);
  const [espansoOpen, setEspansoOpen] = useState(false);
  const [atualizacaoFerramentaOpen, setAtualizacaoFerramentaOpen] = useState(false);
  const [preparacaoFerramentaOpen, setPreparacaoFerramentaOpen] = useState(false);
  const [totemOpen, setTotemOpen] = useState(false);
  const [baseConhecimentoOpen, setBaseConhecimentoOpen] = useState(false);

  const ChecklistItem = ({ itemKey, label }: { itemKey: string; label: string }) => (
    <label className="flex items-start gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1.5 rounded">
      <Checkbox checked={analiseChecks[itemKey] || false} onCheckedChange={(checked) => setAnaliseChecks(prev => ({ ...prev, [itemKey]: !!checked }))} className="mt-0.5" />
      <span className={analiseChecks[itemKey] ? 'line-through text-muted-foreground' : ''}>{label}</span>
    </label>
  );

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <CheckSquare className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold">Checklists</h2>
        </div>
        <p className="text-muted-foreground">Checklists de verificação para procedimentos padronizados.</p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Análise de Problemas de Rede */}
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
                <p className="text-sm text-muted-foreground"><strong>Objetivo:</strong> Confirmar se o micro está no padrão e identificar o escopo do problema.</p>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-primary border-b pb-1">Camada Física e Transporte</h4>
                  <ChecklistItem itemKey="cabo_rede" label="O cabo de rede apresenta rompimento ou danos?" />
                  <ChecklistItem itemKey="continuidade_ponto" label="Teste a continuidade e sinal do ponto de rede e porta de rede" />
                  <ChecklistItem itemKey="leds_porta" label="Os LEDs da porta de rede estão acesos quando o cabo está conectado?" />
                  <ChecklistItem itemKey="ip_configurado" label="O IP está configurado corretamente?" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-primary border-b pb-1">Padrão de Configuração</h4>
                  <ChecklistItem itemKey="acesso_vnc" label="Acesso VNC (verificar se o micro está acessível remotamente)" />
                  <ChecklistItem itemKey="rede_dominio" label="Rede e domínio (verificar conflito de IP e domínio correiosnet.int)" />
                  <ChecklistItem itemKey="proxy_sistema" label="Proxy do sistema" />
                  <ChecklistItem itemKey="acesso_correios" label="Acesso a internet - sites Correios" />
                  <ChecklistItem itemKey="acesso_terceiros" label="Acesso a internet - sites terceiros" />
                  <ChecklistItem itemKey="acesso_intranet" label="Acesso a intranet - sites internos Correios" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-amber-600 border-b border-amber-200 pb-1">Avançado (caso o problema persista)</h4>
                  <ChecklistItem itemKey="limpeza_cache" label="Limpeza de cache dos navegadores" />
                  <ChecklistItem itemKey="teste_navegadores" label="Teste de acesso nos 3 navegadores (Edge, Chrome e Firefox)" />
                  <ChecklistItem itemKey="limpeza_temp" label="Limpeza de arquivos temporários do sistema" />
                  <ChecklistItem itemKey="reboot" label="Reboot do micro" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-blue-600 border-b border-blue-200 pb-1">Escopo</h4>
                  <ChecklistItem itemKey="outro_perfil" label="Funciona em outro perfil?" />
                  <ChecklistItem itemKey="outro_micro" label="O usuário acessa normalmente em outro micro?" />
                  <ChecklistItem itemKey="outros_usuarios" label="Outros usuários estão com o mesmo problema?" />
                  <ChecklistItem itemKey="site_especifico" label="É um site específico ou são vários?" />
                </div>
                <Button variant="outline" size="sm" onClick={() => setAnaliseChecks({})}>Limpar</Button>
              </div>
            )}
          </Card>

          {/* Milestone */}
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
                  <p className="text-sm text-red-700">Impressora Milestone não funciona no Suporte Fácil – apitando.</p>
                </div>
                <div className="space-y-3 text-sm">
                  {[
                    { title: "1. Preparação inicial", content: "Rode o script _basicoMicro para ajustar as rotinas de acesso remoto." },
                    { title: "2. Remover dispositivos ocultos", content: "Gerenciador de Dispositivos → Mostrar dispositivos ocultos. Remova os dispositivos apagados referentes à Milestone." },
                    { title: "3. Reiniciar o computador", content: "Após remover os dispositivos, reinicie o computador." },
                    { title: "4. Ajustar periféricos no Suporte Fácil", content: "Suporte Fácil → Atendimento → Ajustes dos Periféricos. Deixe a Milestone desligada." },
                    { title: "5. Reinstalar impressora", content: "Refaça a instalação usando o Suporte Fácil pela Instalação de Impressoras Térmicas." },
                  ].map((step) => (
                    <div key={step.title} className="p-3 bg-muted/50 rounded-lg">
                      <p className="font-semibold text-primary">{step.title}</p>
                      <p>{step.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Formatação Remota */}
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
                  <ul className="text-sm space-y-1.5 list-disc list-inside">
                    <li>Micro em rede e acessível remotamente?</li>
                    <li>Micro possui o recovery?</li>
                    <li>Recovery acessível remotamente?</li>
                    <li>Qual a versão do recovery?</li>
                  </ul>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                    <p className="font-semibold text-amber-800 text-sm">Se Recovery 8 ou anterior</p>
                    <ul className="text-sm space-y-1 list-disc list-inside text-amber-900">
                      <li>Só é possível formatar com <strong>deploy antigo</strong></li>
                      <li>Verifique pasta <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-xs">\operating systems</code></li>
                    </ul>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                    <p className="font-semibold text-blue-800 text-sm">Se Recovery 9 ou superior</p>
                    <ul className="text-sm space-y-1 list-disc list-inside text-blue-900">
                      <li>Deploy de <strong>qualquer SE</strong> atualizado</li>
                    </ul>
                  </div>
                </div>
                <div className="p-3 bg-red-50 border border-red-300 rounded-lg">
                  <p className="text-sm text-red-800 font-semibold">⚠️ Atenção</p>
                  <p className="text-sm text-red-700">Deploy incompatível pode causar falha na formatação.</p>
                </div>
              </div>
            )}
          </Card>

          {/* Espanso */}
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
                  <p><strong>Espanso</strong> é um expansor de texto gratuito e de código aberto.</p>
                  <p>Permite substituir abreviações por textos mais longos automaticamente.</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-amber-700 border-b border-amber-200 pb-1">Como Instalar e Configurar</h4>
                  <ol className="text-sm space-y-1.5 list-decimal list-inside">
                    <li>Acesse <a href="https://espanso.org/install/" target="_blank" rel="noopener noreferrer" className="text-primary underline">espanso.org/install</a> e baixe a versão <strong>portable</strong></li>
                    <li>Descompacte no disco <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">C:\</code></li>
                    <li>Execute <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">START_ESPANSO.bat</code></li>
                    <li>Marque para iniciar com o sistema</li>
                    <li>Cole os arquivos <strong>.yml</strong> em <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">C:\espanso-portable\.espanso\match</code></li>
                  </ol>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm font-semibold text-amber-800">📁 Arquivos de configuração</p>
                  <p className="text-sm text-amber-700">Obtenha os arquivos <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-xs">.yml</code> com a Supervisão ou Ticket Manager.</p>
                </div>
              </div>
            )}
          </Card>

          {/* Atualização da Ferramenta */}
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
                    <p className="ml-4">📁 \Operating Systems</p>
                    <p>📁 <strong>\ISOS</strong></p>
                  </div>
                </div>
                <div className="p-3 bg-red-50 border border-red-300 rounded-lg">
                  <p className="text-sm text-red-800 font-semibold">⚠️ Atenção</p>
                  <p className="text-sm text-red-700">Os diretórios <code className="font-mono text-xs">\ISOS_ECT</code>, <code className="font-mono text-xs">\ventoy</code> e <code className="font-mono text-xs">\TEMP</code> <strong>NÃO</strong> devem ser modificados.</p>
                </div>
              </div>
            )}
          </Card>

          {/* Preparação da Ferramenta */}
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
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                  <p className="text-blue-800">💡 Se tiver espaço, leve uma ISO do <strong>Hirens Boot</strong> em <code className="font-mono text-xs">\ISOS</code>.</p>
                </div>
              </div>
            )}
          </Card>

          {/* Totem SIGESF */}
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
                    <li>Copie <code className="font-mono text-xs">SetupSIGESFUpdateSilent.exe</code> de um deploy atualizado</li>
                    <li>Execute: <code className="font-mono text-xs">taskkill -f -im javaw*</code></li>
                    <li>Execute o atualizador <strong>como administrador</strong></li>
                    <li>Micro será <strong>reiniciado automaticamente</strong></li>
                  </ol>
                </div>
                <div className="p-3 bg-red-50 border border-red-300 rounded-lg space-y-2">
                  <p className="text-sm text-red-800 font-semibold">⚠️ Atenção</p>
                  <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                    <li>Afeta a operação – execute com autorização, fora do expediente</li>
                    <li>Faça backup de <code className="font-mono text-xs">\sigesf\media</code> e <code className="font-mono text-xs">\sigesf\database</code></li>
                  </ul>
                </div>
              </div>
            )}
          </Card>

          {/* Base de Conhecimento */}
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
                  <p className="text-sm text-muted-foreground">Consulte a Supervisão ou Ticket Manager para acesso aos POPs atualizados.</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-blue-700 border-b border-blue-200 pb-1">Informações Operacionais</h4>
                  <p className="text-sm text-muted-foreground">Consulte a Supervisão ou Ticket Manager para informações atualizadas.</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Card>
  );
};
