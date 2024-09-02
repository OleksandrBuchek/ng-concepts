import {
  InputSignal,
  InputSignalWithTransform,
  OutputEmitterRef,
} from '@angular/core';
import { OmitNever } from '@shared/util-types';

export type ExtractInputSignalsValues<T extends object> = OmitNever<{
  [Key in keyof T]: T[Key] extends InputSignal<infer ValueType>
    ? ValueType
    : T[Key] extends InputSignalWithTransform<any, infer ValueType>
    ? ValueType
    : never;
}>;

export type ExtractOutputEmitterRefs<T extends object> = OmitNever<{
  [Key in keyof T]: T[Key] extends OutputEmitterRef<infer ValueType>
    ? OutputEmitterRef<ValueType>
    : never;
}>;
