import fastDeepEqual from 'fast-deep-equal/es6';

export function isEqual<T, C>(a: T, b: C): boolean {
  return fastDeepEqual(a, b);
}
