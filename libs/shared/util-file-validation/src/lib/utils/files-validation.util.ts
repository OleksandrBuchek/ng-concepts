import { combineLatest, map, Observable, of } from 'rxjs';
import {
  FileValidatorFn,
  FilesValidatorOptions,
  ValidateFileResult,
  ValidateFilesListResult,
  FilesListValidatorFn,
  FilesValidatorResult,
  FileAsyncValidatorFn,
} from '../models';
import {
  validateFilesListMaxLength,
  validateFileType,
  validateMaxSize,
} from './file.validators';
import { ValidationErrors } from '@angular/forms';
import { isNullOrUndefined } from '@shared/util-helpers';

export class FilesValidator {
  private readonly fileValidators: FileValidatorFn[];
  private readonly fileAsyncValidators: FileAsyncValidatorFn[];
  private readonly filesListValidators: FilesListValidatorFn[];

  constructor(private readonly options: FilesValidatorOptions) {
    this.fileValidators = this.getFileValidators();
    this.fileAsyncValidators = this.getFileAsyncValidators();
    this.filesListValidators = this.getFilesListValidators();
  }

  public validateFiles(inputFiles: File[]): Observable<FilesValidatorResult> {
    const validateFileResults$ = combineLatest(
      [
        inputFiles.map((file) => of(this.validateFile(file))),
        inputFiles.map((file) => this.validateFileAsync(file)),
      ].flat()
    ).pipe(map((results) => this.groupValidationResultsByFile(results)));

    const validateFilesListResult$ = of(this.validateFilesList(inputFiles));

    return combineLatest([validateFileResults$, validateFilesListResult$]).pipe(
      map(([files, { errors }]) => ({
        files,
        errors,
      }))
    );
  }

  private validateFile(file: File): ValidateFileResult {
    return {
      file,
      errors: this.combineErrors(
        this.fileValidators.map((validate) => validate(file))
      ),
    };
  }

  private validateFileAsync(file: File): Observable<ValidateFileResult> {
    const validationResults$ = this.fileAsyncValidators.map((validateAsync) =>
      validateAsync(file)
    );

    return (
      validationResults$.length ? combineLatest(validationResults$) : of([])
    ).pipe(
      map((errors) => ({
        file,
        errors: this.combineErrors(errors),
      }))
    );
  }

  private validateFilesList(files: File[]): ValidateFilesListResult {
    return {
      files,
      errors: this.combineErrors(
        this.filesListValidators.map((validate) => validate(files))
      ),
    };
  }

  private getFileValidators(): FileValidatorFn[] {
    return [
      this.options.fileValidators ?? [],
      validateMaxSize(this.options.fileSizeMax),
      validateFileType(this.options.allowedTypes),
    ].flat();
  }

  private getFileAsyncValidators(): FileAsyncValidatorFn[] {
    return this.options.fileAsyncValidators ?? [];
  }

  private getFilesListValidators(): FilesListValidatorFn[] {
    return [
      validateFilesListMaxLength(
        this.options.filesListLengthMax,
        this.options.$uploadedFilesCount
      ),
    ];
  }

  private combineErrors(
    errors: Array<ValidationErrors | null | undefined>
  ): ValidationErrors {
    return errors
      .filter(
        (error): error is ValidationErrors => isNullOrUndefined(error) === false
      )
      .reduce((acc, curr) => ({ ...acc, ...curr }), {} as ValidationErrors);
  }

  private groupValidationResultsByFile(
    results: ValidateFileResult[]
  ): ValidateFileResult[] {
    const grouped = results.reduce((acc, { file, errors }) => {
      acc.set(file, this.combineErrors([acc.get(file), errors]));

      return acc;
    }, new Map<ValidateFileResult['file'], ValidateFileResult['errors']>());

    return [...grouped.entries()].map(([file, errors]) => ({ file, errors }));
  }
}
