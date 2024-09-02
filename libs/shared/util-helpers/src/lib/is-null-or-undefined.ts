export const isNullOrUndefined = <TValue>(value: TValue | null | undefined): value is null | undefined =>
  value === null || value === undefined;
