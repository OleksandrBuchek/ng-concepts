import { ValueOrFactory } from '@shared/util-types';
import { isNullOrUndefined } from './is-null-or-undefined';

export const getValue = <TValue>(valueOrFactory: ValueOrFactory<TValue>): TValue => {
  return typeof valueOrFactory === 'function' ? (valueOrFactory as () => TValue)() : valueOrFactory;
};

export const assertValue = <TValue>(valueOrFactory: ValueOrFactory<TValue>): Exclude<TValue, null | undefined> => {
  const value = getValue(valueOrFactory);

  if (isNullOrUndefined(value)) {
    throw new Error('Value is not defined');
  }

  return value as Exclude<TValue, null | undefined>;
};
