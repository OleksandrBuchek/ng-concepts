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

export type RxRequestPipeline<Input = void> = UnaryFunction<
  Observable<RxRequestPipelineInput<Input>>,
  Observable<unknown>
>;

export type RxRequestPipelineModifierFn<Input = void> = (
  pipeline: RxRequestPipeline<Input>
) => RxRequestPipeline<Input>;

export interface RxRequestParams<Input = void, Response = unknown> {
  requestFn: (input: Input) => Observable<Response> | Promise<Response>;
  store?: Partial<RequestStore> | null;
  errorHandler?: ValueOrFactory<Partial<HttpErrorHandlersMap>> | null;
  shouldFetch?: (input: Input) => boolean;
  onError?: (error: AppError<HttpErrorResponse>, input: Input) => void;
  onSuccess?: (response: Response, input: Input) => void;
  once?: boolean;
  before?: () => void;
  retryCount?: number;
  retryDelay?: number;
}

export interface FetchEntitiesParams<Entity, Input = void> extends RxRequestParams<Input, Entity[]> {
  store: RxRequestParams<Input, Entity[]>['store'] & {
    setAllEntities(collection: Entity[]): void;
  };
}
