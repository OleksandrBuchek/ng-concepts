import { HttpErrorResponse } from '@angular/common/http';
import { Injector } from '@angular/core';
import { AppError, HttpErrorHandlersMap } from '@shared/util-error-handling';
import { ValueOrFactory } from '@shared/util-types';
import { Observable } from 'rxjs';
import { EffectState } from './effect-store.model';

export type RxRequestPipelineParams<Input> = {
  input: Input;
  injector: Injector;
};

export interface RxRequestParams<Input = void, Response = unknown> {
  requestFn: (input: Input) => Observable<Response> | Promise<Response>;
  store?: Partial<EffectState>;
  errorHandler?: ValueOrFactory<Partial<HttpErrorHandlersMap>>;
  shouldFetch?: (input: Input) => boolean;
  onError?: (error: AppError<HttpErrorResponse>, input: Input) => void;
  onSuccess?: (response: Response, input: Input) => void;
  once?: boolean;
}

export interface FetchEntitiesParams<Entity, Input = void> extends RxRequestParams<Input, Entity[]> {
  store: RxRequestParams<Input, Entity[]>['store'] & {
    setAllEntities(collection: Entity[]): void;
  };
}
