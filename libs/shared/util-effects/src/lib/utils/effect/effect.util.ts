import { inject, Injector, runInInjectionContext } from '@angular/core';
import { RxEffectOptions, RxInjectablePipelineInput } from '../../models';
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

const getEffectFnInput = <Input = void>(
  input$: Observable<Input>,
  injector: Injector,
  options: RxEffectOptions<Input>
): Observable<Input> => {
  const inputWithInjector$ = withInjector(input$, injector);

  const pipe = composePipeline<Input, RxInjectablePipelineInput<Input>>(
    withFilterAsync(options.canActivate, onGuardReject)
  )();

  return pipe(inputWithInjector$).pipe(map(({ input }) => input));
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

export const rxEffect = <Input>(options: RxEffectOptions<Input>) => {
  const injector = getInjector(options);
  const actions = getActions(options, injector);

  const input$ = getEffectFnInput(actions.actionPayload$, injector, options);

  runInInjectionContext(getEffectFnInjector(injector), () => {
    options.effectFn(input$);
  });

  return (payload: ValueOrReactive<Input>): void => {
    actions.dispatch(payload);
  };
};
