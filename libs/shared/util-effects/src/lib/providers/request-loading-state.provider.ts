import { createInjectionToken } from '@shared/util-di';
import { RequestStore } from '../models';

export const RequestLoadingStore = createInjectionToken((state: RequestStore) => state);
