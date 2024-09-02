import { Type } from '@angular/core';
import { PolymorphicComponentFactory, PolymorphicContent, WithPolymorphicContent } from '../models';

export const composePolymorphicWrappers =
  (...wrappers: Array<PolymorphicComponentFactory<Type<WithPolymorphicContent>>>) =>
  (content: PolymorphicContent<any>): PolymorphicContent<any> => {
    return wrappers.reduce(
      (acc, curr) =>
        curr({
          inputs: {
            content: acc,
          },
        }),
      content
    );
  };
