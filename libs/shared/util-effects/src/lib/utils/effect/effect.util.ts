import { inject, Injector, Provider } from '@angular/core';
import { RxEffectOptions, RxInjectablePipeline, RxInjectablePipelineInput } from '../../models';
import { ValueOrReactive } from '@shared/util-types';
import { extractActionPayload } from './extract-action-payload.util';
import { createInternalAction } from '../action.util';
import { composePipeline, withFilterAsync, withInjector } from '../shared';
import { onGuardReject } from './effect-hooks.util';
import { map, Observable } from 'rxjs';

const getPipelineInjector = (providers: Provider[] = []): Injector => {
  return Injector.create({
    parent: inject(Injector),
    providers
  });
}

const getRxEffectPipeline = <Input = void>(
  options: RxEffectOptions<Input>
): RxInjectablePipeline<Input, RxInjectablePipelineInput<Input>> => {
  return composePipeline<Input, RxInjectablePipelineInput<Input>>(
    withFilterAsync(options.canActivate, onGuardReject)
  )();
};

const getActions = <Input>(options: RxEffectOptions<Input>, injector: Injector) => {
  const internalAction = createInternalAction((input: ValueOrReactive<Input>) => input);

  const actionPayload$ = extractActionPayload(injector, {
    ...options,
    actions: [...(options.actions ?? []), internalAction],
  });

  return {
    dispatch: internalAction,
    actionPayload$,
  };
};

const extractInput = <Input>(input$: Observable<RxInjectablePipelineInput<Input>>): Observable<Input> => {
  return input$.pipe(map(({ input }) => input));
};

export const rxEffect = <Input = void>(options: RxEffectOptions<Input>) => {
  const injector = getPipelineInjector(options.providers);

  const actions = getActions(options, injector);

  const effectPipeline = getRxEffectPipeline(options);

  const inputWithInjector$ = withInjector(actions.actionPayload$, injector);

  options.effectFn(extractInput(effectPipeline(inputWithInjector$)));

  return (payload: ValueOrReactive<Input>): void => {
    actions.dispatch(payload);
  };
};
