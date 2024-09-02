import { Type } from '@angular/core';
import { PolymorphicComponent } from '../classes';
import {
  PolymorphicComponentFactory,
  PolymorphicComponentParams,
} from '../models';

export const createPolymorphicComponent =
  <TComponent extends Type<any>>(
    component: TComponent
  ): PolymorphicComponentFactory<TComponent> =>
  (params?: PolymorphicComponentParams<TComponent>) =>
    new PolymorphicComponent(
      component,
      (params ?? {}) as PolymorphicComponentParams<TComponent>
    );
