import { RxRequestOptions } from '../../models';

export const createRxRequestOptions = <Input = void, Response = unknown>(options: RxRequestOptions<Input, Response>) =>
  options;

export const createRxRequestOptionsFor =
  <Input = void, Response = unknown>(_: Partial<{ input: Input; response?: Response }> = {}) =>
  (options: RxRequestOptions<Input, Response>) =>
    options;
