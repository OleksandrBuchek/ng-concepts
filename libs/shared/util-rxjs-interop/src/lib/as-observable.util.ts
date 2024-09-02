import { isSignal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { isFactoryFunction, isFunction } from '@shared/util-helpers';
import { ValueOrFactory, ValueOrReactive } from '@shared/util-types';
import { Observable, isObservable, of } from 'rxjs';

export const asObservable = <TValue>(valueOrFactory: ValueOrFactory<ValueOrReactive<TValue>>): Observable<TValue> => {
  const toObservableFn = (value: ValueOrReactive<TValue>) =>
    isObservable(value) ? value : isSignal(value) ? toObservable(value) : of(value);

  return isFactoryFunction(valueOrFactory) ? toObservableFn(valueOrFactory()) : toObservableFn(valueOrFactory);
};

export const asInputObservable = <TValue>(value: ValueOrReactive<TValue>): Observable<TValue> =>
  asObservable(isFunction(value) ? of(value as TValue) : value);
