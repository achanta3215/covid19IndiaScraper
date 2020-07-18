export interface StateData {
  state: string;
  active: string;
  discharged: string;
  deceased: string;
  total: string;
}

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
