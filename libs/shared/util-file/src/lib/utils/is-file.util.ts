import { isNullOrUndefined } from '@shared/util-helpers';

export const isFile = (value: File | unknown): value is File =>
  isNullOrUndefined(value) === false && value instanceof File;
