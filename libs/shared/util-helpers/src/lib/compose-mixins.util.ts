import { merge } from 'lodash-es';

export function composeMixins<TArgs extends any[], R1, R2, R3, R4, R5, R6, R7, TResult>(
  ...funcs: [
    f1: (...args: TArgs) => R1,
    f2: (a: R1) => R2,
    f3: (a: R1 & R2) => R3,
    f4: (a: R1 & R2 & R3) => R4,
    f5: (a: R1 & R2 & R3 & R4) => R5,
    f6: (a: R1 & R2 & R3 & R4 & R5) => R6,
    f7: (a: R1 & R2 & R3 & R4 & R5 & R6) => R7,
    ...func: Array<(a: any) => any>,
    fnLast: (a: any) => TResult,
  ]
): (...args: TArgs) => TResult;

export function composeMixins<TArgs extends any[], R1, R2, R3, R4, R5, R6, R7>(
  f1: (...args: TArgs) => R1,
  f2: (a: R1) => R2,
  f3: (a: R1 & R2) => R3,
  f4: (a: R1 & R2 & R3) => R4,
  f5: (a: R1 & R2 & R3 & R4) => R5,
  f6: (a: R1 & R2 & R3 & R4 & R5) => R6,
  f7: (a: R1 & R2 & R3 & R4 & R5 & R6) => R7,
): (...args: TArgs) => R1 & R2 & R3 & R4 & R5 & R6 & R7;

export function composeMixins<TArgs extends any[], R1, R2, R3, R4, R5, R6>(
  f1: (...args: TArgs) => R1,
  f2: (a: R1) => R2,
  f3: (a: R1 & R2) => R3,
  f4: (a: R1 & R2 & R3) => R4,
  f5: (a: R1 & R2 & R3 & R4) => R5,
  f6: (a: R1 & R2 & R3 & R4 & R5) => R6,
): (...args: TArgs) => R1 & R2 & R3 & R4 & R5 & R6;

export function composeMixins<TArgs extends any[], R1, R2, R3, R4, R5>(
  f1: (...args: TArgs) => R1,
  f2: (a: R1) => R2,
  f3: (a: R1 & R2) => R3,
  f4: (a: R1 & R2 & R3) => R4,
  f5: (a: R1 & R2 & R3 & R4) => R5,
): (...args: TArgs) => R1 & R2 & R3 & R4 & R5;

export function composeMixins<TArgs extends any[], R1, R2, R3, R4>(
  f1: (...args: TArgs) => R1,
  f2: (a: R1) => R2,
  f3: (a: R1 & R2) => R3,
  f4: (a: R1 & R2 & R3) => R4,
): (...args: TArgs) => R1 & R2 & R3 & R4;

export function composeMixins<TArgs extends any[], R1, R2, R3>(
  f1: (...args: TArgs) => R1,
  f2: (a: R1) => R2,
  f3: (a: R1 & R2) => R3,
): (...args: TArgs) => R1 & R2 & R3;

export function composeMixins<TArgs extends any[], R1, R2>(
  f1: (...args: TArgs) => R1,
  f2: (a: R1) => R2,
): (...args: TArgs) => R1 & R2;

export function composeMixins<TArgs extends any[], R1>(f1: (...args: TArgs) => R1): (...args: TArgs) => R1;

export function composeMixins<TArgs extends any[]>(
  ...funcs: [f1: (...args: TArgs) => any, ...func: Array<(a: object) => object>]
) {
  return (...args: TArgs) => {
    const [first] = funcs;
    const rest = funcs.slice(1);

    return rest.reduce((acc, curr) => merge({}, acc, curr(acc)), first(...args));
  };
}
