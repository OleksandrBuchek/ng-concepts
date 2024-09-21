import { Injector, inject, runInInjectionContext } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { AppError, catchAppError, handleError } from '@shared/util-error-handling';
import { getValue } from '@shared/util-helpers';
import { pipe, tap, switchMap, from, map } from 'rxjs';
import { RxRequestOptions, RxRequestPipeline, RxRequestPipelineInput } from '../../models';
import { IsFinalStep } from '../../providers';
import { ValueOrReactive } from '@shared/util-types';
import { asObservable } from '@shared/util-rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { composePipeline, withFilter, withRetry, withSingleInvocation } from './pipeline-modifiers.util';
import { injectRequestOptions } from '../injectors';

const handleErrorFor = <Input = void, Response = unknown>(
  input: Input,
  error: AppError<HttpErrorResponse>,
  options: Pick<RxRequestOptions<Input, Response>, 'onError' | 'errorHandler' | 'store'>
) => {
  options.store?.setError?.(error);
  options.onError?.(error, input);
  handleError(error, getValue(options.errorHandler) ?? {});
  options.store?.setRequestStatus?.('Failed');
};

const handleSuccessFor = <Input = void, Response = unknown>(
  input: Input,
  response: Response,
  options: Pick<RxRequestOptions<Input, Response>, 'store' | 'onSuccess'>
) => {
  options.store?.setError?.(null);
  options.onSuccess?.(response, input);
  options.store?.setRequestStatus?.('Success');
};

const getMainPipeline = <Input = void, Response = unknown>(
  performRequest: RxRequestPipeline<Input, Response>,
  options: RxRequestOptions<Input, Response>
) => {
  const pipeline = pipe(
    tap<RxRequestPipelineInput<Input>>(({ injector }) => {
      runInInjectionContext(injector, () => {
        options.before?.();
      });
      options.store?.setRequestStatus?.('Loading');
    }),
    switchMap(({ input, injector }: RxRequestPipelineInput<Input>) => {
      return performRequest(asObservable({ input, injector })).pipe(
        tap((response) => {
          runInInjectionContext(injector, () => {
            handleSuccessFor(input, response, options);

            if (IsFinalStep.injectAsOptional()) {
              handleSuccessFor(input, response, injectRequestOptions());
            }
          });
        }),
        catchAppError((error) => {
          runInInjectionContext(injector, () => {
            handleErrorFor(input, error, injectRequestOptions());
            handleErrorFor(input, error, options);
          });
        })
      );
    })
  );

  return pipeline;
};

const getRxRequestPipeline = <Input = void, Response = unknown>(options: RxRequestOptions<Input, Response>) => {
  const composeMainPipeline = composePipeline(withFilter(options), withSingleInvocation(options));

  const composeRequestPipeline = composePipeline(withRetry(options));

  const requestPipeline = composeRequestPipeline(
    pipe(switchMap(({ injector, input }) => from(runInInjectionContext(injector, () => options.requestFn(input)))))
  );

  return composeMainPipeline(getMainPipeline(requestPipeline, options));
};

export const rxRequest = <Input = void, Response = unknown>(options: RxRequestOptions<Input, Response>) => {
  const outerInjector = inject(Injector);

  const runPipeline = rxMethod(getRxRequestPipeline(options));

  return (input: ValueOrReactive<Input>) => {
    const injector = inject(Injector, { optional: true }) ?? outerInjector;

    const pipelineInput$ = asObservable(input).pipe(map((input) => ({ input, injector })));

    return runPipeline(pipelineInput$);
  };
};
