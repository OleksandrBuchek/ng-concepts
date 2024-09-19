import { pipe, take, filter, retry as retryOperator } from 'rxjs';
import { RxRequestParams, RxRequestPipeline, RxRequestPipelineInput, RxRequestPipelineModifierFn } from '../../models';

export const withSingleInvocation =
  <Input = void, Response = unknown>(params: RxRequestParams<Input, Response>) =>
  (pipeline: RxRequestPipeline<Input, Response>) => {
    return params.once ? pipe(pipeline, take(1)) : pipeline;
  };

export const withFilter =
  <Input = void, Response = unknown>(params: RxRequestParams<Input, Response>) =>
  (pipeline: RxRequestPipeline<Input, Response>) => {
    const shouldFetch = params.shouldFetch;

    return shouldFetch
      ? pipe(
          filter<RxRequestPipelineInput<Input>>(({ input }) => shouldFetch(input)),
          pipeline
        )
      : pipeline;
  };

export const withRetry =
  <Input = void, Response = unknown>(params: RxRequestParams<Input, Response>) =>
  (pipeline: RxRequestPipeline<Input, Response>) => {
    const retry = params.retry;

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

export const composePipeline =
  <Input = void, Response = unknown>(...modifiers: Array<RxRequestPipelineModifierFn<Input, Response>>) =>
  (pipelineBase: RxRequestPipeline<Input, Response>): RxRequestPipeline<Input, Response> => {
    return modifiers.reduce((pipeline, modifyPipeline) => modifyPipeline(pipeline), pipelineBase);
  };
