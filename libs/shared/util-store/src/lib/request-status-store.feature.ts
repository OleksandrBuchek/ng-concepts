import { computed } from '@angular/core';
import { signalStoreFeature, withState, withMethods, patchState, withComputed } from '@ngrx/signals';

export type RequestStatus = 'Idle' | 'Loading' | 'Success' | 'Failed';

export function withRequestStatus() {
  return signalStoreFeature(
    withState<{ requestStatus: RequestStatus }>({ requestStatus: 'Idle' }),
    withMethods((store) => ({
      setRequestStatus(requestStatus: RequestStatus): void {
        patchState(store, { requestStatus });
      },
    })),
    withComputed((store) => ({
      isLoading: computed(() => store.requestStatus() === 'Loading'),
      isLoaded: computed(() => store.requestStatus() === 'Success'),
      isFailed: computed(() => store.requestStatus() === 'Failed'),
      isIdle: computed(() => store.requestStatus() === 'Idle'),
    })),
  );
}
