
export interface Station {
  id: string;
  name: string;
  x: number;
  y: number;
  passengers: Passenger[];
}

export interface Passenger {
  id: string;
  originId: string;
  destinationId: string;
  spawnTime: number;
}

export interface Line {
  id: string;
  name: string;
  color: string;
  stationIds: string[];
}

export interface Train {
  id: string;
  lineId: string;
  currentStationIndex: number;
  progress: number; // 0 to 1 between stations
  passengers: Passenger[];
  direction: 1 | -1;
}

export type Tool = 'station' | 'track' | 'select' | 'delete';

export interface GameEvent {
  title: string;
  description: string;
  duration: number;
  effect: {
    type: 'PASSENGER_SURGE' | 'SPEED_CHANGE' | 'STATION_CLOSURE';
    payload: {
      stationId?: string;
      lineId?: string;
      multiplier?: number;
    };
  };
}
