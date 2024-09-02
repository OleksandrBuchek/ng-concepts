import { Signal } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { FileMIMEType } from '@shared/util-file';
import { Observable } from 'rxjs';

export type FileValidatorFn = (file: File) => ValidationErrors | null;
export type FileAsyncValidatorFn = (
  file: File
) => Observable<ValidationErrors | null>;
export type FilesListValidatorFn = (files: File[]) => ValidationErrors | null;

export interface FilesValidatorOptions {
  fileSizeMax: number;
  filesListLengthMax: number;
  allowedTypes: FileMIMEType[];
  fileValidators?: FileValidatorFn[];
  fileAsyncValidators?: FileAsyncValidatorFn[];
  $uploadedFilesCount: Signal<number>;
}

export interface ValidateFileResult {
  file: File;
  errors: ValidationErrors | null;
}

export interface ValidateFilesListResult {
  files: File[];
  errors: ValidationErrors | null;
}

export interface FilesValidatorResult {
  files: ValidateFileResult[];
  errors: ValidationErrors | null;
}
