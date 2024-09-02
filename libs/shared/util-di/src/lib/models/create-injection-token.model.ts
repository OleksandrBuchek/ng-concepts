import { Provider, InjectionToken } from '@angular/core';
import { TypedInjectableProvider } from './typed-injectable-provider.model';

export type CreateInjectionTokenOptions<T> = {
  description: string;
  isRoot: boolean;
  deps: Provider[];
} & (
  | {
      overrideResolver: (self: T, override: Partial<T>) => T;
      allowPartialOverride: true;
    }
  | {
      overrideResolver: (self: T, override: T) => T;
      allowPartialOverride: false;
    }
);

export type CreateInjectionTokenResult<
  FactoryFn extends (...args: any[]) => any,
  Options extends Partial<CreateInjectionTokenOptions<ReturnType<FactoryFn>>>,
> = {
  provide: (...params: Parameters<FactoryFn>) => Provider[];
  create: FactoryFn;
  inject: <T extends ReturnType<FactoryFn>>() => T;
  token: InjectionToken<ReturnType<FactoryFn>>;
  type: ReturnType<FactoryFn>;
  deps: Provider[];
  override: Options['allowPartialOverride'] extends true
    ? (overrideProvider: TypedInjectableProvider<Partial<ReturnType<FactoryFn>>>) => Provider[]
    : (overrideProvider: TypedInjectableProvider<ReturnType<FactoryFn>>) => Provider[];
};
