export interface Athlete {
  id: string;
  name: string;
  sport: string;
  photoUrl?: string;
  createdAt: number;
}

export interface Measurement {
  id: string;
  athleteId: string;
  date: number;
  height?: number;
  weight?: number;
  wingSpan?: number;
  leftBicepCircumference?: number;
  rightBicepCircumference?: number;
  leftThighCircumference?: number;
  rightThighCircumference?: number;
}

export type UnitSystem = 'metric' | 'imperial';
