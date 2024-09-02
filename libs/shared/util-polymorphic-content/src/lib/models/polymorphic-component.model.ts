import { OutputEmitterRef, Provider, Type } from '@angular/core';
import {
  ValuesOrReactivesMap,
  AsSignals,
  ObjectValues,
  OmitNullish,
  OptionalUndefinedProperties,
} from '@shared/util-types';
import { PolymorphicComponent } from '../classes';
import {
  ExtractInputSignalsValues,
  ExtractOutputEmitterRefs,
} from './extract-signal-inputs-and-outputs.model';

export type PolymorphicComponentOrFactory<TComponent extends Type<any>> =
  | PolymorphicComponent<TComponent>
  | PolymorphicComponentFactory<TComponent>;

export type PolymorphicComponentInputs<TComponent extends Type<any>> =
  ValuesOrReactivesMap<
    OptionalUndefinedProperties<
      ExtractInputSignalsValues<InstanceType<TComponent>>
    >
  >;

export type PolymorphicComponentOutputsHandlers<TComponent extends Type<any>> =
  {
    [Key in keyof ExtractOutputEmitterRefs<
      InstanceType<TComponent>
    >]: ExtractOutputEmitterRefs<
      InstanceType<TComponent>
    >[Key] extends OutputEmitterRef<infer ValueType>
      ? (value: ValueType) => void
      : never;
  };

export type PolymorphicComponentContext<TComponent extends Type<any>> =
  AsSignals<ExtractInputSignalsValues<InstanceType<TComponent>>>;

export type ValueOrNever<TValue extends object> =
  ObjectValues<TValue> extends never[] ? never : TValue;

type PolymorphicComponentParamsBase = {
  className?: string | string[];
  providers?: Provider[];
};

export type PolymorphicComponentParams<
  TComponent extends Type<any> = Type<any>
> = PolymorphicComponentParamsBase &
  OmitNullish<{
    inputs: ValueOrNever<PolymorphicComponentInputs<TComponent>>;
    outputsHandlers?: ValueOrNever<
      Partial<PolymorphicComponentOutputsHandlers<TComponent>>
    >;
  }>;

export type PolymorphicComponentParamsPartial<
  TComponent extends Type<any> = Type<any>
> = PolymorphicComponentParamsBase &
  OmitNullish<
    Partial<{
      inputs: ValueOrNever<Partial<PolymorphicComponentInputs<TComponent>>>;
      outputsHandlers: ValueOrNever<
        Partial<PolymorphicComponentOutputsHandlers<TComponent>>
      >;
    }>
  >;

export type PolymorphicComponentFactory<TComponent extends Type<any>> = (
  params: PolymorphicComponentParams<TComponent>
) => PolymorphicComponent<TComponent>;

export type PolymorphicComponentRestParams<
  TComponent extends Type<any>,
  PartialParams extends PolymorphicComponentParamsPartial<TComponent>
> = PolymorphicComponentParams<
  Type<
    Omit<
      InstanceType<TComponent>,
      PartialParams extends {
        inputs: Partial<PolymorphicComponentInputs<TComponent>>;
        outputsHandlers: Partial<
          PolymorphicComponentOutputsHandlers<TComponent>
        >;
      }
        ? keyof PartialParams['inputs'] & keyof PartialParams['outputsHandlers']
        : PartialParams extends {
            inputs: Partial<PolymorphicComponentInputs<TComponent>>;
          }
        ? keyof PartialParams['inputs']
        : PartialParams extends {
            outputsHandlers: Partial<
              PolymorphicComponentOutputsHandlers<TComponent>
            >;
          }
        ? keyof PartialParams['outputsHandlers']
        : ''
    >
  >
>;
