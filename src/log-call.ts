import { performance } from "node:perf_hooks";
import type { Ticket } from "./models";
import { InMemoryRepository } from "./repository";
import type { Result } from "./result";

/**
 * Декоратор методу @LogCall:
 * замінює метод обгорткою, яка виводить ім'я методу, аргументи й тривалість виконання в мілісекундах.
 */
export function LogCall(): MethodDecorator {
  return (
    _target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
  ) => {
    const originalMethod = descriptor.value;
    if (typeof originalMethod === "function") {
      descriptor.value = function (this: unknown, ...args: unknown[]) {
        const start = performance.now();
        console.log(
          `[LogCall] Виклик методу "${String(propertyKey)}" з аргументами:`,
          JSON.stringify(args),
        );
        const result = originalMethod.apply(this, args);
        const duration = (performance.now() - start).toFixed(2);
        console.log(
          `[LogCall] Метод "${String(propertyKey)}" виконано за ${duration} мс`,
        );
        return result;
      };
    }
    return descriptor;
  };
}

/**
 * Клас-нащадок сховища заявок із логуванням виклику методу update.
 */
export class LoggedTicketRepository extends InMemoryRepository<Ticket> {
  @LogCall()
  override update(id: number, patch: Partial<Omit<Ticket, "id">>): Result<Ticket> {
    return super.update(id, patch);
  }
}
