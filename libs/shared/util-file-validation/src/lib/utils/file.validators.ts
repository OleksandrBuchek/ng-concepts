import { ValidationErrors } from '@angular/forms';
import { FileMIMEType } from '@shared/util-file';
import { FileValidatorFn } from '../models';
import { ValueOrFactory } from '@shared/util-types';
import { getValue } from '@shared/util-helpers';

export const validateMaxSize =
  (max: number): FileValidatorFn =>
  (file: File): ValidationErrors | null => {
    return file.size > max ? { validMaxSize: true } : null;
  };

export const validateMinSize =
  (min: number): FileValidatorFn =>
  (file: File): ValidationErrors | null => {
    return file.size < min ? { validMinSize: true } : null;
  };

export const validateFileType = (
  allowedTypes: FileMIMEType[]
): FileValidatorFn => {
  const allowedTypesSet = new Set(allowedTypes);

  return (file: File): ValidationErrors | null =>
    allowedTypesSet.has(file.type as FileMIMEType) ? null : { validType: true };
};

export const validateFilesListMaxLength =
  (max: number, uploadedFilesCount: ValueOrFactory<number>) =>
  (files: File[]): ValidationErrors | null => {
    return files.length + getValue(uploadedFilesCount) > max
      ? { filesLengthMax: true }
      : null;
  };
