import { HttpErrorResponse } from '@angular/common/http';
import { AppError } from '@shared/util-error-handling';
import { RequestStatus } from '@shared/util-store';

export interface EffectState {
  setError(error: AppError<HttpErrorResponse> | null): void;
  setRequestStatus(status: RequestStatus): void;
}
