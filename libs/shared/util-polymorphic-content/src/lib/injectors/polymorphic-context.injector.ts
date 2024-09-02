import { Type, inject } from '@angular/core';
import { PolymorphicComponentContext } from '../models';
import { POLYMORPHIC_CONTEXT } from '../tokens';

export const injectPolymorpheusContext = <TComponent extends Type<any>>() =>
  inject<PolymorphicComponentContext<TComponent>>(POLYMORPHIC_CONTEXT);
