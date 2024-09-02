import { Injector, ViewContainerRef, DestroyRef, Type } from '@angular/core';
import {
  PolymorphicComponentParams,
  PolymorphicComponentParamsPartial,
} from './polymorphic-component.model';

export interface PolymorpheusViewContainerRefParams {
  injector: Injector;
  viewContainer: ViewContainerRef;
  destroyRef: DestroyRef;
}

export type PolymorphicViewContainerRefParams<TComponent extends Type<any>> = (
  | PolymorphicComponentParams<TComponent>
  | PolymorphicComponentParamsPartial<TComponent>
) &
  Partial<PolymorpheusViewContainerRefParams>;
