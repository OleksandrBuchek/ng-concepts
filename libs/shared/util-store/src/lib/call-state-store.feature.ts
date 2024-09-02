import { signalStore, signalStoreFeature } from '@ngrx/signals';
import { withRequestStatus } from './request-status-store.feature';
import { withError } from './error-store.feature';
import { withLoadingState } from './loading-store.feature';
import { createInstance } from '@shared/util-helpers';

export const withCallState = () => {
  return signalStoreFeature(withRequestStatus(), withError(), withLoadingState());
};

export const callStateStore = () => createInstance(signalStore(withCallState()));
