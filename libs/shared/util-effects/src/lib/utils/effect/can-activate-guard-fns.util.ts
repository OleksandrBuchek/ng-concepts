import { Injector, runInInjectionContext } from '@angular/core';
import { asObservable } from '@shared/util-rxjs-interop';
import { Observable, from, concatMap, take, every, map, combineLatest } from 'rxjs';
import { CanActivateGuardFn } from '../../models';

export const concat =
  <Input>(...guardFns: Array<CanActivateGuardFn<Input>>): CanActivateGuardFn<Input> =>
  (input, injector) =>
    from(guardFns).pipe(
      concatMap((guardFn) =>
        runInInjectionContext(injector, () => asObservable(guardFn(input, injector)).pipe(take(1)))
      ),
      every((value) => value)
    );

const combineGuards =
  (predicate: (results: boolean[]) => boolean) =>
  <Input = void>(...guardFns: Array<CanActivateGuardFn<Input>>) =>
  (input: Input, injector: Injector): Observable<boolean> =>
    combineLatest(
      runInInjectionContext(injector, () =>
        guardFns.map((guardFn) => asObservable(guardFn(input, injector)).pipe(take(1)))
      )
    ).pipe(map((values) => predicate(values)));

export const all = combineGuards((values) => values.every((value) => value));
export const some = combineGuards((values) => values.some((value) => value));
