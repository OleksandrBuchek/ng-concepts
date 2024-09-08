import { ValueOrReactive } from "@shared/util-types";
import { DispatchableAction } from "./action.model";


export interface RxEffectParams<Payload = void> {
  effectFn: (payload: ValueOrReactive<Payload>) => void;
  actions?: Array<DispatchableAction<string, (...args: any[]) => ValueOrReactive<Payload>>>;
  preEffectGuards?: Array<(payload: Payload) => ValueOrReactive<boolean>>;
}