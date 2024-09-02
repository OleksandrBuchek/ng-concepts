import {
  DataLoadingState,
  Failed,
  Loaded,
  LoadedWithData,
  Loading,
  LoadingState,
} from '../models';

export const isLoaded = (state: LoadingState): state is Loaded =>
  state.status === 'Success';

export const isLoadedWithData = <TData>(
  state: DataLoadingState<TData>
): state is LoadedWithData<TData> => isLoaded(state) && 'data' in state;

export const isLoading = (state: LoadingState): state is Loading =>
  state.status === 'Loading';

export const isFailed = (state: LoadingState): state is Failed =>
  state.status === 'Failed' && 'error' in state;
