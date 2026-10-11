export type Rule = (value: unknown) => string | null;

const rulesRegistry = new WeakMap<object, Map<string, Rule[]>>();

/**
 * Реєстрація правила валідації для властивості класу в системному реєстрі.
 */
export function addRule(
  target: object,
  propertyKey: string | symbol,
  rule: Rule,
): void {
  const prop = String(propertyKey);
  let classRules = rulesRegistry.get(target);
  if (!classRules) {
    classRules = new Map<string, Rule[]>();
    rulesRegistry.set(target, classRules);
  }

  const rules = classRules.get(prop) ?? [];
  rules.push(rule);
  classRules.set(prop, rules);
}

/**
 * Декоратор обов'язкового поля: перевіряє на undefined, null або порожній рядок.
 */
export function Required(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    addRule(target, propertyKey, (value: unknown) => {
      if (
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "")
      ) {
        return "поле обов'язкове";
      }
      return null;
    });
  };
}

/**
 * Декоратор максимальної довжини рядка.
 */
export function MaxLength(max: number): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    addRule(target, propertyKey, (value: unknown) => {
      if (typeof value === "string" && value.length > max) {
        return `довжина не більше ${max} символів`;
      }
      return null;
    });
  };
}

/**
 * Декоратор допустимих значень із переліку.
 */
export function IsIn(allowed: readonly unknown[]): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    addRule(target, propertyKey, (value: unknown) => {
      if (value !== undefined && value !== null && !allowed.includes(value)) {
        return `допустимі значення: ${allowed.join(", ")}`;
      }
      return null;
    });
  };
}

/**
 * Валідація екземпляра класу за зареєстрованими через декоратори правилами.
 */
export function validate(obj: object): string[] {
  if (obj === null || typeof obj !== "object") {
    return [];
  }

  const proto = Object.getPrototypeOf(obj);
  if (!proto) {
    return [];
  }

  const classRules = rulesRegistry.get(proto);
  if (!classRules) {
    return [];
  }

  const errors: string[] = [];
  const record = obj as Record<string, unknown>;

  for (const [propName, rules] of classRules.entries()) {
    const value = record[propName];
    for (const rule of rules) {
      const error = rule(value);
      if (error) {
        errors.push(`${propName}: ${error}`);
      }
    }
  }

  return errors;
}
