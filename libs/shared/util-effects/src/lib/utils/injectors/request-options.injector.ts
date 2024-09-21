import { ProvidableRxRequestOptions } from '../../models';
import { RequestOptions } from '../../providers';

export const injectRequestOptions = <Input = void, Response = unknown>(): ProvidableRxRequestOptions<Input, Response> =>
  RequestOptions.injectAsOptional() ?? {};
