import { createInjectionToken } from '@shared/util-di';
import { RxRequestOptions } from '../models';

export const RequestOptions = createInjectionToken(
  (options: Pick<RxRequestOptions<any, any>, 'errorHandler' | 'store' | 'onError' | 'onSuccess'>) => options
);

export const provideRequestOptions = <Input = void, Response = unknown>(
  options: Pick<RxRequestOptions<Input, Response>, 'errorHandler' | 'store' | 'onError' | 'onSuccess'>
) => RequestOptions.provide(options);
