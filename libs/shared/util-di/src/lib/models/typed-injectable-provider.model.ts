import { InjectionToken, Type } from '@angular/core';

export type TypedInjectableProvider<T> =
  | { useValue: T }
  | { useExisting: InjectionToken<T> | Type<T> }
  | { useClass: Type<T> }
  | { useFactory: () => T };
