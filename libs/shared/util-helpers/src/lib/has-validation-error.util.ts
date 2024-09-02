import { ValidationErrors } from '@angular/forms';
import { objectValues } from '@shared/util-object';

export const hasValidationError = (
  errors: ValidationErrors | null
): boolean => {
  return Boolean(objectValues(errors ?? {}).length);
};
