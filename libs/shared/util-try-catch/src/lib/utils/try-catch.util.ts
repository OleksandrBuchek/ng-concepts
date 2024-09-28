import { isUndefined } from "lodash-es";

export function tryCatch<T>(fn: (this: void) => T): T | Error;
export function tryCatch<T, U>(fn: (this: void) => T, fallbackValue: U): T;
export function tryCatch<T, U>(fn: (this: void) => T, fallbackValue?: U): T | U | Error {
  try {
    return fn();
  } catch (e) {
    return isUndefined(fallbackValue) === false ? fallbackValue : (e as Error);
  }
}