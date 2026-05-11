import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { BookOpen, ChevronDown, Mail } from "lucide-react";
import { toast } from "sonner";
import vncPorta5555 from "@/assets/vnc-porta-5555.png";
import pingPibExemplo from "@/assets/ping-pib-exemplo.png";

export const ManualView = () => (
  <Card className="p-6">
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold">Manual do Aplicativo</h2>
      </div>

      {/* Funcionalidades */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">📋 Funcionalidades</h3>

        {[
          { icon: "⏱️", title: "Timer de Ordens de Serviço", content: [
            "Adicionar WO: Digite o número e clique em Adicionar para iniciar o timer.",
            "Timer de 40min: Alerta sonoro aos 35min e alarme aos 40min.",
            "Ao concluir: Clique em Concluir para salvar no histórico.",
            "Silenciar: Clique em Silenciar para adicionar +40 minutos.",
          ]},
          { icon: "📂", title: "Procedimentos", content: [
            "Buscar: Use o campo de pesquisa para filtrar por título, descrição ou tags.",
            "Filtrar: Use o filtro de categoria para ver apenas procedimentos de uma área específica.",
            "Copiar solução: Clique no ícone de cópia para copiar a solução.",
            "Editar: Abra o procedimento e clique em Editar para modificar os campos.",
            "Backup: Use Gravar Histórico para exportar e Importar Backup para restaurar.",
          ]},
          { icon: "📡", title: "Filas (Remota / Presencial)", content: [
            "Fila Remota: Cards com modelos de notas para atendimentos remotos.",
            "Fila Presencial: Cards para atendimentos presenciais.",
            "Preencha os campos e clique em Copiar para copiar o texto formatado.",
          ]},
          { icon: "✅", title: "Checklists", content: [
            "Guias técnicos interativos com procedimentos passo a passo.",
            "Marque os checkboxes conforme completa cada etapa.",
            "Inclui guias para: Milestone, Formatação Remota, Espanso, SIGESF e Preparação de Pendrive.",
          ]},
        ].map((section) => (
          <Collapsible key={section.title}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-left">
              <span className="font-medium text-sm">{section.icon} {section.title}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3 text-sm space-y-2 text-muted-foreground">
              {section.content.map((line, i) => <p key={i}><strong>{line.split(':')[0]}:</strong>{line.includes(':') ? line.substring(line.indexOf(':') + 1) : ''}</p>)}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>

      {/* Documentação Técnica */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">🔧 Documentação Técnica</h3>

        {[
          { icon: "🖥️", title: "Acesso Remoto (VNC / Área de Trabalho Remota)", content: [
            "VNC: Utilizar o UltraVNC Viewer para acesso via PIB do equipamento.",
            "Formato VNC Server: PIB:5555 (ex.: 10.39.222.230:5555). Veja o exemplo abaixo.",
            "Área de Trabalho Remota (RDP): Usar IP do equipamento quando VNC não estiver disponível.",
            "Consultar IP via CMD: ping + m + sigla do estado + PIB. Ex.: ping mceo12083839 (CE, PIB 12083839).",
            "Atendimento: ping + m + sigla do estado + a + PIB. Ex.: ping mcea12083839.",
            "Portas: VNC usa porta 5555, RDP usa porta 3389.",
            "Importante: Sempre solicitar autorização do usuário antes de acessar remotamente.",
          ], images: [
            { src: vncPorta5555, alt: "Exemplo de conexão VNC com porta 5555 no UltraVNC Viewer", caption: "Exemplo: VNC Server preenchido como PIB:5555" },
            { src: pingPibExemplo, alt: "Exemplo de comando ping no CMD para descobrir IP do PIB", caption: "Exemplo: ping mceo12083839 retornando o IP do equipamento" },
          ]},
          { icon: "🔄", title: "Formatação de Estações", content: [
            "Recovery Windows 8/8.1: Boot pelo pendrive → Restaurar imagem via ghost.",
            "Recovery Windows 9+: Boot pelo pendrive → Selecionar imagem compatível.",
            "Pós-formatação: Ingressar no domínio, instalar drivers, configurar impressoras.",
            "Validação: Testar login do usuário, acesso aos sistemas, impressão e rede.",
          ]},
          { icon: "🖨️", title: "Impressoras", content: [
            "Instalação: Adicionar via IP no painel de controle.",
            "Driver: Usar driver PCL6 ou Universal conforme modelo.",
            "Problemas comuns: Fila travada (reiniciar spooler), offline (verificar IP/cabo).",
            "Milestone: Consultar checklist específico na aba Checklists.",
          ]},
          { icon: "🌐", title: "Rede e Conectividade", content: [
            "Diagnóstico: ipconfig /all, ping, tracert, nslookup.",
            "Cabo: Verificar conexão física, testar ponto de rede.",
            "DNS: Verificar se está apontando para o servidor correto.",
            "DHCP: Se IP não atribuído, verificar ponto e porta do switch.",
          ]},
          { icon: "🔐", title: "Segurança e Boas Práticas", content: [
            "Backup: Sempre faça backup antes de formatação.",
            "Senhas: Nunca armazene senhas de usuários.",
            "Registro: Documente todas as ações nas notas do Remedy.",
            "Autorização: Sempre confirme autorização antes de acessar remotamente.",
          ]},
        ].map((section) => (
          <Collapsible key={section.title}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-left">
              <span className="font-medium text-sm">{section.icon} {section.title}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3 text-sm space-y-2 text-muted-foreground">
              {section.content.map((line, i) => <p key={i}><strong>{line.split(':')[0]}:</strong>{line.includes(':') ? line.substring(line.indexOf(':') + 1) : ''}</p>)}
              {"images" in section && section.images?.map((img, i) => (
                <figure key={i} className="mt-3 space-y-1">
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    className="rounded-md border border-border max-w-full h-auto"
                  />
                  <figcaption className="text-xs text-muted-foreground italic">{img.caption}</figcaption>
                </figure>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>

      <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong className="text-violet-600">💡 Dica:</strong> Este manual é atualizado junto com o app.
        </p>
      </div>

      <div className="flex justify-center">
        <Button className="gap-2" onClick={() => {
          const subject = encodeURIComponent("Contribuição de Procedimento - Base de Procedimentos");
          const body = encodeURIComponent(`Olá Ticket Manager,\n\nGostaria de contribuir com um novo procedimento para o aplicativo.\n\nTÍTULO DO PROCEDIMENTO:\n[Descreva o título aqui]\n\nCATEGORIA:\n[Ex: CONFIGURAÇÃO, INSTALAÇÃO, REDE, etc.]\n\nDESCRIÇÃO DO PROBLEMA:\n[Descreva o problema que este procedimento resolve]\n\nSOLUÇÃO / PASSO A PASSO:\n[Descreva a solução detalhada]\n\nTAGS:\n[Palavras-chave separadas por vírgula]\n\n---\nEnviado via Base de Procedimentos`);
          window.open(`mailto:ticketmanager@empresa.com?subject=${subject}&body=${body}`, '_blank');
          toast.success("Abrindo seu app de email...");
        }}>
          <Mail className="w-4 h-4" />Contribuir com Procedimento
        </Button>
      </div>
    </div>
  </Card>
);
