import { patchState, signalStore, signalStoreFeature, withMethods } from '@ngrx/signals';
import {
  setAllEntities,
  addEntity,
  removeEntity,
  removeAllEntities,
  withEntities,
  setEntities,
  setEntity,
  removeEntities,
} from '@ngrx/signals/entities';
import { EntityId, SelectEntityId } from '@ngrx/signals/entities/src/models';

import { withRequestStatus } from './request-status-store.feature';
import { withError } from './error-store.feature';
import { withDataLoadingState } from './loading-store.feature';
import { createInstance } from '@shared/util-helpers';


export const entitiesStore = <TEntity>(props: { selectId: SelectEntityId<TEntity> }) => {
  return createInstance(
    signalStore(
      withEnititiesStore<TEntity>(props),
      withRequestStatus(),
      withError(),
      withDataLoadingState((store) => ({ ...store.stateSignals, data: store.computedSignals.entities })),
    ),
  );
};

export function withEnititiesStore<TEntity>(props: { selectId: SelectEntityId<TEntity> }) {
  return signalStoreFeature(
    withEntities<TEntity>(),
    withMethods((store) => ({
      setAllEntities(data: TEntity[]): void {
        patchState(store, setAllEntities(data, props));
      },
      setEntities(data: TEntity[]): void {
        patchState(store, setEntities(data, props));
      },
      setEntity(data: TEntity): void {
        patchState(store, setEntity(data, props));
      },
      addEntity(entity: TEntity): void {
        patchState(store, addEntity(entity, props));
      },
      removeEntity(id: EntityId): void {
        patchState(store, removeEntity(id));
      },
      prependEntities(newValue: TEntity[]): void {
        const currenctValue = store.entities();
        patchState(store, setAllEntities([...newValue, ...currenctValue], props));
      },
      appendEntities(newValue: TEntity[]): void {
        const currenctValue = store.entities();
        patchState(store, setAllEntities([...currenctValue, ...newValue], props));
      },
      clearEntities(ids: EntityId[]): void {
        patchState(store, removeEntities(ids));
      },
      clearAllEntities(): void {
        patchState(store, removeAllEntities());
      },
    })),
  );
}
