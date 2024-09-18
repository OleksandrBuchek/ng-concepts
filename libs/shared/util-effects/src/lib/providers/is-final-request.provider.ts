import { createInjectionToken } from '@shared/util-di';

export const IsFinalRequest = createInjectionToken((isFinalRequest: boolean) => isFinalRequest);
