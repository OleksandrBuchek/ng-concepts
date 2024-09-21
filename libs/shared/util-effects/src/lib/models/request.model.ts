import { HttpErrorResponse } from '@angular/common/http';
import { Injector } from '@angular/core';
import { AppError, HttpErrorHandlersMap } from '@shared/util-error-handling';
import { ValueOrFactory } from '@shared/util-types';
import { Observable, UnaryFunction } from 'rxjs';
import { RequestStore } from './effect-store.model';

export type RxRequestPipelineInput<Input> = {
  input: Input;
  injector: Injector;
};

export type RxRequestPipeline<Input = void, Response = unknown> = UnaryFunction<
  Observable<RxRequestPipelineInput<Input>>,
  Observable<Response>
>;

export type RxRequestPipelineModifierFn<Input = void, Response = unknown> = (
  pipeline: RxRequestPipeline<Input, Response>
) => RxRequestPipeline<Input, Response>;

export interface RxRequestOptions<Input = void, Response = unknown> {
  requestFn: (input: Input) => Observable<Response> | Promise<Response>;
  store?: Partial<RequestStore> | null;
  errorHandler?: ValueOrFactory<Partial<HttpErrorHandlersMap>> | null;
  shouldFetch?: (input: Input) => boolean;
  onError?: (error: AppError<HttpErrorResponse>, input: Input) => void;
  onSuccess?: (response: Response, input: Input) => void;
  once?: boolean;
  before?: () => void;
  retry?: { count: number } & Partial<{ delay: number }>;
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
