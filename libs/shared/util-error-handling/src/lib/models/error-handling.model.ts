import { HttpStatusCode, HttpErrorResponse } from '@angular/common/http';
import { ObservableInput, Observable } from 'rxjs';
import { AppError } from '../classes';

export type HttpErrorHandlersMap = Record<
  HttpStatusCode,
  (error: AppError<HttpErrorResponse>) => void
>;

export type CatchErrorHandlerFn<
  TError,
  TValue,
  TOutputValue extends ObservableInput<any>
> = (
  error: AppError<TError>,
  caught$: Observable<TValue>
) => TOutputValue | void;
