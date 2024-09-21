import { RequestOptions } from '../../providers';

export const onGuardReject = (): void => {
  RequestOptions.injectAsOptional()?.store?.setRequestStatus?.('Idle');
};

export const onInit = (): void => {
  RequestOptions.injectAsOptional()?.store?.setRequestStatus?.('Loading');
};
