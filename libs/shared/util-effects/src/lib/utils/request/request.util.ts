import { Injector, inject, runInInjectionContext } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { AppError, catchAppError, handleError } from '@shared/util-error-handling';
import { getValue } from '@shared/util-helpers';
import { pipe, tap, switchMap, from, map } from 'rxjs';
import { RxRequestParams, RxRequestPipeline, RxRequestPipelineInput } from '../../models';
import { IsFinalRequest, RequestErrorHandler, RequestLoadingStore } from '../../providers';
import { ValueOrReactive } from '@shared/util-types';
import { asObservable } from '@shared/util-rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { composePipeline, withFilter, withRetry, withSingleInvocation } from './pipeline-modifiers.util';

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

const getMainPipeline = <Input = void, Response = unknown>(
  requestPipeline: RxRequestPipeline<Input, Response>,
  params: RxRequestParams<Input, Response>
) => {
  const pipeline = pipe(
    tap<RxRequestPipelineInput<Input>>(() => {
      params.before?.();
      params.store?.setRequestStatus?.('Loading');
    }),
    switchMap(({ input, injector }: RxRequestPipelineInput<Input>) => {
      return requestPipeline(asObservable({ input, injector })).pipe(
        tap((response) => {
          runInInjectionContext(injector, () => {
            handleSuccessFor(input, response, params);

            if (IsFinalRequest.injectAsOptional()) {
              handleSuccessFor(input, response, {
                store: RequestLoadingStore.injectAsOptional(),
              });
            }
          });
        }),
        catchAppError((error) => {
          runInInjectionContext(injector, () => {
            handleErrorFor(input, error, {
              store: RequestLoadingStore.injectAsOptional(),
              errorHandler: RequestErrorHandler.injectAsOptional(),
            });

            handleErrorFor(input, error, params);
          });
        })
      );
    })
  );

  return pipeline;
};

const getRxRequestPipeline = <Input = void, Response = unknown>(params: RxRequestParams<Input, Response>) => {
  const composeMainPipeline = composePipeline(withFilter(params), withSingleInvocation(params));

  const composeRequestPipeline = composePipeline(withRetry(params));

  const requestPipeline = composeRequestPipeline(
    pipe(switchMap(({ injector, input }) => from(runInInjectionContext(injector, () => params.requestFn(input)))))
  );

  return composeMainPipeline(getMainPipeline(requestPipeline, params));
};

export const rxRequest = <Input = void, Response = unknown>(params: RxRequestParams<Input, Response>) => {
  const outerInjector = inject(Injector);

  const runPipeline = rxMethod(getRxRequestPipeline(params));

  return (input: ValueOrReactive<Input>) => {
    const injector = inject(Injector, { optional: true }) ?? outerInjector;

    const pipelineInput$ = asObservable(input).pipe(map((input) => ({ input, injector })));

    return runPipeline(pipelineInput$);
  };
};

