import { createInjectionToken } from '@shared/util-di';
import { HttpErrorHandlersMap } from '@shared/util-error-handling';
import { getValue } from '@shared/util-helpers';
import { ValueOrFactory } from '@shared/util-types';

export const EffectErrorHandler = createInjectionToken((errorHandler: ValueOrFactory<Partial<HttpErrorHandlersMap>>) =>
  getValue(errorHandler)
);
