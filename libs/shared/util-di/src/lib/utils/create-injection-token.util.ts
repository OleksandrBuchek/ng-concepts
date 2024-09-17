import { InjectionToken, Provider, inject as ngInject } from '@angular/core';
import { CreateInjectionTokenOptions, CreateInjectionTokenResult, TypedInjectableProvider } from '../models';

const injectOverride = <T>(token: InjectionToken<T>) => ngInject(token, { skipSelf: true, optional: true });

const mergeWithDefaultOptions = <T>(
  override: Partial<CreateInjectionTokenOptions<T>>
): CreateInjectionTokenOptions<T> => ({
  description: '',
  isRoot: false,
  overrideResolver: (self: T) => self,
  deps: [],
  ...override,
});

const provideFnFactory =
  <FactoryFn extends (...args: any[]) => any, Options extends CreateInjectionTokenOptions<ReturnType<FactoryFn>>>(
    create: FactoryFn,
    token: InjectionToken<ReturnType<FactoryFn>>,
    options: Options
  ) =>
  (...params: Parameters<FactoryFn>): Provider[] =>
    [
      {
        provide: token,
        useFactory: () => {
          const self = create(...params);
          const override = injectOverride(token);

          return override ? options.overrideResolver(self, override) : self;
        },
      },
      options.deps,
    ].flat();

const overrideFnFactory =
  <FactoryFn extends (...args: any[]) => any, Options extends CreateInjectionTokenOptions<ReturnType<FactoryFn>>>(
    token: InjectionToken<ReturnType<FactoryFn>>,
    options: Options
  ) =>
  (
    overrideProvider: TypedInjectableProvider<Partial<ReturnType<FactoryFn>> | ReturnType<FactoryFn>>,
    overrideDeps: Provider[] = []
  ): Provider[] =>
    [
      {
        provide: token,
        ...overrideProvider,
      },
      options.deps,
      overrideDeps,
    ].flat();

export const createInjectionToken = <
  FactoryFn extends (...args: any[]) => any,
  Options extends Partial<CreateInjectionTokenOptions<ReturnType<FactoryFn>>>
>(
  create: FactoryFn,
  options: Options = {} as Options
): CreateInjectionTokenResult<FactoryFn> => {
  type Type = ReturnType<FactoryFn>;

  const mergedOptions: CreateInjectionTokenOptions<Type> = mergeWithDefaultOptions(options);

  const tokenOptions = options.isRoot ? { provideIn: 'root', factory: () => create() } : undefined;

  const token = new InjectionToken<Type>(mergedOptions.description, tokenOptions);

  const inject = () => ngInject(token);

  const injectAsOptional = () => ngInject(token, { optional: true });

  const provide = provideFnFactory(create, token, mergedOptions);
  const override = overrideFnFactory(token, mergedOptions);

  return {
    provide,
    create,
    override,
    inject,
    injectAsOptional,
    token,
    deps: mergedOptions.deps,
    type: {} as Type,
  };
};
