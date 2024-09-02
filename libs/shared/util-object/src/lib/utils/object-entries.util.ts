import { ObjectEntries } from '@shared/util-types';

/** Strongly typed Object.entries() that returns actual keys instead of just strings and don't lose values types */
export const objectEntries = <T extends object>(
  source: T
): ObjectEntries<T> => {
  return Object.entries(source) as ObjectEntries<T>;
};
