import { IsNever } from '@shared/util-types';
import { Observable } from 'rxjs';

export interface ActionContext<Type extends string | symbol, PayloadFactory extends (...args: any[]) => any> {
  type: Type;
  payload: {
    args: Parameters<PayloadFactory>;
    factory: PayloadFactory;
  };
}

export type DispatchableAction<
  Type extends string | symbol,
  PayloadFactory extends (...args: any[]) => any = never
> = IsNever<PayloadFactory> extends true
  ? {
      (): void;
    }
  : {
      (...args: Parameters<PayloadFactory>): void;
    } & {
      type: Type;
      changes$: Observable<ActionContext<Type, PayloadFactory>>;
    };
