export function tryCatch<T>(fn: (this: void) => T): T | Error {
  try {
    return fn();
  } catch (e) {
    return e as Error;
  }
}
