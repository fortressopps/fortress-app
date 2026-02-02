/**
 * PFS 4D — Notification Dispatcher
 * Decide canais, formata mensagem final e "envia" (mock)
 */
import { Insight } from "../../insights/domain/insight.types";
import { KernelDecision } from "../../kernel/domain/kernel.types";
import { Notificacao, NotificationChannel } from "./notification.types";
import { v4 as uuidv4 } from "uuid";

/**
 * Determina canais baseado na Relevância (PFS 10) e Suavidade
 */
export function determineChannels(relevance: number, suavidade: number): NotificationChannel[] {
    const channels: NotificationChannel[] = [NotificationChannel.CONSOLE]; // Console sempre recebe

    // PFS 10: 71-100 -> Insight + Possível notificação
    if (relevance >= 70) {
        channels.push(NotificationChannel.PUSH);
    } else if (relevance >= 41) {
        // 41-70 -> Prioritário, talvez Email digest (no futuro), por hora Console
    }

    return channels;
}

/**
 * Formata mensagem final com Reforço Positivo se permitido (PFS 3.3, 11)
 */
export function composeFinalMessage(insight: Insight, decision: KernelDecision): string {
    let msg = insight.interpretacao;

    // Adicionar reforço positivo no final se permitido
    if (decision.reinforce) {
        // Exemplo simplificado de reforço. Em prod, viria de um catálogo variado.
        msg += " Ótimo sinal de consistência.";
    }

    return msg;
}

/**
 * Cria e despacha a notificação
 */
export function dispatchNotification(insight: Insight, decision: KernelDecision): Notificacao {
    const finalMessage = composeFinalMessage(insight, decision);
    const channels = determineChannels(insight.relevancia, decision.suavidade);

    const notif: Notificacao = {
        id: uuidv4(),
        tipo: insight.tipo,
        familia: insight.familia,
        relevancia: insight.relevancia,
        suavidade: insight.nivel,
        prioridade: decision.relevance, // Simplified mapping
        leitura: insight.interpretacao,
        dado: insight.dado,
        tendencia: insight.tendencia,
        mensagemFinal: finalMessage,
        reforcoPositivo: decision.reinforce,
        horarioPermitido: true, // Mock, sempre permitido por hora
        cooldownMinimo: decision.cooldownMin,
        canaisSuggested: channels,
        sentAt: new Date(),
    };

    // Simular envio
    if (channels.includes(NotificationChannel.PUSH)) {
        console.log(`[PUSH] ${finalMessage}`);
    } else {
        console.log(`[CONSOLE] ${finalMessage}`);
    }

    return notif;
}
