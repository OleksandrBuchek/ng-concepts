import { Injector, inject, runInInjectionContext } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { AppError, catchAppError, handleError } from '@shared/util-error-handling';
import { getValue } from '@shared/util-helpers';
import { pipe, tap, switchMap, from, filter, take, map } from 'rxjs';
import {
  FetchEntitiesParams,
  RxRequestParams,
  RxRequestPipeline,
  RxRequestPipelineModifierFn,
  RxRequestPipelineInput,
} from '../models';
import { EffectErrorHandler, EffectLoadingStore } from '../providers';
import { ValueOrReactive } from '@shared/util-types';
import { asObservable } from '@shared/util-rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';

const handleErrorFor = <Input = void, Response = unknown>(
  input: Input,
  error: AppError<HttpErrorResponse>,
  params: Pick<RxRequestParams<Input, Response>, 'onError' | 'errorHandler' | 'store'>
) => {
  params.store?.setError?.(error);
  params.onError?.(error, input);
  handleError(error, getValue(params.errorHandler) ?? {});
  params.store?.setRequestStatus?.('Failed');
};

const handleSuccessFor = <Input = void, Response = unknown>(
  input: Input,
  response: Response,
  params: Pick<RxRequestParams<Input, Response>, 'store' | 'onSuccess'>
) => {
  params.store?.setError?.(null);
  params.onSuccess?.(response, input);
  params.store?.setRequestStatus?.('Success');
};

const withSingleInvocation =
  <Input = void, Response = unknown>(params: RxRequestParams<Input, Response>) =>
  (pipeline: RxRequestPipeline<Input>) => {
    return params.once ? pipe(pipeline, take(1)) : pipeline;
  };

const withFilter =
  <Input = void, Response = unknown>(params: RxRequestParams<Input, Response>) =>
  (pipeline: RxRequestPipeline<Input>) => {
    const shouldFetch = params.shouldFetch;

    return shouldFetch
      ? pipe(
          filter<RxRequestPipelineInput<Input>>(({ input }) => shouldFetch(input)),
          pipeline
        )
      : pipeline;
  };

const composePipeline =
  <Input = void>(...modifications: Array<RxRequestPipelineModifierFn<Input>>) =>
  (pipelineBase: RxRequestPipeline<Input>): RxRequestPipeline<Input> => {
    return modifications.reduce((pipeline, modifyPipeline) => modifyPipeline(pipeline), pipelineBase);
  };

const getRequestPipeline = <Input = void, Response = unknown>(params: RxRequestParams<Input, Response>) => {
  const pipeline = pipe(
    tap<RxRequestPipelineInput<Input>>(() => {
      params.store?.setRequestStatus?.('Loading');
    }),
    switchMap(({ input, injector }: RxRequestPipelineInput<Input>) => {
      const request$ = from(runInInjectionContext(injector, () => params.requestFn(input)));

      return request$.pipe(
        tap((response) => {
          runInInjectionContext(injector, () => {
            handleSuccessFor(input, response, params);
          });
        }),
        catchAppError((error) => {
          runInInjectionContext(injector, () => {
            handleErrorFor(input, error, {
              store: EffectLoadingStore.injectAsOptional(),
              errorHandler: EffectErrorHandler.injectAsOptional(),
            });

            handleErrorFor(input, error, params);
          });
        })
      );
    })
  );

  return pipeline;
};

const getPipeline = <Input = void, Response = unknown>(params: RxRequestParams<Input, Response>) => {
  return composePipeline(withFilter(params), withSingleInvocation(params))(getRequestPipeline(params));
};

export const rxRequest = <Input = void, Response = unknown>(params: RxRequestParams<Input, Response>) => {
  const outerInjector = inject(Injector);

  const runPipeline = rxMethod(getPipeline(params));

  return (input: ValueOrReactive<Input>) => {
    const injector = inject(Injector, { optional: true }) ?? outerInjector;

    const pipelineInput$ = asObservable(input).pipe(map((input) => ({ input, injector })));

    return runPipeline(pipelineInput$);
  };
};

export const fetchEntities = <Entity, Input = void>(params: FetchEntitiesParams<Entity, Input>) => {
  return rxRequest<Input, Entity[]>({
    ...params,
    onSuccess: (response) => {
      params.store.setAllEntities(response);
    },
  });
};
