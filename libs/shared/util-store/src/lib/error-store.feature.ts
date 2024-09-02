import { HttpErrorResponse } from '@angular/common/http';
import { signalStoreFeature, withState, withMethods, patchState } from '@ngrx/signals';
import { AppError } from '@shared/util-error-handling';

export function withError<TError = HttpErrorResponse>() {
  return signalStoreFeature(
    withState<{ error: AppError<TError> | null }>({ error: null }),
    withMethods((store) => ({
      setError(error: AppError<TError> | null) {
        patchState(store, { error });
      },
    })),
  );
}
