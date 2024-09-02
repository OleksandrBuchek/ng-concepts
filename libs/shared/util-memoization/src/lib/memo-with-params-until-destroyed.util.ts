import { inject, DestroyRef, Injector, runInInjectionContext } from '@angular/core';
import { MemoUntilDestroyedParams } from './memo-until-destroyed.util';

export interface MemoWithParamsUntilDestroyedParams<Fn extends (...args: any[]) => any>
  extends MemoUntilDestroyedParams {
  resolver: (...params: Parameters<Fn>) => string | object;
}

export const memoWithParamsUntilDestroyed = <Fn extends (...args: any[]) => any>(
  fn: Fn,
  params: MemoWithParamsUntilDestroyedParams<Fn>,
) => {
  const destroyRef = params?.destroyRef ?? inject(DestroyRef);
  const injector = params.injector ?? inject(Injector);

  const cacheMap: Map<string | object, ReturnType<Fn>> = new Map();

  destroyRef.onDestroy(() => {
    cacheMap?.clear();
  });

  const cachedFn = (...args: Parameters<Fn>): ReturnType<Fn> => {
    const key = params.resolver(...args);

    if (cacheMap.has(key)) {
      return cacheMap.get(key) as ReturnType<Fn>;
    } else {
      cacheMap.set(
        key,
        runInInjectionContext(injector, () => fn(...args)),
      );
      return cacheMap.get(key) as ReturnType<Fn>;
    }
  };

  cachedFn.clear = () => {
    cacheMap?.clear();
  };

  return cachedFn;
};
