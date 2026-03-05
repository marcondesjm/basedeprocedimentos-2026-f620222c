# 📋 Base de Procedimentos — Sistema de Suporte Técnico

> Sistema interno de gestão de procedimentos técnicos, controle de ordens de serviço e documentação operacional para equipes de suporte técnico.

**Versão:** v2.7.0  
**Última atualização:** Março 2026  
**Desenvolvido por:** Marcondes Jorge Machado  
**URL publicada:** [basedeprocedimentos-2026.lovable.app](https://basedeprocedimentos-2026.lovable.app)

---

## 📑 Índice

- [Visão Geral](#visão-geral)
- [Stack Tecnológica](#stack-tecnológica)
- [Arquitetura do Projeto](#arquitetura-do-projeto)
- [Funcionalidades](#funcionalidades)
- [Estrutura de Arquivos](#estrutura-de-arquivos)
- [Autenticação e Segurança](#autenticação-e-segurança)
- [Armazenamento de Dados](#armazenamento-de-dados)
- [Como Executar Localmente](#como-executar-localmente)
- [Manual do Usuário](#manual-do-usuário)
- [Documentação do Banco de Dados](#documentação-do-banco-de-dados)

---

## Visão Geral

O **Base de Procedimentos** é uma aplicação web PWA voltada para equipes de suporte técnico. Centraliza a gestão de procedimentos, controle de tempo de ordens de serviço (WO), filas de atendimento remoto e presencial, checklists técnicos e documentação operacional.

### Principais objetivos:
- ⏱️ Controlar tempo de atendimento com alarmes automáticos
- 📝 Manter base de conhecimento de procedimentos técnicos
- 📊 Registrar histórico de chamados com exportação
- ✅ Guias interativos (checklists) para cenários recorrentes
- 📖 Manual integrado com documentação técnica

---

## Stack Tecnológica

| Tecnologia | Uso |
|---|---|
| **React 18** | Framework UI |
| **TypeScript** | Tipagem estática |
| **Vite** | Build tool e dev server |
| **Tailwind CSS** | Estilização utility-first |
| **shadcn/ui** | Componentes UI acessíveis (Radix UI) |
| **Supabase** | Autenticação, banco de dados, realtime |
| **TanStack Query** | Gerenciamento de estado assíncrono |
| **React Router v6** | Roteamento SPA |
| **date-fns** | Formatação de datas (locale pt-BR) |
| **Sonner** | Notificações toast |
| **Lucide React** | Ícones |
| **vite-plugin-pwa** | Progressive Web App |

---

## Arquitetura do Projeto

```
┌─────────────────────────────────────────────────┐
│                    FRONTEND                      │
│  React + TypeScript + Tailwind + shadcn/ui       │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Login   │  │  Index   │  │ NotFound │       │
│  │  (Auth)  │  │  (Main)  │  │  (404)   │       │
│  └──────────┘  └──────────┘  └──────────┘       │
│                     │                            │
│  ┌─────────────────────────────────────────┐     │
│  │           AuthGuard (proteção)          │     │
│  └─────────────────────────────────────────┘     │
│                     │                            │
│  ┌──────┐ ┌────────┐ ┌───────────┐ ┌─────────┐  │
│  │Timer │ │Proced. │ │ Filas     │ │Checklists│  │
│  │  WO  │ │  CRUD  │ │Rem/Pres  │ │ Manual  │  │
│  └──────┘ └────────┘ └───────────┘ └─────────┘  │
│                     │                            │
│  ┌─────────────────────────────────────────┐     │
│  │   localStorage (WO History, Logs, Procs)│     │
│  └─────────────────────────────────────────┘     │
└─────────────────────────────────────────────────┘
                      │
┌─────────────────────────────────────────────────┐
│                   BACKEND                        │
│              Lovable Cloud (Supabase)             │
│                                                  │
│  ┌──────────────┐  ┌──────────────────┐          │
│  │ Auth (Email  │  │ app_config       │          │
│  │  + Google)   │  │ (versão, sync)   │          │
│  └──────────────┘  └──────────────────┘          │
│  ┌──────────────┐  ┌──────────────────┐          │
│  │ procedures   │  │ activity_logs    │          │
│  │ (base de     │  │ (registro)       │          │
│  │  conhec.)    │  │                  │          │
│  └──────────────┘  └──────────────────┘          │
│  ┌──────────────┐                                │
│  │ completed_   │  Realtime: sync de versão      │
│  │ work_orders  │                                │
│  └──────────────┘                                │
└─────────────────────────────────────────────────┘
```

---

## Funcionalidades

### 1. 🔐 Autenticação
- Login via email/senha e Google OAuth
- Lista de emails autorizados (whitelist)
- Proteção de rotas com `AuthGuard`
- Tela de login com animação Matrix interativa (mini-game espacial)

### 2. ⏱️ Timer de Ordens de Serviço
- Adicionar múltiplas WOs com prefixo `WO00000`
- Validação numérica com feedback sonoro (beep)
- Contagem progressiva com barra de progresso
- Aviso aos 35 minutos (5 min antes do limite)
- Alarme contínuo aos 40 minutos
- Silenciar alarme (+40 min adicionais)
- Salvar WO concluída no histórico local
- Upload de imagens por WO

### 3. 📋 Histórico de Chamados
- Agrupamento por mês e dia com setas colapsáveis
- Arquivamento individual ou por dia inteiro
- Restauração de chamados arquivados
- Exportação/Importação de backup em JSON
- Busca no arquivo

### 4. 📝 Procedimentos Técnicos
- CRUD completo (criar, editar, excluir)
- Categorias: Instalação, Configuração, Manutenção, etc.
- Tags para busca rápida
- Campos: PIB, Usuário Atendido, Setor, WO vinculada
- Exportação em CSV, JSON e TXT
- Backup e importação de procedimentos

### 5. 📡 Filas de Atendimento
- **Fila Remota**: Templates para conclusão, devolução, diagnóstico, improdutiva
- **Fila Presencial**: Templates para atendimento presencial, impressoras, SIGESF, formatação

### 6. ✅ Checklists Interativos
- Impressoras Milestone (rede, drivers, CUPS)
- Formatação remota (Recovery 8/9+)
- Configuração do Espanso
- Atualização de totens SIGESF
- Preparação de pendrives de deploy
- Análise de problemas de rede

### 7. 📖 Manual do Sistema
- Guias de uso (Timer, Procedimentos, Filas, Checklists)
- Documentação técnica (VNC/RDP, Formatação, Impressoras, Redes)
- Contribuição via email (mailto: com template)

### 8. 📊 Logs e Versionamento
- Log de atividades 100% local (localStorage)
- Limpeza automática em nova sessão do navegador
- Aviso antes de fechar o navegador
- Changelog visual com download
- Sincronização de versão via Supabase Realtime

### 9. 🔒 Segurança
- Bloqueio de clique direito e DevTools (F12, Ctrl+Shift+I)
- Sanitização de inputs (XSS prevention)
- Validação de WO (apenas números, máx. 20 chars)
- Rate limiter embutido

---

## Estrutura de Arquivos

```
src/
├── components/
│   ├── ui/                    # Componentes shadcn/ui
│   ├── ActivityLog.tsx        # Log de atividades local
│   ├── AppSidebar.tsx         # Menu lateral com navegação
│   ├── AuthGuard.tsx          # Proteção de rotas autenticadas
│   ├── Changelog.tsx          # Log de modificações por versão
│   ├── CompletedWorkOrders.tsx # Histórico de WOs concluídas
│   └── WorkTimer.tsx          # Timer de ordens de serviço
├── hooks/
│   ├── use-mobile.tsx         # Detecção de tela mobile
│   └── use-toast.ts           # Hook de notificações
├── integrations/
│   ├── lovable/               # Integração Lovable
│   └── supabase/              # Cliente e tipos Supabase
├── lib/
│   ├── activityLogger.ts      # Sistema de log local
│   ├── security.ts            # Utilitários de segurança
│   └── utils.ts               # Funções utilitárias
├── pages/
│   ├── Index.tsx              # Página principal (~4000 linhas)
│   ├── Login.tsx              # Tela de login com Matrix
│   └── NotFound.tsx           # Página 404
├── App.tsx                    # Roteamento e providers
├── App.css                    # Estilos globais
├── index.css                  # Tokens de design (CSS vars)
└── main.tsx                   # Entry point
```

---

## Autenticação e Segurança

### Emails Autorizados
O acesso é restrito a emails específicos definidos em `AuthGuard.tsx`:
```typescript
const ALLOWED_EMAILS = [
  "suporte@gmail.com",
  "marcondesgestaotrafego@gmail.com",
];
```

### Métodos de Login
- **Email/Senha**: Formulário tradicional
- **Google OAuth**: Login social

### Proteções
- Rotas protegidas via componente `AuthGuard`
- Bloqueio de contexto de menu e ferramentas do desenvolvedor
- Sanitização de inputs contra XSS
- Validação de formato de WO

---

## Armazenamento de Dados

### localStorage (dados efêmeros — limpos em nova sessão)
| Chave | Descrição |
|---|---|
| `workOrderHistory` | Histórico de WOs concluídas por data |
| `workOrderArchive` | WOs arquivadas por data |
| `activity_logs_local` | Log de atividades (máx. 200 entradas) |
| `procedures` | Base de procedimentos técnicos |
| `app_version` | Versão atual do app |
| `theme` | Tema claro/escuro |

### sessionStorage
| Chave | Descrição |
|---|---|
| `app_session_active` | Flag para detectar nova sessão |

### Supabase (persistente)
- **Autenticação**: Sessões de usuário
- **app_config**: Versão atual para sincronização
- **procedures**: Base de procedimentos (backup)
- **completed_work_orders**: Histórico (backup)
- **activity_logs**: Logs (backup)

---

## Como Executar Localmente

### Pré-requisitos
- Node.js 18+ (recomendado: [nvm](https://github.com/nvm-sh/nvm))
- npm ou bun

### Passos

```sh
# 1. Clonar o repositório
git clone <URL_DO_REPOSITORIO>
cd <NOME_DO_PROJETO>

# 2. Instalar dependências
npm install

# 3. Iniciar servidor de desenvolvimento
npm run dev
```

O app estará disponível em `http://localhost:5173`.

### Atalhos de Teclado
| Atalho | Ação |
|---|---|
| `Alt+1` | Painel (Timer/Histórico) |
| `Alt+2` | Procedimentos |
| `Alt+3` | Fila Remota |
| `Alt+4` | Fila Presencial |
| `Alt+5` | Checklists |
| `Alt+6` | Manual |

---

## Manual do Usuário

### Primeiros Passos
1. Acesse o sistema e faça login com email autorizado
2. Na primeira vez, importe um backup de procedimentos (se disponível)
3. Navegue pelo menu lateral para acessar as seções

### Timer de WO
1. Digite o número da WO (apenas números) no campo do timer
2. Clique **Adicionar** ou pressione `Enter`
3. O timer inicia automaticamente em contagem progressiva
4. Aos **35 minutos**, um aviso amarelo aparece
5. Aos **40 minutos**, alarme sonoro contínuo é ativado
6. Opções: **Silenciar** (+40min), **Salvar** (finaliza e salva no histórico)

### Histórico de Chamados
- Chamados salvos ficam agrupados por mês → dia
- Clique nas setas para expandir/colapsar
- **Arquivar**: move para arquivo (individual ou dia inteiro)
- **Exportar Backup**: salva JSON com histórico + arquivo
- **Importar Backup**: restaura dados de arquivo JSON

### Procedimentos
1. Clique **+ Novo Procedimento**
2. Preencha: título, descrição, categoria, tags, solução
3. Campos opcionais: PIB, usuário atendido, WO vinculada
4. Use a busca e filtros para encontrar procedimentos
5. Exporte em CSV, JSON ou TXT

### Filas de Atendimento
- **Fila Remota**: Preencha os campos e copie o texto gerado para colar no Remedy
- **Fila Presencial**: Mesmo fluxo, com campos específicos (setor, data, IP)
- Templates: Conclusão, Devolução, Diagnóstico, Improdutiva, Compartilhamento, Impressora, SIGESF

### Checklists
- Guias técnicos com passos numerados e checkboxes
- Marque os itens conforme executa
- Links para documentação e vídeos externos

### Backup e Segurança
- **IMPORTANTE**: Ao fechar o navegador, os dados de histórico e logs serão perdidos na próxima sessão
- Sempre exporte backup antes de fechar
- O sistema exibe aviso ao sair da página
- Procedimentos são salvos localmente e persistem entre sessões

### Tema Claro/Escuro
- Clique no ícone ☀️/🌙 no menu lateral para alternar

---

## Documentação do Banco de Dados

### Tabelas

#### `app_config`
Configurações globais do sistema (ex: versão atual para sincronização).

| Coluna | Tipo | Nulo | Default | Descrição |
|---|---|---|---|---|
| `key` | text | Não | — | Chave de configuração (PK) |
| `value` | text | Não | — | Valor da configuração |
| `updated_at` | timestamptz | Não | `now()` | Data de atualização |

**RLS:** SELECT, INSERT, UPDATE abertos para todos.

---

#### `procedures`
Base de procedimentos técnicos documentados.

| Coluna | Tipo | Nulo | Default | Descrição |
|---|---|---|---|---|
| `id` | uuid | Não | `gen_random_uuid()` | ID único |
| `title` | text | Não | — | Título do procedimento |
| `description` | text | Não | — | Descrição do problema |
| `category` | text | Não | — | Categoria (INSTALAÇÃO, CONFIG, etc.) |
| `tags` | text[] | Sim | `'{}'` | Tags para busca |
| `solution` | text | Não | — | Solução aplicada |
| `created_by` | text | Não | — | Técnico responsável |
| `created_at` | timestamptz | Não | `now()` | Data de criação |
| `updated_at` | timestamptz | Não | `now()` | Data de atualização |
| `pib_equipamento` | text | Sim | — | PIB do equipamento |
| `usuario_atendido` | text | Sim | — | Usuário que foi atendido |

**RLS:** SELECT, INSERT, UPDATE, DELETE abertos para todos.

---

#### `completed_work_orders`
Histórico de ordens de serviço concluídas.

| Coluna | Tipo | Nulo | Default | Descrição |
|---|---|---|---|---|
| `id` | uuid | Não | `gen_random_uuid()` | ID único |
| `wo_number` | text | Não | — | Número da WO |
| `completed_at` | timestamptz | Não | `now()` | Data de conclusão |
| `total_duration` | integer | Não | — | Duração total em segundos |
| `images` | text[] | Sim | `'{}'` | Imagens em base64 |
| `notes` | text | Sim | — | Notas do técnico |
| `created_at` | timestamptz | Não | `now()` | Data de criação |
| `updated_at` | timestamptz | Não | `now()` | Data de atualização |

**RLS:** SELECT, INSERT, DELETE abertos. UPDATE não permitido.

---

#### `activity_logs`
Registro de atividades do sistema.

| Coluna | Tipo | Nulo | Default | Descrição |
|---|---|---|---|---|
| `id` | uuid | Não | `gen_random_uuid()` | ID único |
| `action` | text | Não | — | Ação (create, update, delete, complete) |
| `entity_type` | text | Não | — | Tipo (procedure, work_order) |
| `entity_id` | text | Sim | — | ID da entidade afetada |
| `details` | jsonb | Sim | `'{}'` | Detalhes adicionais |
| `created_at` | timestamptz | Não | `now()` | Data do registro |

**RLS:** SELECT, INSERT abertos. UPDATE e DELETE não permitidos.

---

### Funções do Banco

#### `update_updated_at_column()`
Trigger function que atualiza automaticamente o campo `updated_at` ao modificar um registro.

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### Realtime
A tabela `app_config` é monitorada via Supabase Realtime para sincronização de versão. Quando `current_version` é atualizado, todos os clientes conectados recebem a notificação, limpam o cache e recarregam automaticamente.

---

## Licença

Projeto interno — uso restrito à equipe de suporte técnico.

---

*Documentação gerada em Março 2026*
