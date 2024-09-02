import { objectEntries, objectValues } from '@shared/util-object';
import { Observable, filter, map } from 'rxjs';
import {
  DataLoadingState,
  LoadedWithData,
  LoadingState,
  Loaded,
  CombinedData,
} from '../models';
import {
  isLoadedWithData,
  isLoaded,
  isFailed,
  isLoading,
} from './type-guards.util';

export const withLoadedData = <T>(source: Observable<DataLoadingState<T>>) =>
  source.pipe(
    filter((state): state is LoadedWithData<T> => isLoadedWithData(state)),
    map((state) => state.data)
  );

export const withLoadedState = (source: Observable<LoadingState>) =>
  source.pipe(filter((state): state is Loaded => isLoaded(state)));

export const combineLoadingStates = (states: LoadingState[]): LoadingState => {
  const failedState = states.find(isFailed);

  if (failedState) {
    return failedState;
  }

  if (states.some(isLoading)) {
    return { status: 'Loading' };
  }

  if (states.every(isLoaded)) {
    return { status: 'Success' };
  }

  return { status: 'Idle' };
};

const getCombinedData = <T extends Record<string, DataLoadingState<any>>>(
  statesMap: T
): CombinedData<T> => {
  return objectEntries(statesMap).reduce(
    (acc, [key, loadingState]) => ({
      ...acc,
      [key]: (loadingState as LoadedWithData<T>)['data'],
    }),
    {} as CombinedData<T>
  );
};

export const combineLoadingStatesWithData = <
  T extends Record<string, DataLoadingState<any>>
>(
  states: T,
  extraStates: LoadingState[] = []
): DataLoadingState<CombinedData<T>> => {
  const combinedState = combineLoadingStates([
    ...objectValues(states),
    ...extraStates,
  ]);

  if (isLoaded(combinedState)) {
    return {
      ...combinedState,
      data: getCombinedData(states),
    };
  }

  return combinedState;
};
