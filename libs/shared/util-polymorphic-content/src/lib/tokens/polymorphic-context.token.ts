import { InjectionToken, Signal } from '@angular/core';

export const POLYMORPHIC_CONTEXT = new InjectionToken<
  Record<string, Signal<any>>
>('POLYMORPHIC_CONTEXT');
