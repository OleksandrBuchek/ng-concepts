import { createInjectionToken } from '@shared/util-di';
import { RxRequestOptions } from '../models';

export const RequestOptions = createInjectionToken(
  (options: Pick<RxRequestOptions, 'errorHandler' | 'store'>) => options
);
