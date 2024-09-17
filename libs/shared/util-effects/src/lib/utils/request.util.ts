import { Injector, inject, runInInjectionContext } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchAppError, handleError } from '@shared/util-error-handling';
import { getValue } from '@shared/util-helpers';
import { pipe, tap, switchMap, from, filter, take, map } from 'rxjs';
import { FetchEntitiesParams, RxRequestParams, RxRequestPipelineParams } from '../models';
import { EffectErrorHandler, EffectLoadingStore } from '../providers';
import { ValueOrReactive } from '@shared/util-types';
import { asObservable } from '@shared/util-rxjs-interop';

export const rxRequest = <Input = void, Response = unknown>(params: RxRequestParams<Input, Response>) => {
  const pipeline = pipe(
    filter(({ input }: RxRequestPipelineParams<Input>) => (params.shouldFetch ? params.shouldFetch(input) : true)),
    tap(() => {
      params.store?.setRequestStatus?.('Loading');
    }),
    switchMap(({ input, injector }: RxRequestPipelineParams<Input>) =>
      from(runInInjectionContext(injector, () => params.requestFn(input))).pipe(
        tap((response) => {
          runInInjectionContext(injector, () => {
            params.store?.setRequestStatus?.('Success');

            params.onSuccess?.(response, input);
            params.store?.setError?.(null);
          });
        }),
        catchAppError((error) => {
          runInInjectionContext(injector, () => {
            const effectLoadingStore = EffectLoadingStore.injectAsOptional();
            effectLoadingStore?.setError(error);
            effectLoadingStore?.setRequestStatus('Failed');
            handleError(error, EffectErrorHandler.injectAsOptional() ?? {});

            params.store?.setError?.(error);
            params.store?.setRequestStatus?.('Failed');
            params.onError?.(error, input);
            handleError(error, getValue(params.errorHandler));
          });
        })
      )
    )
  );

  const outerInjector = inject(Injector);

  const callback = rxMethod<{ input: Input; injector: Injector }>(params.once ? pipe(pipeline, take(1)) : pipeline);

  return (input: ValueOrReactive<Input>) => {
    const injector = inject(Injector, { optional: true }) ?? outerInjector;

    return callback(asObservable(input).pipe(map((input) => ({ input, injector }))));
  };
};

export const fetchEntities = <Entity, Input = void>(params: FetchEntitiesParams<Entity, Input>) => {
  return rxRequest<Input, Entity[]>({
    ...params,
    requestFn: (input) =>
      from(params.requestFn(input)).pipe(
        tap((collection) => {
          params.store.setAllEntities(collection);
        })
      ),
  });
};
