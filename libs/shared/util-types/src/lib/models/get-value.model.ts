import { Leaves, Paths } from './path.model';

export type GetValue<
  Obj,
  Path extends Paths<Obj>
> = Path extends `${infer Key}.${infer Rest}`
  ? Obj[(Key extends `${infer R extends number}` ? R : Key) &
      keyof Obj] extends infer S
    ? S extends never
      ? never
      : Rest extends Paths<S>
      ? GetValue<S, Rest>
      : never
    : never
  : Obj[(Path extends `${infer R extends number}` ? R : Path) & keyof Obj];

export type GetLeaveValue<
  Obj,
  Path extends Leaves<Obj>
> = Path extends `${infer Key}.${infer Rest}`
  ? Obj[(Key extends `${infer R extends number}` ? R : Key) &
      keyof Obj] extends infer S
    ? S extends never
      ? never
      : Rest extends Leaves<S>
      ? GetLeaveValue<S, Rest>
      : never
    : never
  : Obj[(Path extends `${infer R extends number}` ? R : Path) & keyof Obj];
