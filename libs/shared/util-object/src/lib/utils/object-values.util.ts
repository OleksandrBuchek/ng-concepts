import { ObjectValues } from '@shared/util-types';

/** Strongly typed Object.values() (the original one sometimes lose types) */
export const objectValues = <T extends object>(source: T): ObjectValues<T> => {
  return Object.values(source) as ObjectValues<T>;
};
