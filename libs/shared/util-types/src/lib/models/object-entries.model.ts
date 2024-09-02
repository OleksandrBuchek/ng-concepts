import { ObjectKeys } from './object-keys.model';
import { ObjectValues } from './object-values.model';

export type ObjectEntries<T extends object> = Array<
  [ObjectKeys<T>[number], ObjectValues<T>[number]]
>;
