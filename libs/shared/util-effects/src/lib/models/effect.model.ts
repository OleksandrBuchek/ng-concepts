import { ValueOrFactory, ValueOrReactive } from '@shared/util-types';
import { DispatchableAction } from './action.model';
import { Provider } from '@angular/core';
import { RequestStore } from './effect-store.model';
import { HttpErrorHandlersMap } from '@shared/util-error-handling';

export interface RxEffectParams<Payload = void> {
  effectFn: (payload: ValueOrReactive<Payload>) => void;
  actions?: Array<DispatchableAction<string, (...args: any[]) => ValueOrReactive<Payload>>>;
  preEffectGuards?: Array<(payload: Payload) => ValueOrReactive<boolean>>;
  providers?: Provider[];
  store?: RequestStore;
  errorHandler?: ValueOrFactory<Partial<HttpErrorHandlersMap>>;
}
