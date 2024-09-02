import { ExcludeSymbolKey } from './exclude-symbol-key.model';

export type ObjectKeys<T extends object> = Array<`${ExcludeSymbolKey<T>}`>;
