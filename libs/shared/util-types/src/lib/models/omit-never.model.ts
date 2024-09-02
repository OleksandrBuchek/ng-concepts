export type OmitNever<T> = {
  [Key in keyof T as T[Key] extends never ? never : Key]: T[Key];
};

export type OmitNullish<T> = {
  [Key in keyof T as T[Key] extends never | null | undefined | never[] | void
    ? never
    : Key]: T[Key];
};
