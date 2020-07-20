export interface StateData {
  state?: string;
  active: string;
  discharged: string;
  deceased: string;
  total: string;
  entityName?: string;
}

export type StateDataKey = keyof StateData;

export interface StateDataDelta extends StateData {
  delta?: StateData;
}

export interface NormaliedStatsForDay {
  [stateName: string]: StateDataDelta;
}

export interface StatsObj {
  [dateKey: string]: NormaliedStatsForDay;
}

export type Normalized<T, K extends keyof T> = [{ [x: string]: T }, T[K][]];
