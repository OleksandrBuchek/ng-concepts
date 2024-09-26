import { inject, Injector, runInInjectionContext } from '@angular/core';
import { RxEffectOptions, RxInjectablePipeline, RxInjectablePipelineInput } from '../../models';
import { ValueOrReactive } from '@shared/util-types';
import { IsFinalStep } from '../../providers';
import { extractActionPayload } from './extract-action-payload.util';
import { createInternalAction } from '../action.util';
import { composePipeline, withFilterAsync, withInjector } from '../shared';
import { onGuardReject } from './effect-hooks.util';
import { map, Observable } from 'rxjs';

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

export const rxEffect = <Input>(options: RxEffectOptions<Input>) => {
  const injector = getInjector(options);
  const actions = getActions(options, injector);

  const effectPipeline = getRxEffectPipeline(options);

  const inputWithInjector$ = withInjector(actions.actionPayload$, injector);

  runInInjectionContext(getEffectFnInjector(injector), () => {
    options.effectFn(extractInput(effectPipeline(inputWithInjector$)));
  });

  return (payload: ValueOrReactive<Input>): void => {
    actions.dispatch(payload);
  };
};
