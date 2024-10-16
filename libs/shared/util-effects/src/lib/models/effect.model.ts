import { ValueOrReactive } from '@shared/util-types';
import { DispatchableAction } from './action.model';
import { Injector, Provider } from '@angular/core';
import { CanActivateGuardFn } from './can-activate-guard-fn.model';

type Action<Input> = DispatchableAction<string | symbol, (...args: any[]) => ValueOrReactive<Input>>;

export interface RxEffectOptions<Input = void> {
  effectFn: (payload: ValueOrReactive<Input>, injector: Injector) => void;
  sources?: Array<Action<Input>>;
  canActivate?: CanActivateGuardFn<Input>;
  providers?: Provider[];
}
