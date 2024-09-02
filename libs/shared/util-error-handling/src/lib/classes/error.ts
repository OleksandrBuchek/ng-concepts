import { HttpErrorResponse } from '@angular/common/http';
import { isObject } from 'lodash-es';
import { tryCatch } from '@shared/util-try-catch';

interface RequestError {
  message: string;
}

const isRequestError = (error: unknown): error is RequestError => {
  return hasMessage(error);
};

const hasMessage = (error: unknown): error is { message: string } => {
  return (
    isObject(error) &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  );
};

const getErrorMessageFromObject = (
  error: Record<string, unknown>
): string | undefined => {
  if (hasMessage(error)) {
    return error.message;
  }

  if (isRequestError(error)) {
    return error.message;
  }

  return undefined;
};

const getErrorMessageFromJson = (error: string): string | undefined => {
  const json = tryCatch<Record<string, unknown>>(() => JSON.parse(error));

  // probably not a json string. just return the original string
  if (json instanceof Error) {
    return error;
  }

  return getErrorMessageFromObject(json);
};

const getErrorMessage = (error: unknown): string | undefined => {
  if (typeof error === 'string') {
    return getErrorMessageFromJson(error);
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error instanceof HttpErrorResponse) {
    return getErrorMessage(error.error);
  }

  if (isObject(error)) {
    return getErrorMessageFromObject(error as Record<string, unknown>);
  }

  return undefined;
};

const ERROR_MESSAGE_DEFAULT = 'Unexpected error';

export class AppError<T = HttpErrorResponse> extends Error {
  override readonly name = this.constructor.name;
  override readonly message: string;
  override readonly stack: string | undefined;

  readonly origin: T;
  readonly unknown: boolean;

  constructor(error: T | AppError<T>) {
    super('');

    this.origin = error instanceof AppError ? error.origin : error;
    this.stack = new Error().stack;

    const message = getErrorMessage(origin);

    this.message = message ?? ERROR_MESSAGE_DEFAULT;

    this.unknown = !message;
  }
}
