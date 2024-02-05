import { IPointData } from "pixi.js";
import { ActionEntity, ParticleEntity } from "promethium-js";
import { CircuitElementId, MultipleConnectionPointId } from "./utils";

export type ConnectionPoint = IPointData & {
  multipleConnectionPointId?: MultipleConnectionPointId | null;
};
export type ConnectionPoints = ConnectionPoint[];
export type ConductorConnectionPoints = [IPointData, IPointData];

// TODO: add `prettierrc` with extended line character limit
export const $inputConnectionPointsCollection = new ParticleEntity<
  Record<CircuitElementId, ConnectionPoints>
>({});

export const $outputConnectionPointsCollection = new ParticleEntity<
  Record<CircuitElementId, ConnectionPoints>
>({});

export const $conductorConnectionPointsCollection = new ParticleEntity<
  Record<CircuitElementId, ConductorConnectionPoints>
>({});

export const $multipleConnectionPointsCollection = new ParticleEntity<
  Record<`${number}-${number}`, ConnectionPoints>
>({});

export const _circuitElementConnectionPointsActions = new ActionEntity({
  addInputConnectionPoint({
    id,
    connectionPoint,
  }: {
    id: CircuitElementId;
    connectionPoint: IPointData;
  }) {
    $inputConnectionPointsCollection.adaptParticleSetter(id)!(
      (connectionPoints) => [...connectionPoints, connectionPoint],
    );
  },
  addOutputConnectionPoint({
    id,
    connectionPoint,
  }: {
    id: CircuitElementId;
    connectionPoint: IPointData;
  }) {
    $outputConnectionPointsCollection.adaptParticleSetter(id)!(
      (connectionPoints) => [...connectionPoints, connectionPoint],
    );
  },
  addConductorConnectionPoints({
    id,
    connectionPoints,
  }: {
    id: CircuitElementId;
    connectionPoints: [IPointData, IPointData];
  }) {
    $conductorConnectionPointsCollection.adaptParticleSetter(id)!(
      connectionPoints,
    );
  },
  clearInputConnectionPoints({ id }: { id: CircuitElementId }) {
    $inputConnectionPointsCollection.adaptParticleSetter(id)!([]);
  },
  clearOutputConnectionPoints({ id }: { id: CircuitElementId }) {
    $outputConnectionPointsCollection.adaptParticleSetter(id)!([]);
  },
});
