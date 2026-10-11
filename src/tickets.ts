import type { Priority, Ticket, TicketStatus } from "./models";

export const STATUS_TRANSITIONS: Readonly<Record<TicketStatus, readonly TicketStatus[]>> = {
  open: ["in_progress", "closed"],
  in_progress: ["open", "resolved"],
  resolved: ["closed", "in_progress"],
  closed: [],
};

/**
 * Перевірка допустимості переходу між станами згідно з таблицею переходів.
 */
export function canTransition(from: TicketStatus, to: TicketStatus): boolean {
  return STATUS_TRANSITIONS[from].includes(to);
}

/**
 * Зміна стану заявки: повертає новий об'єкт без мутації вихідного.
 * Кидає виняток у разі недопустимого переходу.
 */
export function changeStatus(ticket: Ticket, to: TicketStatus): Ticket {
  if (!canTransition(ticket.status, to)) {
    throw new Error(`Недопустимий перехід: ${ticket.status} → ${to}`);
  }
  return {
    ...ticket,
    status: to,
  };
}

/**
 * Допоміжна функція вичерпної перевірки для типу never.
 */
export function assertNever(x: never): never {
  throw new Error(`Недосяжне значення: ${x}`);
}

/**
 * Вага пріоритету заявки: від low (1) до critical (4).
 * Використовує вичерпну перевірку типів через гілку default та assertNever.
 */
export function priorityWeight(priority: Priority): number {
  switch (priority) {
    case "low":
      return 1;
    case "medium":
      return 2;
    case "high":
      return 3;
    case "critical":
      return 4;
    default:
      return assertNever(priority);
  }
}

const VALID_STATUSES: readonly TicketStatus[] = ["open", "in_progress", "resolved", "closed"];
const VALID_PRIORITIES: readonly Priority[] = ["low", "medium", "high", "critical"];

/**
 * Захисник типу (type guard), що перевіряє валідність структури заявки під час виконання.
 */
export function isTicket(value: unknown): value is Ticket {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  if (typeof candidate.id !== "number" || !Number.isInteger(candidate.id)) {
    return false;
  }

  if (typeof candidate.title !== "string" || candidate.title.trim() === "") {
    return false;
  }

  if (
    candidate.description !== undefined &&
    typeof candidate.description !== "string"
  ) {
    return false;
  }

  if (typeof candidate.status !== "string" || !VALID_STATUSES.includes(candidate.status as TicketStatus)) {
    return false;
  }

  if (typeof candidate.priority !== "string" || !VALID_PRIORITIES.includes(candidate.priority as Priority)) {
    return false;
  }

  if (typeof candidate.authorId !== "number" || !Number.isInteger(candidate.authorId)) {
    return false;
  }

  if (candidate.assigneeId !== null && (typeof candidate.assigneeId !== "number" || !Number.isInteger(candidate.assigneeId))) {
    return false;
  }

  if (typeof candidate.createdAt !== "string" || Number.isNaN(Date.parse(candidate.createdAt))) {
    return false;
  }

  if (
    !Array.isArray(candidate.tags) ||
    !candidate.tags.every((tag) => typeof tag === "string")
  ) {
    return false;
  }

  return true;
}

/**
 * Розбір JSON-рядка у масив заявок із валідацією кожного елемента.
 */
export function parseTickets(json: string): Ticket[] {
  const parsed: unknown = JSON.parse(json);

  if (!Array.isArray(parsed)) {
    throw new Error("Очікувався масив заявок");
  }

  return parsed.map((item, index) => {
    if (!isTicket(item)) {
      throw new Error(`Некоректна заявка з індексом ${index}`);
    }
    return item;
  });
}

/**
 * Додаткове завдання 2: отримання назви першої заявки.
 */
export function firstTitle(tickets: Ticket[]): string {
  return tickets[0].title;
}
