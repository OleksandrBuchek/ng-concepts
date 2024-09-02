import { ValueOrFactory } from '@shared/util-types';
import { isNullOrUndefined } from './is-null-or-undefined';
import { getValue } from './get-value';

export const ensureValue = <TValue>(fn: ValueOrFactory<TValue | undefined | null>): TValue | never => {
  const valueOrNullish = getValue(fn);

  if (isNullOrUndefined(valueOrNullish)) {
    throw new Error('A value was expected to be defined.');
  }

  return valueOrNullish;
};
