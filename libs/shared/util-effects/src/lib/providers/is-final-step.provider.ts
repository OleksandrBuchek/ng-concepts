import { createInjectionToken } from '@shared/util-di';

export const IsFinalStep = createInjectionToken((isFinalStep: boolean) => isFinalStep);
