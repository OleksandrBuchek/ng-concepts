import { patchState, signalStoreFeature, withState, withMethods, signalStore } from '@ngrx/signals';
import { withRequestStatus } from './request-status-store.feature';
import { withError } from './error-store.feature';
import { withDataLoadingState } from './loading-store.feature';
import { createInstance } from '@shared/util-helpers';

export function withData<TData>(defaultValue: TData) {
  return signalStoreFeature(
    withState<{ data: TData }>({ data: defaultValue }),
    withMethods((store) => ({
      setData(data: TData) {
        patchState(store, { data });
      },
      clearData() {
        patchState(store, { data: defaultValue });
      },
    })),
  );
}

export const withDataStoreFeature = <TData>(defaultValue: TData) => {
  return signalStoreFeature(
    withData(defaultValue),
    withRequestStatus(),
    withError(),
    withDataLoadingState((store) => ({ ...store.stateSignals, data: store.stateSignals.data })),
  );
};

export const dataStore = <TData>(defaultValue: TData) => {
  return createInstance(signalStore(withDataStoreFeature(defaultValue)));
};
