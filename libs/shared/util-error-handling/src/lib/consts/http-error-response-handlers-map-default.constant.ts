import { HttpStatusCode } from '@angular/common/http';
import { HttpErrorHandlersMap } from '../models';

export const HTTP_ERROR_RESPONSE_HANDLERS_MAP_DEFAULT: Partial<HttpErrorHandlersMap> = {
  [HttpStatusCode.InternalServerError]: () => ({}),
};
