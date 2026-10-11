// Модуль звітів, успадкований від попередньої команди.
// Написаний «як на JavaScript»: без типів параметрів. У режимі strict: false компілюється без помилок.

import type { Ticket, TicketStatus, User } from "../models";

/** Кількість заявок у кожному стані. */
export function summarize(tickets: readonly Ticket[]): Partial<Record<TicketStatus, number>> {
  const byStatus: Partial<Record<TicketStatus, number>> = {};
  for (const t of tickets) {
    byStatus[t.status] = (byStatus[t.status] ?? 0) + 1;
  }
  return byStatus;
}

/** Ім'я виконавця великими літерами або «НЕ ПРИЗНАЧЕНО». */
export function assigneeName(
  users: readonly { id: number; fullName: string }[] | readonly User[],
  id: number | null,
): string {
  const user = users.find((u) => u.id === id);
  return user ? user.fullName.toUpperCase() : "НЕ ПРИЗНАЧЕНО";
}

/** Рядок для журналу: #1 [high] Назва: опис */
export function formatTicket(t: Ticket): string {
  return `#${t.id} [${t.priority}] ${t.title}` + (t.description ? `: ${t.description.trim()}` : "");
}

/** Кількість повних діб між двома датами ISO 8601. */
export function daysBetween(from: string, to: string): number {
  const ms = Date.parse(to) - Date.parse(from);
  return Math.floor(ms / 86_400_000);
}
