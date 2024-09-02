import { isSignal } from '@angular/core';

export const isFunction = <TFunction extends (...args: any[]) => any>(
  valueOrFunction: TFunction | unknown,
): valueOrFunction is TFunction => typeof valueOrFunction === 'function' && !isSignal(valueOrFunction);

export const isFactoryFunction = <TFactoryFn extends (...args: any[]) => any>(
  valueOrFactory: ReturnType<TFactoryFn> | TFactoryFn,
): valueOrFactory is TFactoryFn => isFunction(valueOrFactory);
