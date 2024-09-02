export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (...args: any[]) => any
    ? T[K]
    : T[K] extends object
    ? DeepPartial<T[K]>
    : T[K];
};
