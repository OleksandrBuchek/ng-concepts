import { HttpStatusCode, HttpErrorResponse } from '@angular/common/http';
import { AppError } from '../classes/error';
import { ValueOrFactory } from '@shared/util-types';
import { getValue } from '@shared/util-helpers';
import { HttpErrorHandlersMap } from '../models';
import { HTTP_ERROR_RESPONSE_HANDLERS_MAP_DEFAULT } from '../consts/http-error-response-handlers-map-default.constant';

export const createHttpErrorHandlersMap = (override: Partial<HttpErrorHandlersMap> = {}) => ({
  ...HTTP_ERROR_RESPONSE_HANDLERS_MAP_DEFAULT,
  ...override,
});

export const handleError = (
  error: AppError<HttpErrorResponse>,
  handlersMapOrFactory?: ValueOrFactory<Partial<HttpErrorHandlersMap>>
): void => {
  const handlersOverride = getValue(handlersMapOrFactory) ?? {};

  const handlersMap: Partial<HttpErrorHandlersMap> = {
    ...HTTP_ERROR_RESPONSE_HANDLERS_MAP_DEFAULT,
    ...handlersOverride,
  };

  const handler = handlersMap[error.origin.status as HttpStatusCode];

  handler?.(error);
};
