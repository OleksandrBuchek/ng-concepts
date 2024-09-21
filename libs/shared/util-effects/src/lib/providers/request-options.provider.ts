import { createInjectionToken } from '@shared/util-di';
import { ProvidableRxRequestOptions } from '../models';

export const RequestOptions = createInjectionToken((options: ProvidableRxRequestOptions<any, any>) => options);

export const provideRequestOptions = <Input = void, Response = unknown>(
  options: ProvidableRxRequestOptions<Input, Response>
) => RequestOptions.provide(options);
