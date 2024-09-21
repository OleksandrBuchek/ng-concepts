import { FetchEntitiesOptions } from '../../models';
import { rxRequest } from './request.util';

export const fetchEntities = <Entity, Input = void>(options: FetchEntitiesOptions<Entity, Input>) => {
  return rxRequest<Input, Entity[]>({
    ...options,
    onSuccess: (response, input) => {
      options.onSuccess?.(response, input);
      options.store.setAllEntities(response);
    },
  });
};
