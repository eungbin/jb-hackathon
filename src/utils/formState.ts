export function updateTextField<T extends Record<string, unknown>, K extends keyof T>(
  current: T,
  field: K,
  value: string,
): T {
  return {
    ...current,
    [field]: value,
  }
}
