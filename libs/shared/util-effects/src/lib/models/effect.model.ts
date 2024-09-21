import { ValueOrReactive } from '@shared/util-types';
import { DispatchableAction } from './action.model';
import { Provider } from '@angular/core';

export interface RxEffectOptions<Payload = void> {
  effectFn: (payload: ValueOrReactive<Payload>) => void;
  actions?: Array<DispatchableAction<string, (...args: any[]) => ValueOrReactive<Payload>>>;
  preEffectGuards?: Array<(payload: Payload) => ValueOrReactive<boolean>>;
  providers?: Provider[];
}
