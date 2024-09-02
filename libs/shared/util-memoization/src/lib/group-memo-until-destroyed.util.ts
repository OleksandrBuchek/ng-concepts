import { DestroyRef, inject } from '@angular/core';
import { objectEntries } from '@shared/util-object';
import { memoUntilDestroyed, MemoUntilDestroyedParams } from './memo-until-destroyed.util';

export const groupMemoUntilDestroyed = <T extends Record<string, () => any>>(
  group: T,
  params?: MemoUntilDestroyedParams,
): T => {
  let destroyRef: DestroyRef | null = params?.destroyRef ?? inject(DestroyRef);

  destroyRef.onDestroy(() => {
    destroyRef = null;
  });

  return objectEntries(group).reduce(
    (acc, [key, fn]) => ({ ...acc, [key]: memoUntilDestroyed(fn, { destroyRef: destroyRef as DestroyRef }) }),
    {} as T,
  );
};
