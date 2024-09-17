import { createInjectionToken } from '@shared/util-di';
import { EffectState } from '../models';

export const EffectLoadingStore = createInjectionToken((state: EffectState) => state);
