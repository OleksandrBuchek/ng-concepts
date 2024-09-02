import { HttpErrorResponse } from '@angular/common/http';
import { AppError } from '@shared/util-error-handling';

export type Idle = { status: 'Idle' };
export type Loading = { status: 'Loading' };
export type Loaded = { status: 'Success' };
export type LoadedWithData<TData> = { status: 'Success'; data: TData };
export type Failed = { status: 'Failed'; error: AppError<HttpErrorResponse> };

export type DataLoadingState<TData> =
  | Idle
  | Loading
  | Failed
  | LoadedWithData<TData>;
export type LoadingState = Idle | Loading | Failed | Loaded;

export type CombinedData<T extends Record<string, DataLoadingState<any>>> = {
  [Key in keyof T]: T[Key] extends DataLoadingState<infer Data> ? Data : never;
};
