import { Inject, Injector, inject, runInInjectionContext } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { AppError, catchAppError, handleError } from '@shared/util-error-handling';
import { getValue } from '@shared/util-helpers';
import { pipe, tap, switchMap, from } from 'rxjs';
import {
  RxRequestOptions,
  RxInjectablePipeline,
  RxInjectablePipelineInput,
  ProvidableRxRequestOptions,
} from '../../models';
import { provideRequestOptions } from '../../providers';
import { ValueOrReactive } from '@shared/util-types';
import { asObservable } from '@shared/util-rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { injectRequestOptions } from '../injectors';
import { composePipeline, withFilterAsync, withInjector, withRetry, withSingleInvocation } from '../shared';
import { tryCatch } from '@shared/util-try-catch';

const getPipelineInjector = <Input = void, Response = unknown>(
  fallbackInjector: Injector,
  options: ProvidableRxRequestOptions<Input, Response>
): Injector => {
  const parent = tryCatch(() => inject(Injector, { optional: true }), fallbackInjector) ?? fallbackInjector;

  return Injector.create({
    parent,
    providers: [provideRequestOptions(options)],
  });
};

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
  performRequest: RxInjectablePipeline<Input, Response>,
  options: RxRequestOptions<Input, Response>
) => {
  const pipeline = pipe(
    tap<RxInjectablePipelineInput<Input>>(({ injector }) => {
      runInInjectionContext(injector, () => {
        options.before?.();
      });
      options.store?.setRequestStatus?.('Loading');
    }),
    switchMap(({ input, injector }: RxInjectablePipelineInput<Input>) => {
      return performRequest(asObservable({ input, injector })).pipe(
        tap((response) => {
          runInInjectionContext(injector, () => {
            handleSuccessFor(input, response, options);
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
  const composeMainPipeline = composePipeline<Input, Response>(
    withFilterAsync(options.canActivate),
    withSingleInvocation(options.once)
  );

  const composeRequestPipeline = composePipeline<Input, Response>(withRetry(options.retry));

  const requestPipeline = composeRequestPipeline(
    pipe(switchMap(({ injector, input }) => from(runInInjectionContext(injector, () => options.requestFn(input)))))
  );

  return composeMainPipeline(getMainPipeline(requestPipeline, options));
};

export const rxRequest = <Input = void, Response = unknown>(options: RxRequestOptions<Input, Response>) => {
  const outerInjector = inject(Injector);

  const runPipeline = rxMethod(getRxRequestPipeline(options));

  return (input: ValueOrReactive<Input>, inputInjector = outerInjector) => {
    const injector = getPipelineInjector(inputInjector ?? outerInjector, options);

    return runPipeline(withInjector(input, injector));
  };
};
