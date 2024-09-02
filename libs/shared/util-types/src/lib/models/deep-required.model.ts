export type DeepRequired<T> = Required<{
  [P in keyof T]: NonNullable<T[P]> extends object ? DeepRequired<T[P]> : T[P];
}>;
