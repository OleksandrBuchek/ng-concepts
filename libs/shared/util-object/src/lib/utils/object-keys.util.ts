import { ObjectKeys } from '@shared/util-types';

/** Strongly typed Object.keys() that returns actual keys instead of just strings */
export const objectKeys = <T extends object>(source: T): ObjectKeys<T> => {
  return Object.keys(source) as ObjectKeys<T>;
};
