import { hasValidationError } from '@shared/util-helpers';
import { FilesValidatorResult } from '../models';

export const hasFailedFiles = (result: FilesValidatorResult): boolean => {
  if (hasValidationError(result.errors)) {
    return true;
  }

  return result.files.some(({ errors }) => hasValidationError(errors));
};
