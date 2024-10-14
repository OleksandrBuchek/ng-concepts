import { HttpErrorResponse } from '@angular/common/http';
import { AppError, HttpErrorHandlersMap } from '@shared/util-error-handling';
import { ValueOrFactory } from '@shared/util-types';
import { Observable, OperatorFunction } from 'rxjs';
import { RequestStore } from './effect-store.model';
import { RxInjectablePipelineInput } from './method-pipeline-input.model';
import { CanActivateGuardFn } from './can-activate-guard-fn.model';

export type RxInjectablePipeline<Input = void, Response = unknown> = OperatorFunction<
  RxInjectablePipelineInput<Input>,
  Response
>;

export type RxInjectablePipelineModifierFn<Input = void, Response = unknown> = (
  pipeline: RxInjectablePipeline<Input, Response>
) => RxInjectablePipeline<Input, Response>;

export type RxRequestRetryOptions = { count: number } & Partial<{ delay: number }>;

export interface RxRequestOptions<Input = void, Response = unknown> {
  requestFn: (input: Input) => Observable<Response> | Promise<Response>;
  store?: Partial<RequestStore> | null;
  errorHandler?: ValueOrFactory<Partial<HttpErrorHandlersMap>> | null;
  canActivate?: CanActivateGuardFn<Input>;
  onError?: (error: AppError<HttpErrorResponse>, input: Input) => void;
  onSuccess?: (response: Response, input: Input) => void;
  once?: boolean;
  before?: () => void;
  retry?: RxRequestRetryOptions;
}

export interface FetchEntitiesOptions<Entity, Input = void> extends RxRequestOptions<Input, Entity[]> {
  store: RxRequestOptions<Input, Entity[]>['store'] & {
    setAllEntities(collection: Entity[]): void;
  };
}

export type ProvidableRxRequestOptions<Input = void, Response = unknown> = Pick<
  RxRequestOptions<Input, Response>,
  'errorHandler' | 'store' | 'onError' | 'onSuccess'
>;
