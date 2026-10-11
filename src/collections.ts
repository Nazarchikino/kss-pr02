export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * Розбиття масиву на сторінки (пагінація) із поверненням зрізу даних та метаінформації.
 */
export function paginate<T>(items: readonly T[], page = 1, pageSize = 10): Page<T> {
  if (!Number.isInteger(page) || page < 1) {
    throw new RangeError("Параметр page повинен бути додатним цілим числом >= 1");
  }
  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new RangeError("Параметр pageSize повинен бути додатним цілим числом >= 1");
  }

  const total = items.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  return {
    items: pageItems,
    page,
    pageSize,
    total,
    totalPages,
  };
}

/**
 * Групування елементів масиву за ключем зі збереженням порядку.
 */
export function groupBy<T, K extends PropertyKey>(
  items: readonly T[],
  keyOf: (item: T) => K,
): Partial<Record<K, T[]>> {
  const result: Partial<Record<K, T[]>> = {};

  for (const item of items) {
    const key = keyOf(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key]!.push(item);
  }

  return result;
}
