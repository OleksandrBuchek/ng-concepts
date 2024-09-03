import { InjectionToken, Type, inject } from '@angular/core';
import { isEqual } from '@shared/util-helpers';
import { objectEntries } from '@shared/util-object';
import { asObservable, asSignal } from '@shared/util-rxjs-interop';
import { AsSignals } from '@shared/util-types';
import { filter, takeUntil, merge } from 'rxjs';

export const overrideTokenWithDirectiveSignalMap =
  <T extends object>(token: InjectionToken<AsSignals<T>>, defaultValue: T) =>
  (directiveToken: Type<AsSignals<T>>): AsSignals<T> => {
    const tokenValues = inject(token, { skipSelf: true, optional: true });
    const directive = inject(directiveToken);

    if (tokenValues) {
      return objectEntries(tokenValues).reduce((acc, [key, getTokenValue]) => {
        const directiveValue$ = asObservable(directive[key as keyof T]).pipe(
          filter((value) => isEqual(defaultValue[key as keyof T], value) === false)
        );

        const tokenValue$ = asObservable(getTokenValue).pipe(takeUntil(directiveValue$));

        const mergedValue$ = merge(tokenValue$, directiveValue$);

        return {
          ...acc,
          [key]: asSignal(mergedValue$, { initialValue: defaultValue[key as keyof T] }),
        };
      }, {} as AsSignals<T>);
    }

    return directive;
  };
