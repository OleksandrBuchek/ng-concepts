import { GetLeaveValue, GetValue, Leaves, Paths } from '@shared/util-types';
import { get as lodashGet } from 'lodash-es';

export const get = <Obj, Path extends Paths<Obj>>(obj: Obj, path: Path): GetValue<Obj, Path> =>
  lodashGet(obj, path.split('.'));

export const getLeave = <Obj, Key extends Leaves<Obj>>(obj: Obj, key: Key): GetLeaveValue<Obj, Key> =>
  lodashGet(obj, key.split('.'));
