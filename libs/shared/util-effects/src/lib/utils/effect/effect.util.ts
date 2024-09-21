import { inject, Injector, runInInjectionContext } from '@angular/core';
import { RxEffectOptions } from '../../models';
import { ValueOrReactive } from '@shared/util-types';
import { IsFinalStep } from '../../providers';
import { onInit } from './effect-hooks.util';
import { extractActionPayload } from './extract-action-payload.util';
import { withGuardsCheck, composeGuardChecks } from './effect-guards.util';

const getInjector = <Payload>(options: RxEffectOptions<Payload>): Injector => {
  const parentInjector = inject(Injector);

  return Injector.create({
    parent: parentInjector,
    providers: options.providers ?? [],
  });
};

const getEffectFnInjector = (parent: Injector): Injector => {
  return Injector.create({
    parent,
    providers: [IsFinalStep.provide(true)],
  });
};

export const rxEffect = <Payload>(options: RxEffectOptions<Payload>) => {
  const injector = getInjector(options);

  const actionPayload$ = extractActionPayload(injector, options);

  const ifGuardsAllow = withGuardsCheck(composeGuardChecks(injector, options));

  const effectFnInjector = getEffectFnInjector(injector);

  runInInjectionContext(effectFnInjector, () => {
    options.effectFn(ifGuardsAllow(actionPayload$));
  });

  return (payload: ValueOrReactive<Payload>): void => {
    runInInjectionContext(effectFnInjector, () => {
      onInit();
      options.effectFn(ifGuardsAllow(payload));
    });
  };
};
