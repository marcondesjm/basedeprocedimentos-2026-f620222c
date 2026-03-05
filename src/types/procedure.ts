export type NoteType = "procedimento" | "diagnostico";

export interface Procedure {
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

export const CATEGORIES = ["INSTALAÇÃO", "MANUTENÇÃO", "CONFIGURAÇÃO", "SUPORTE", "REPARO"];

export const FILA_REMOTA_CATEGORIES = [
  { id: "conclusao-remoto", label: "Conclusão - Remoto", color: "border-l-primary" },
  { id: "conclusao-impressora", label: "Conclusão - Impressora", color: "border-l-primary" },
  { id: "conclusao-compartilhamento", label: "Conclusão - Compartilhamento", color: "border-l-primary" },
  { id: "diagnostico-remoto", label: "Diagnóstico - Remoto", color: "border-l-amber-500" },
  { id: "devolucao-remoto-presencial", label: "Devolução - Remoto > Presencial", color: "border-l-blue-500" },
  { id: "improdutivo-remoto", label: "Improdutivo - Remoto", color: "border-l-red-500" },
  { id: "improdutivo-outras", label: "Improdutivo – Outras Situações", color: "border-l-red-500" },
];

export const FILA_PRESENCIAL_CATEGORIES = [
  { id: "conclusao-presencial", label: "Conclusão - Presencial", color: "border-l-primary" },
  { id: "conclusao-formatacao", label: "Conclusão - Formatação", color: "border-l-primary" },
  { id: "conclusao-impressora-p", label: "Conclusão - Impressora", color: "border-l-primary" },
  { id: "diagnostico-generico", label: "Diagnóstico - Genérico", color: "border-l-amber-500" },
  { id: "diagnostico-sigesf", label: "Diagnóstico - Sigesf", color: "border-l-amber-500" },
  { id: "improdutivo-presencial", label: "Improdutivo - Presencial", color: "border-l-red-500" },
  { id: "improdutivo-outras-p", label: "Improdutivo – Outras Situações", color: "border-l-red-500" },
  { id: "devolucao-presencial", label: "Devolução - Presencial > ...", color: "border-l-blue-500" },
];

export const ALL_FILA_CATEGORIES = [
  ...FILA_REMOTA_CATEGORIES.map(c => ({ ...c, fila: "remota" as const })),
  ...FILA_PRESENCIAL_CATEGORIES.map(c => ({ ...c, fila: "presencial" as const })),
];
