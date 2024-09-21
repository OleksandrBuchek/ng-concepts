import { Injector, runInInjectionContext } from '@angular/core';
import { asObservable } from '@shared/util-rxjs-interop';
import { ValueOrReactive } from '@shared/util-types';
import { Observable, switchMap, from, concatMap, take, every, tap, filter, map } from 'rxjs';
import { RxEffectOptions } from '../../models';
import { onEffectGuardReject } from './effect-hooks.util';

export const composeGuardChecks = <Payload>(injector: Injector, options: RxEffectOptions<Payload>) => {
  return (payload: Payload): Observable<boolean> =>
    asObservable(payload).pipe(
      switchMap((payload) =>
        from(options.preEffectGuards ?? []).pipe(
          concatMap((guardFn) => runInInjectionContext(injector, () => asObservable(guardFn(payload)).pipe(take(1)))),
          every((value) => value)
        )
      ),
      tap((success) => {
        if (success === false) {
          runInInjectionContext(injector, () => onEffectGuardReject());
        }
      }),
      filter((success) => success)
    );
};

export const withGuardsCheck = <Payload>(guardFn: (payload: Payload) => Observable<boolean>) => {
  return (payload: ValueOrReactive<Payload>): Observable<Payload> => {
    return asObservable(payload).pipe(switchMap((payload) => guardFn(payload).pipe(map(() => payload))));
  };
};
