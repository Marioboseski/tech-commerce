// The biggest value of a MySQL INT column (our ids). A bigger number would
// make the database query fail with a 500 instead of a clear 400.
const MAX_INT_ID = 2_147_483_647;

// A valid id is a whole number from 1 to MAX_INT_ID.
// `value is number` tells TypeScript: when this returns true, value is a number.
export const isValidId = (value: unknown): value is number =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  value > 0 &&
  value <= MAX_INT_ID;
