import { Injector, runInInjectionContext } from '@angular/core';
import { asObservable } from '@shared/util-rxjs-interop';
import { Observable, from, concatMap, take, every as everyOperator, map, combineLatest } from 'rxjs';
import { CanActivateGuardFn } from '../../models';

export const concat =
  <Input>(...guardFns: Array<CanActivateGuardFn<Input>>): CanActivateGuardFn<Input> =>
  (input, injector): Observable<boolean> =>
    from(guardFns).pipe(
      concatMap((guardFn) =>
        runInInjectionContext(injector, () => asObservable(guardFn(input, injector)).pipe(take(1)))
      ),
      everyOperator((value) => value)
    );

const combineGuardResults =
  (predicate: (results: boolean[]) => boolean) =>
  <Input = void>(...guardFns: Array<CanActivateGuardFn<Input>>) =>
  (input: Input, injector: Injector): Observable<boolean> =>
    combineLatest(
      runInInjectionContext(injector, () =>
        guardFns.map((guardFn) => asObservable(guardFn(input, injector)).pipe(take(1)))
      )
    ).pipe(map((values) => predicate(values)));

export const every = combineGuardResults((values) => values.every((value) => value));
export const some = combineGuardResults((values) => values.some((value) => value));
