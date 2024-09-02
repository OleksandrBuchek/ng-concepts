import { DestroyRef, inject } from '@angular/core';
import { MemoUntilDestroyedParams } from './memo-until-destroyed.util';
import { MemoWithParamsUntilDestroyedParams } from './memo-with-params-until-destroyed.util';

export const memoUntilDestroyedDeferred = <Fn extends () => any>(fn: Fn, params?: MemoUntilDestroyedParams) => {
  let destroyRef: DestroyRef | null;
  let cachedResult: ReturnType<Fn> | null;

  return (): ReturnType<Fn> => {
    if (!destroyRef) {
      destroyRef = params?.destroyRef ?? inject(DestroyRef);

      destroyRef.onDestroy(() => {
        destroyRef = null;
        cachedResult = null;
      });
    }

    if (cachedResult) {
      return cachedResult;
    } else {
      cachedResult = fn();
      return cachedResult as ReturnType<Fn>;
    }
  };
};

export const memoWithParamsUntilDestroyedDeferred = <Fn extends (...args: any[]) => any>(
  fn: Fn,
  params: MemoWithParamsUntilDestroyedParams<Fn>,
) => {
  let destroyRef: DestroyRef | null;

  const cacheMap: Map<string | object, ReturnType<Fn>> = new Map();

  const cachedFn = (...args: Parameters<Fn>): ReturnType<Fn> => {
    if (!destroyRef) {
      destroyRef = params?.destroyRef ?? inject(DestroyRef);

      destroyRef.onDestroy(() => {
        cacheMap?.clear();
        destroyRef = null;
      });
    }

    const key = params.resolver(...args);

    if (cacheMap.has(key)) {
      return cacheMap.get(key) as ReturnType<Fn>;
    } else {
      cacheMap.set(key, fn(...args));
      return cacheMap.get(key) as ReturnType<Fn>;
    }
  };

  cachedFn.clear = () => {
    cacheMap.clear();
  };

  return cachedFn;
};
