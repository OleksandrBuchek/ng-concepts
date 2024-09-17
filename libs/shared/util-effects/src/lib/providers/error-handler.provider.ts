import { createInjectionToken } from '@shared/util-di';
import { HttpErrorHandlersMap } from '@shared/util-error-handling';

export const EffectErrorHandler = createInjectionToken((errorHandler: Partial<HttpErrorHandlersMap>) => errorHandler);
