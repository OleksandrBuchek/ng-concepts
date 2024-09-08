import { Subject } from "rxjs";
import { EMPTY_PAYLOAD_FACTORY_FN } from "../consts";
import { DispatchableAction, ActionContext } from "../models";


export const createAction = <Type extends string, PayloadFactory extends (...args: any[]) => any = never>(
    type: Type,
    payloadFactory?: PayloadFactory
  ): DispatchableAction<Type, PayloadFactory> => {
    const changesSubject$ = new Subject<ActionContext<Type, PayloadFactory>>();
  
    const action = (...args: Parameters<PayloadFactory>): void => {
        changesSubject$.next({
            type,
            payload: {
                factory: payloadFactory ?? (EMPTY_PAYLOAD_FACTORY_FN as PayloadFactory),
                args,
            },
        });
    };
    
    action.changes$ = changesSubject$.asObservable();
  
    return action;
  };
  