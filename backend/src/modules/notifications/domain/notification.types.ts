/**
 * PFS 4D — Sistema de Notificações: tipos de domínio
 * Estrutura universal do objeto (PFS 4D §5)
 */
import type { Suavidade } from "../../kernel/domain/kernel.types";

export enum NotificationChannel {
  PUSH = "push",
  EMAIL = "email",
  CONSOLE = "daily_console",
}

export interface Notificacao {
  id: string;
  tipo: string;
  familia: string;
  // Metadata do Kernel/Insight
  relevancia: number;
  suavidade: Suavidade;
  prioridade: number;
  // Conteúdo
  leitura: string;       // "Intepretação" (Insight)
  dado: string;          // "Dado" (Insight)
  tendencia: string;
  mensagemFinal: string; // Texto final formatado (PFS 10)
  // Regras
  reforcoPositivo: boolean;
  horarioPermitido: boolean;
  cooldownMinimo: number;
  // Destino
  canaisSuggested: NotificationChannel[];
  sentAt?: Date;
}
