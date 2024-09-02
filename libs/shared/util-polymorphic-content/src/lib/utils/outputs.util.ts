import { Type } from '@angular/core';
import {
  PolymorphicComponentParams,
  PolymorphicComponentParamsPartial,
  ValueOrNever,
  PolymorphicComponentOutputsHandlers,
} from '../models';

export const getOutputHandlersFromParams = <TComponent extends Type<any>>(
  params?:
    | PolymorphicComponentParams<TComponent>
    | PolymorphicComponentParamsPartial<TComponent>
): ValueOrNever<Partial<PolymorphicComponentOutputsHandlers<TComponent>>> => {
  return (
    typeof params === 'object' && 'outputsHandlers' in params
      ? params.outputsHandlers ?? {}
      : {}
  ) as ValueOrNever<Partial<PolymorphicComponentOutputsHandlers<TComponent>>>;
};

export const createOutputsHandlersFor =
  <TComponent extends Type<any>>(_: TComponent) =>
  (outputsHandlers: PolymorphicComponentOutputsHandlers<TComponent>) =>
    outputsHandlers;

export const getOutputHandlers = <TComponent extends Type<any>>(
  handlers: Partial<PolymorphicComponentOutputsHandlers<TComponent>>
): Partial<PolymorphicComponentOutputsHandlers<TComponent>> => handlers;
