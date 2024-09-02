import { HttpErrorResponse } from '@angular/common/http';
import {
  ObservableInput,
  OperatorFunction,
  ObservedValueOf,
  catchError,
  EMPTY,
  isObservable,
} from 'rxjs';
import { AppError } from '../classes/error';
import { CatchErrorHandlerFn } from '../models';

export const catchAppError = <
  TError = HttpErrorResponse,
  TValue = unknown,
  TOutputValue extends ObservableInput<any> = ObservableInput<any>
>(
  handler?: CatchErrorHandlerFn<TError, TValue, TOutputValue>
): OperatorFunction<TValue, TValue | ObservedValueOf<TOutputValue> | never> => {
  return catchError((error, caught$) => {
    if (!handler) {
      return EMPTY;
    }

    const pgError =
      error instanceof AppError
        ? (error as AppError<TError>)
        : new AppError<TError>(error);

    const observableOrVoid = handler(pgError, caught$);

    return isObservable(observableOrVoid) ? observableOrVoid : EMPTY;
  });
};
