import { Signal, isSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { isFactoryFunction, isNullOrUndefined } from '@shared/util-helpers';
import { ValueOrFactory, ValueOrReactive } from '@shared/util-types';
import { isObject } from 'lodash-es';
import { isObservable } from 'rxjs';

export function asSignal<TValue>(valueOrFactory: ValueOrFactory<ValueOrReactive<TValue>>): Signal<TValue | undefined>;
export function asSignal<TValue>(
  valueOrFactory: ValueOrFactory<ValueOrReactive<TValue>>,
  params?: { initialValue: TValue },
): Signal<TValue>;
export function asSignal<TValue>(
  valueOrFactory: ValueOrFactory<ValueOrReactive<TValue>>,
  params?: { requireSync: true },
): Signal<TValue>;
export function asSignal<TValue>(
  valueOrFactory: ValueOrFactory<ValueOrReactive<TValue>>,
  params?: { initialValue: TValue } | { requireSync: true },
): Signal<TValue> | Signal<TValue | undefined> {
  const toSignalFn = (value: ValueOrReactive<TValue>) => {
    if (isSignal(value)) {
      return value;
    }

    if (isObservable(value)) {
      return toSignal(value, params as any);
    }

    const initialValue =
      isNullOrUndefined(value) && isObject(params) && 'initialValue' in params ? params.initialValue : value;

    return signal(initialValue);
  };

  return isFactoryFunction(valueOrFactory) ? toSignalFn(valueOrFactory()) : toSignalFn(valueOrFactory);
}

export const asInputSignal = <TValue>(value: ValueOrReactive<TValue>): Signal<TValue | undefined> =>
  asSignal(isFactoryFunction(value) ? signal(value) : value);
