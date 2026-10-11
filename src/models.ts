export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type Priority = "low" | "medium" | "high" | "critical";
export type Role = "student" | "teacher" | "admin";

export interface User {
  readonly id: number;
  fullName: string;
  email: string;
  role: Role;
}

export interface Ticket {
  readonly id: number;
  title: string;
  description?: string;
  status: TicketStatus;
  priority: Priority;
  authorId: number;
  assigneeId: number | null;
  createdAt: string;
  tags: string[];
}

/**
 * DTO для створення нової заявки:
 * обов'язкові: title, priority, authorId;
 * необов'язкові: description, tags;
 * виключено: id, status, assigneeId, createdAt.
 */
export type CreateTicketDto = Pick<Ticket, "title" | "priority" | "authorId"> &
  Partial<Pick<Ticket, "description" | "tags">>;

/**
 * DTO для оновлення наявної заявки:
 * усі поля необов'язкові: title, description, priority, assigneeId, tags;
 * виключено: id та status.
 */
export type UpdateTicketDto = Partial<
  Pick<Ticket, "title" | "description" | "priority" | "assigneeId" | "tags">
>;
