import { Type } from '@angular/core';
import {
  PolymorphicComponentParams,
  PolymorphicComponentParamsPartial,
  ValueOrNever,
  PolymorphicComponentInputs,
} from '../models';

export const getInputsFromParams = <TComponent extends Type<any>>(
  params?:
    | PolymorphicComponentParams<TComponent>
    | PolymorphicComponentParamsPartial<TComponent>
): ValueOrNever<PolymorphicComponentInputs<TComponent>> => {
  return (
    typeof params === 'object' && 'inputs' in params ? params.inputs ?? {} : {}
  ) as ValueOrNever<PolymorphicComponentInputs<TComponent>>;
};

export const createInputsFor =
  <TComponent extends Type<any>>(_: TComponent) =>
  (inputs: PolymorphicComponentInputs<TComponent>) =>
    inputs;
