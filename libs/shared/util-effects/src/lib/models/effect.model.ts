import { ValueOrReactive } from '@shared/util-types';
import { DispatchableAction } from './action.model';
import { Provider } from '@angular/core';
import { CanActivateGuardFn } from './can-activate-guard-fn.model';

export interface RxEffectOptions<Input = void> {
  effectFn: (payload: ValueOrReactive<Input>) => void;
  actions?: Array<DispatchableAction<string | symbol, (...args: any[]) => ValueOrReactive<Input>>>;
  canActivate?: CanActivateGuardFn<Input>;
  providers?: Provider[];
}
