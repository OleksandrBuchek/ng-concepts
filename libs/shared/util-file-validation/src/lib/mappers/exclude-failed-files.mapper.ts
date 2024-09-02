import { hasValidationError } from '@shared/util-helpers';
import { FilesValidatorResult } from '../models';

interface MapValidatedFilesProps {
  excludeFailed: boolean;
}

export const mapValidatedFiles = (
  result: FilesValidatorResult,
  props: Partial<MapValidatedFilesProps> = { excludeFailed: true }
): File[] => {
  if (hasValidationError(result.errors) && props.excludeFailed) {
    return [];
  }

  const filteredFiles = props.excludeFailed
    ? result.files.filter(({ errors }) => hasValidationError(errors) === false)
    : result.files;

  return filteredFiles.map(({ file }) => file);
};
