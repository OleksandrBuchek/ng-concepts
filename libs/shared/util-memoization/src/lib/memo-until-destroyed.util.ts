import { DestroyRef, Injector, inject, runInInjectionContext } from '@angular/core';

export interface MemoUntilDestroyedParams {
  destroyRef?: DestroyRef;
  injector?: Injector;
}

export const memoUntilDestroyed = <Fn extends () => any>(fn: Fn, params?: MemoUntilDestroyedParams) => {
  const destroyRef = params?.destroyRef ?? inject(DestroyRef);
  const injector = params?.injector ?? inject(Injector);

  let cachedResult: ReturnType<Fn> | null;

  destroyRef.onDestroy(() => {
    cachedResult = null;
  });

  return (): ReturnType<Fn> => {
    if (cachedResult) {
      return cachedResult;
    } else {
      cachedResult = runInInjectionContext(injector, () => fn());
      return cachedResult as ReturnType<Fn>;
    }
  };
};
