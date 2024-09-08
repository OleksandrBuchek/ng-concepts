import { inject, Injector, runInInjectionContext } from '@angular/core';
import { asObservable } from '@shared/util-rxjs-interop';
import { concatMap, every, filter, from, map, merge, Observable, switchMap } from 'rxjs';
import { RxEffectParams } from '../models';
import { ValueOrReactive } from '@shared/util-types';

const composeGuardChecks = <Payload>(injector: Injector, params: RxEffectParams<Payload>) => {
  return (payload: Payload): Observable<boolean> =>
    asObservable(payload).pipe(
      switchMap((payload) =>
        from(params.preEffectGuards ?? []).pipe(
          concatMap((guardFn) => runInInjectionContext(injector, () => asObservable(guardFn(payload)))),
          every((value) => value)
        )
      ),
      filter((success) => success)
    );
};

const extractActionPayload = <Payload>(injector: Injector, params: RxEffectParams<Payload>) => {
  const actionChanges$ = (params.actions ?? []).map(({ changes$ }) => changes$);

  return merge(...actionChanges$).pipe(
    switchMap((event) =>
      runInInjectionContext(injector, () => asObservable(event.payload.factory(...event.payload.args)))
    )
  );
};
const withGuardsCheck = <Payload>(guardFn: (payload: Payload) => Observable<boolean>) => {
  return (payload: ValueOrReactive<Payload>): Observable<Payload> => {
    return asObservable(payload).pipe(switchMap((payload) => guardFn(payload).pipe(map(() => payload))));
  };
};

export const rxEffect = <Payload>(params: RxEffectParams<Payload>) => {
  const injector = inject(Injector);

  const actionPayload$ = extractActionPayload(injector, params);

  const ifGuardsAllow = withGuardsCheck(composeGuardChecks(injector, params));

  params.effectFn(ifGuardsAllow(actionPayload$));

  return (payload: ValueOrReactive<Payload>): void => {
    params.effectFn(ifGuardsAllow(payload));
  };
};
