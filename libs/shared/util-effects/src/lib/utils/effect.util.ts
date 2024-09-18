import { inject, Injector, Provider, runInInjectionContext } from '@angular/core';
import { asObservable } from '@shared/util-rxjs-interop';
import { concatMap, every, filter, from, map, merge, Observable, switchMap, take, tap } from 'rxjs';
import { RxEffectParams } from '../models';
import { ValueOrReactive } from '@shared/util-types';
import { IsFinalRequest, RequestErrorHandler, RequestLoadingStore } from '../providers';

const composeGuardChecks = <Payload>(injector: Injector, params: RxEffectParams<Payload>) => {
  return (payload: Payload): Observable<boolean> =>
    asObservable(payload).pipe(
      switchMap((payload) =>
        from(params.preEffectGuards ?? []).pipe(
          concatMap((guardFn) => runInInjectionContext(injector, () => asObservable(guardFn(payload)).pipe(take(1)))),
          every((value) => value)
        )
      ),
      tap((success) => {
        if (success === false) {
          runInInjectionContext(injector, () => RequestLoadingStore.injectAsOptional()?.setRequestStatus('Idle'));
        }
      }),
      filter((success) => success)
    );
};

const onInit = <Fn extends (...args: any[]) => any>(fn: Fn): ReturnType<Fn> => {
  RequestLoadingStore.injectAsOptional()?.setRequestStatus('Loading');

  return fn();
};

const extractActionPayload = <Payload>(injector: Injector, params: RxEffectParams<Payload>) => {
  const actionChanges$ = (params.actions ?? []).map(({ changes$ }) => changes$);

  return merge(...actionChanges$).pipe(
    switchMap((event) =>
      runInInjectionContext(injector, () => onInit(() => asObservable(event.payload.factory(...event.payload.args))))
    )
  );
};

const withGuardsCheck = <Payload>(guardFn: (payload: Payload) => Observable<boolean>) => {
  return (payload: ValueOrReactive<Payload>): Observable<Payload> => {
    return asObservable(payload).pipe(switchMap((payload) => guardFn(payload).pipe(map(() => payload))));
  };
};

const getInjector = <Payload>(params: RxEffectParams<Payload>): Injector => {
  const parentInjector = inject(Injector);

  return Injector.create({
    parent: parentInjector,
    providers: [
      params.providers,
      params.store && RequestLoadingStore.provide(params.store),
      params.errorHandler && RequestErrorHandler.provide(params.errorHandler),
    ]
      .flat()
      .filter((provider): provider is Provider => Boolean(provider)),
  });
};

const getEffectFnInjector = (parent: Injector): Injector => {
  return Injector.create({
    parent,
    providers: [IsFinalRequest.provide(true)],
  });
};

export const rxEffect = <Payload>(params: RxEffectParams<Payload>) => {
  const injector = getInjector(params);

  const actionPayload$ = extractActionPayload(injector, params);

  const ifGuardsAllow = withGuardsCheck(composeGuardChecks(injector, params));

  const effectFnInjector = getEffectFnInjector(injector);

  runInInjectionContext(effectFnInjector, () => {
    params.effectFn(ifGuardsAllow(actionPayload$));
  });

  return (payload: ValueOrReactive<Payload>): void => {
    runInInjectionContext(effectFnInjector, () => {
      onInit(() => params.effectFn(ifGuardsAllow(payload)));
    });
  };
};
