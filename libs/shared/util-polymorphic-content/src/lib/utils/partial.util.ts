import { Type } from '@angular/core';
import { PolymorphicComponent } from '../classes';
import {
  PolymorphicComponentFactory,
  PolymorphicComponentInputs,
  PolymorphicComponentOutputsHandlers,
  PolymorphicComponentParams,
  PolymorphicComponentParamsPartial,
  PolymorphicComponentRestParams,
} from '../models';
import { toCssClass } from '@shared/util-helpers';
import { getInputsFromParams } from './inputs.util';
import { getOutputHandlersFromParams } from './outputs.util';

export const partial =
  <TComponent extends Type<any>>(
    factory: PolymorphicComponentFactory<TComponent>
  ) =>
  <PartialParams extends PolymorphicComponentParamsPartial<TComponent>>(
    partial: PartialParams
  ) =>
  (
    rest: PolymorphicComponentRestParams<TComponent, PartialParams>
  ): PolymorphicComponent<TComponent> => {
    return factory(mergePartialWithRestParams(partial, rest));
  };

export const mergePartialWithRestParams = <
  TComponent extends Type<any>,
  PartialParams extends PolymorphicComponentParamsPartial<TComponent>
>(
  partial: PartialParams,
  rest: PolymorphicComponentRestParams<TComponent, PartialParams>
): PolymorphicComponentParams<TComponent> => {
  const inputs = {
    ...getInputsFromParams(partial),
    ...getInputsFromParams(rest),
  } as PolymorphicComponentInputs<TComponent>;

  const outputsHandlers = {
    ...getOutputHandlersFromParams(partial),
    ...getOutputHandlersFromParams(rest),
  } as PolymorphicComponentOutputsHandlers<TComponent>;

  return {
    providers: [...(partial.providers ?? []), ...(rest.providers ?? [])],
    className: toCssClass(
      `${toCssClass(partial.className)} ${toCssClass(rest.className)}`
    ),
    inputs,
    outputsHandlers,
  } as unknown as PolymorphicComponentParams<TComponent>;
};
