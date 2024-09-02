/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpErrorResponse } from '@angular/common/http';
import { Signal, computed } from '@angular/core';
import { AppError } from '@shared/util-error-handling';
import { RequestStatus } from './request-status-store.feature';
import { signalStoreFeature, type, withComputed } from '@ngrx/signals';
import {
  EmptyFeatureResult,
  InnerSignalStore,
  SignalStoreFeature,
  SignalStoreFeatureResult,
} from '@ngrx/signals/src/signal-store-models';
import { Prettify } from '@ngrx/signals/src/ts-helpers';
import { DataLoadingState, LoadingState } from '@shared/util-loading-state';

interface GetLoadingStateParams {
  error: Signal<AppError<HttpErrorResponse> | null>;
  requestStatus: Signal<RequestStatus>;
}

interface GetDataLoadingStateParams<TEntity> extends GetLoadingStateParams {
  data: Signal<TEntity>;
}

const getDataLoadingState = <TData>(store: GetDataLoadingStateParams<TData>): Signal<DataLoadingState<TData>> =>
  computed(() => {
    const error = store.error();
    const status = store.requestStatus();

    const result =
      status === 'Success' ? { status, data: store.data() } : status === 'Failed' ? { status, error } : { status };

    return result as DataLoadingState<TData>;
  });

const getLoadingState = (store: GetLoadingStateParams): Signal<LoadingState> =>
  computed(() => {
    const error = store.error();
    const status = store.requestStatus();

    const result = status === 'Success' ? { status } : status === 'Failed' ? { status, error } : { status };

    return result as LoadingState;
  });

export const withDataLoadingState = <Input extends SignalStoreFeatureResult, TEntity>(
  storeSliceSelector: (
    store: Prettify<InnerSignalStore<Input['state'], Input['computed']>>,
  ) => GetDataLoadingStateParams<TEntity>,
): SignalStoreFeature<Input, EmptyFeatureResult & { computed: { loadingState: Signal<DataLoadingState<TEntity>> } }> => {
  return (store) => ({
    ...store,
    computedSignals: {
      ...store.computedSignals,
      loadingState: getDataLoadingState(storeSliceSelector(store)),
    },
  })
};

export const withLoadingState = <_>() => {
  return signalStoreFeature(
    {
      state: type<{
        error: AppError<HttpErrorResponse> | null;
        requestStatus: RequestStatus;
      }>(),
    },
    withComputed((store) => ({
      loadingState: getLoadingState(store),
    })),
  );
};
