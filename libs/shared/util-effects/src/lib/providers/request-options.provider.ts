import { createInjectionToken } from '@shared/util-di';
import { RxRequestOptions } from '../models';

export const RequestOptions = createInjectionToken(
  <Input = void, Response = unknown>(
    options: Pick<RxRequestOptions<Input, Response>, 'errorHandler' | 'store' | 'onError' | 'onSuccess'>
  ) => options
);
