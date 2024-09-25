import { pipe, take, filter, retry as retryOperator, map, Observable, switchMap, tap } from 'rxjs';
import {
  RxRequestOptions,
  RxInjectablePipeline,
  RxInjectablePipelineInput,
  RxInjectablePipelineModifierFn,
  CanActivateGuardFn,
} from '../../models';
import { runInInjectionContext } from '@angular/core';
import { asObservable } from '@shared/util-rxjs-interop';

export const withSingleInvocation =
  <Input = void, Response = unknown>(options: RxRequestOptions<Input, Response>) =>
  (pipeline: RxInjectablePipeline<Input, Response>) => {
    return options.once ? pipe(pipeline, take(1)) : pipeline;
  };

export const withFilterAsync =
  <Input = void, Response = unknown>(filterFn?: CanActivateGuardFn<Input>, onFilterReject?: () => void) =>
  (pipeline: RxInjectablePipeline<Input, Response>) => {
    return filterFn
      ? pipe(
          switchMap<RxInjectablePipelineInput<Input>, Observable<RxInjectablePipelineInput<Input>>>(
            ({ input, injector }) =>
              runInInjectionContext(injector, () => asObservable(filterFn(input, injector))).pipe(
                tap((success) => {
                  if (success === false && onFilterReject) {
                    runInInjectionContext(injector, () => onFilterReject());
                  }
                }),
                filter((success) => success),
                map(() => ({ input, injector }))
              )
          ),
          pipeline
        )
      : pipeline;
  };

export const withRetry =
  <Input = void, Response = unknown>(options: RxRequestOptions<Input, Response>) =>
  (pipeline: RxInjectablePipeline<Input, Response>) => {
    const retry = options.retry;

    return retry
      ? pipe(
          pipeline,
          retryOperator({
            count: retry.count,
            delay: retry.delay,
          })
        )
      : pipeline;
  };

const PIPELINE_DEFAULT = <Input>(source: Observable<Input>) => source;

export const composePipeline =
  <Input = void, Response = unknown>(...modifiers: Array<RxInjectablePipelineModifierFn<Input, Response>>) =>
  (
    pipelineBase: RxInjectablePipeline<Input, Response> = PIPELINE_DEFAULT as RxInjectablePipeline<Input, Response>
  ): RxInjectablePipeline<Input, Response> => {
    return modifiers.reduce((pipeline, modifyPipeline) => modifyPipeline(pipeline), pipelineBase);
  };
