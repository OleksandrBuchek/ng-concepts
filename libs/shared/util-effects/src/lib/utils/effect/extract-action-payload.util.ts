import { Injector, runInInjectionContext } from '@angular/core';
import { asObservable } from '@shared/util-rxjs-interop';
import { merge, switchMap, tap } from 'rxjs';
import { RxEffectOptions } from '../../models';
import { onEffectInit } from './effect-hooks.util';

export const extractActionPayload = <Payload>(injector: Injector, options: RxEffectOptions<Payload>) => {
  const actionChanges$ = (options.sources ?? []).map(({ changes$ }) => changes$);

  return merge(...actionChanges$).pipe(
    switchMap((event) =>
      runInInjectionContext(injector, () =>
        asObservable(event.payload.factory(...event.payload.args)).pipe(
          tap(() => {
            runInInjectionContext(injector, () => {
              onEffectInit();
            });
          })
        )
      )
    )
  );
};
