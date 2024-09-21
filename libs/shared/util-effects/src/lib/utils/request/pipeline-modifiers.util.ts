import { pipe, take, filter, retry as retryOperator } from 'rxjs';
import { RxRequestOptions, RxRequestPipeline, RxRequestPipelineInput, RxRequestPipelineModifierFn } from '../../models';

export const withSingleInvocation =
  <Input = void, Response = unknown>(options: RxRequestOptions<Input, Response>) =>
  (pipeline: RxRequestPipeline<Input, Response>) => {
    return options.once ? pipe(pipeline, take(1)) : pipeline;
  };

export const withFilter =
  <Input = void, Response = unknown>(options: RxRequestOptions<Input, Response>) =>
  (pipeline: RxRequestPipeline<Input, Response>) => {
    const shouldFetch = options.shouldFetch;

    return shouldFetch
      ? pipe(
          filter<RxRequestPipelineInput<Input>>(({ input }) => shouldFetch(input)),
          pipeline
        )
      : pipeline;
  };

export const withRetry =
  <Input = void, Response = unknown>(options: RxRequestOptions<Input, Response>) =>
  (pipeline: RxRequestPipeline<Input, Response>) => {
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

export const composePipeline =
  <Input = void, Response = unknown>(...modifiers: Array<RxRequestPipelineModifierFn<Input, Response>>) =>
  (pipelineBase: RxRequestPipeline<Input, Response>): RxRequestPipeline<Input, Response> => {
    return modifiers.reduce((pipeline, modifyPipeline) => modifyPipeline(pipeline), pipelineBase);
  };
