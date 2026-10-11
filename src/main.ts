import { readFileSync } from "node:fs";
import { join } from "node:path";
import { paginate } from "./collections";
import { CreateTicketInput } from "./dto/create-ticket.input";
import { summarize } from "./legacy/report";
import { LoggedTicketRepository } from "./log-call";
import type { Ticket } from "./models";
import { InMemoryRepository } from "./repository";
import { firstTitle, parseTickets, priorityWeight } from "./tickets";
import { validate } from "./validation";

function runDemo(): void {
  console.log("=== ДЕМОНСТРАЦІЙНИЙ СЦЕНАРІЙ HELPDESK TS ===");

  // 1. Завантаження заявок з файлу data/tickets.json через parseTickets
  const filePath = join(__dirname, "..", "data", "tickets.json");
  const rawData = readFileSync(filePath, "utf-8");
  const ticketsData = parseTickets(rawData);
  console.log(`\n1. Завантажено заявок із JSON: ${ticketsData.length}`);

  // 2. Створення сховища InMemoryRepository<Ticket>
  const repository = new InMemoryRepository<Ticket>(ticketsData);
  console.log(`Створено сховище InMemoryRepository. Загальна кількість записів: ${repository.count}`);

  // 3. Відкриті заявки за спаданням пріоритету
  const openTickets = repository
    .findAll({ status: "open" })
    .sort((a, b) => priorityWeight(b.priority) - priorityWeight(a.priority));

  console.log(`\n2. Відкриті заявки (всього ${openTickets.length}), відсортовані за спаданням пріоритету:`);
  for (const t of openTickets) {
    console.log(`  - [#${t.id}] [${t.priority.toUpperCase()}] ${t.title}`);
  }

  // 4. Кількість заявок за станами
  const allTickets = repository.findAll();
  const summary = summarize(allTickets);
  console.log("\n3. Кількість заявок за станами (через summarize):");
  for (const [status, count] of Object.entries(summary)) {
    console.log(`  - ${status}: ${count}`);
  }

  // 5. Друга сторінка списку (по 4 заявки)
  const page2 = paginate(allTickets, 2, 4);
  console.log(
    `\n4. Друга сторінка списку заявок (сторінка ${page2.page} з ${page2.totalPages}, розмір сторінки: ${page2.pageSize}):`,
  );
  for (const item of page2.items) {
    console.log(`  - [#${item.id}] [${item.status}] [${item.priority}] ${item.title}`);
  }

  // 6. Результат validate для некоректних даних
  console.log("\n5. Валідація некоректних даних CreateTicketInput:");
  const invalidInput = CreateTicketInput.from({
    title: " ",
    priority: "urgent" as any,
    description: "x".repeat(505),
  });
  const validationErrors = validate(invalidInput);
  console.log("Виявлені помилки валідації:");
  for (const err of validationErrors) {
    console.log(`  ✖ ${err}`);
  }

  // 7. Демонстрація додаткових завдань
  console.log("\n6. Додаткові завдання:");
  console.log(`  - Перша заявка через firstTitle: "${firstTitle(allTickets)}"`);

  console.log("  - Демонстрація декоратора методу @LogCall():");
  const loggedRepo = new LoggedTicketRepository(ticketsData);
  const updateResult = loggedRepo.update(1, { priority: "critical" });
  if (updateResult.ok) {
    console.log(`  Оновлено заявку: [#${updateResult.value.id}] новий пріоритет: ${updateResult.value.priority}`);
  }

  console.log("\n=== ДЕМОНСТРАЦІЮ УСПІШНО ЗАВЕРШЕНО ===");
}

runDemo();
