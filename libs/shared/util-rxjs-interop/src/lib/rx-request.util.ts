import { HttpErrorResponse } from '@angular/common/http';
import { Injector, inject, runInInjectionContext } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  AppError,
  HttpErrorHandlersMap,
  catchAppError,
  handleError,
} from '@shared/util-error-handling';
import { getValue } from '@shared/util-helpers';
import { RequestStatus } from '@shared/util-store';
import { ValueOrFactory } from '@shared/util-types';
import { Observable, pipe, tap, switchMap, from, filter, take } from 'rxjs';

export interface RxRequestParams<Input = void, Response = unknown> {
  requestFn: (input: Input) => Observable<Response> | Promise<Response>;
  store?: Partial<{
    setError(error: AppError<HttpErrorResponse> | null): void;
    setRequestStatus(status: RequestStatus): void;
  }>;
  errorHandler?: ValueOrFactory<Partial<HttpErrorHandlersMap>>;
  shouldFetch?: (input: Input) => boolean;
  onError?: (error: AppError<HttpErrorResponse>, input: Input) => void;
  onSuccess?: (response: Response, input: Input) => void;
  once?: boolean;
}

export const rxRequest = <Input = void, Response = unknown>(
  params: RxRequestParams<Input, Response>
) => {
  const injector = inject(Injector);

  const pipeline = pipe(
    filter((input: Input) =>
      params.shouldFetch ? params.shouldFetch(input) : true
    ),
    tap(() => {
      params.store?.setRequestStatus?.('Loading');
    }),
    switchMap((input: Input) =>
      from(runInInjectionContext(injector, () => params.requestFn(input))).pipe(
        tap((response) => {
          params.store?.setRequestStatus?.('Success');

          runInInjectionContext(injector, () => {
            params.onSuccess?.(response, input);
            params.store?.setError?.(null);
          });
        }),
        catchAppError((error) => {
          runInInjectionContext(injector, () => {
            params.onError?.(error, input);
            handleError(error, getValue(params.errorHandler));
          });

          params.store?.setError?.(error);
          params.store?.setRequestStatus?.('Failed');
        })
      )
    )
  );

  return rxMethod<Input>(params.once ? pipe(pipeline, take(1)) : pipeline);
};

export interface FetchEntitiesParams<Entity, Input = void>
  extends RxRequestParams<Input, Entity[]> {
  store: RxRequestParams<Input, Entity[]>['store'] & {
    setAllEntities(collection: Entity[]): void;
  };
}

export const fetchEntities = <Entity, Input = void>(
  params: FetchEntitiesParams<Entity, Input>
) => {
  return rxRequest<Input, Entity[]>({
    ...params,
    requestFn: (input) =>
      from(params.requestFn(input)).pipe(
        tap((collection) => {
          params.store.setAllEntities(collection);
        })
      ),
  });
};