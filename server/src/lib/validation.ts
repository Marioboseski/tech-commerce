export const isValidId = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value > 0;