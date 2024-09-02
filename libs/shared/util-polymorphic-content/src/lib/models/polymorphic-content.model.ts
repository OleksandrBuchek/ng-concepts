import { InputSignal, TemplateRef, Type } from '@angular/core';
import { PolymorphicComponent } from '../classes';
import { ValueOrReactive } from '@shared/util-types';

export type TemplateWithContext<T> = {
  templateRef: TemplateRef<T>;
  context: T;
};

export type PolymorphicPrimitive = ValueOrReactive<number | string | null | undefined>;

export type PolymorphicContent<T> = PolymorphicComponent<Type<T>> | TemplateWithContext<T> | PolymorphicPrimitive;

export interface WithPolymorphicContent<T = any> {
  content: InputSignal<PolymorphicContent<T>>;
}
