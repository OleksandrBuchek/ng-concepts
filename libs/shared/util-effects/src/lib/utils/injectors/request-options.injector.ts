import { RxRequestOptions } from '../../models';
import { RequestOptions } from '../../providers';

export const injectRequestOptions = <Input = void, Response = unknown>(): Pick<
  RxRequestOptions<Input, Response>,
  'errorHandler' | 'store' | 'onError' | 'onSuccess'
> => RequestOptions.injectAsOptional() ?? {};
