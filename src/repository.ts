import { err, ok, type Result } from "./result";

export interface Entity {
  readonly id: number;
}

export class InMemoryRepository<T extends Entity> {
  private items: T[] = [];
  private nextId = 1;

  constructor(initial: readonly T[] = []) {
    this.items = initial.map((item) => ({ ...item }));
    const maxId = initial.reduce((max, item) => (item.id > max ? item.id : max), 0);
    this.nextId = maxId + 1;
  }

  get count(): number {
    return this.items.length;
  }

  create(data: Omit<T, "id">): T {
    const id = this.nextId++;
    const newItem = { ...data, id } as T;
    this.items.push({ ...newItem });
    return { ...newItem };
  }

  findById(id: number): T | undefined {
    const item = this.items.find((it) => it.id === id);
    return item ? { ...item } : undefined;
  }

  findAll(filter: Partial<T> = {}): T[] {
    const filterEntries = Object.entries(filter) as [keyof T, unknown][];
    const matched = this.items.filter((item) => {
      for (const [key, value] of filterEntries) {
        if (value !== undefined && item[key] !== value) {
          return false;
        }
      }
      return true;
    });
    return matched.map((item) => ({ ...item }));
  }

  update(id: number, patch: Partial<Omit<T, "id">>): Result<T> {
    const index = this.items.findIndex((it) => it.id === id);
    if (index === -1) {
      return err(`Сутність з id=${id} не знайдено`);
    }

    const current = this.items[index];
    const updated = {
      ...current,
      ...patch,
      id: current.id,
    };
    this.items[index] = { ...updated };
    return ok({ ...updated });
  }

  remove(id: number): boolean {
    const index = this.items.findIndex((it) => it.id === id);
    if (index === -1) {
      return false;
    }
    this.items.splice(index, 1);
    return true;
  }
}
