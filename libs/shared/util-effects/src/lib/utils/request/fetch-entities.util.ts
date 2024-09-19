import { FetchEntitiesParams } from "../../models";
import { rxRequest } from "./request.util";

export const fetchEntities = <Entity, Input = void>(params: FetchEntitiesParams<Entity, Input>) => {
    return rxRequest<Input, Entity[]>({
      ...params,
      onSuccess: (response, input) => {
        params.onSuccess?.(response, input);
        params.store.setAllEntities(response);
      },
    });
  };
  