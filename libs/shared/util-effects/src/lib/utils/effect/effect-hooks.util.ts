import { RequestOptions } from '../../providers';

export const onGuardReject = (): void => {
  RequestOptions.injectAsOptional()?.store?.setRequestStatus?.('Idle');
};

export const onEffectInit = (): void => {
  RequestOptions.injectAsOptional()?.store?.setRequestStatus?.('Loading');
};
