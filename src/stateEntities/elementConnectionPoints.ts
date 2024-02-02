import { IPointData } from "pixi.js";
import { ActionEntity, ParticleEntity } from "promethium-js";
import { CircuitElementId, MultipleConnectionPointId } from "./utils";

export type ConnectionPoint = IPointData & {
  multipleConnectionPointId?: MultipleConnectionPointId | null;
};
export type ConnectionPoints = ConnectionPoint[];
export type ConductorConnectionPoints = [IPointData, IPointData];

// TODO: add `prettierrc` with extended line character limit
export const _inputConnectionPointsCollection = new ParticleEntity<
  Record<CircuitElementId, ConnectionPoints>
>({});

export const _outputConnectionPointsCollection = new ParticleEntity<
  Record<CircuitElementId, ConnectionPoints>
>({});

export const _conductorConnectionPointsCollection = new ParticleEntity<
  Record<CircuitElementId, ConductorConnectionPoints>
>({});

export const _multipleConnectionPointsCollection = new ParticleEntity<
  Record<`${number}-${number}`, ConnectionPoints>
>({});

export const _elementConnectionPointsActions = new ActionEntity({
  addInputConnectionPoint({
    id,
    connectionPoint,
  }: {
    id: CircuitElementId;
    connectionPoint: IPointData;
  }) {
    _inputConnectionPointsCollection.adaptParticleSetter(id)!(
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
    _outputConnectionPointsCollection.adaptParticleSetter(id)!(
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
    _conductorConnectionPointsCollection.adaptParticleSetter(id)!(
      connectionPoints,
    );
  },
  clearInputConnectionPoints({ id }: { id: CircuitElementId }) {
    _inputConnectionPointsCollection.adaptParticleSetter(id)!([]);
  },
  clearOutputConnectionPoints({ id }: { id: CircuitElementId }) {
    _outputConnectionPointsCollection.adaptParticleSetter(id)!([]);
  },
  clearConductorConnectionPoints({ id }: { id: CircuitElementId }) {
    _conductorConnectionPointsCollection.adaptParticleSetter(id)!(
      [] as unknown as ConductorConnectionPoints,
    );
  },
});
