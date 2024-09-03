import { Provider, InjectionToken } from '@angular/core';
import { TypedInjectableProvider } from './typed-injectable-provider.model';

export type CreateInjectionTokenOptions<T> = {
  description: string;
  isRoot: boolean;
  deps: Provider[];
  overrideResolver: (self: T, override: T) => T;
};

export type CreateInjectionTokenResult<FactoryFn extends (...args: any[]) => any> = {
  provide: (...params: Parameters<FactoryFn>) => Provider[];
  create: FactoryFn;
  inject: <T extends ReturnType<FactoryFn>>() => T;
  token: InjectionToken<ReturnType<FactoryFn>>;
  type: ReturnType<FactoryFn>;
  deps: Provider[];
  override: (overrideProvider: TypedInjectableProvider<ReturnType<FactoryFn>>) => Provider[];
};
