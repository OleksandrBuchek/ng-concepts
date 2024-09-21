import { createInjectionToken } from '@shared/util-di';
import { RxRequestOptions } from '../models';

export const RequestOptions = createInjectionToken(
  (options: Pick<RxRequestOptions<any, any>, 'errorHandler' | 'store' | 'onError' | 'onSuccess'>) => options
);
