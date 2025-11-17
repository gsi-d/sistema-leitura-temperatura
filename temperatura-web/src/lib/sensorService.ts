export type SensorType = "indoor" | "outdoor";

export interface Sensor {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  type: SensorType;
  createdAt: Date;
}

export interface CreateSensorInput {
  name: string;
  latitude: string;
  longitude: string;
  type: SensorType;
}

let nextId = 1;

export function createSensor(input: CreateSensorInput): Sensor {
  return {
    id: nextId++,
    name: input.name,
    latitude: parseFloat(input.latitude),
    longitude: parseFloat(input.longitude),
    type: input.type,
    createdAt: new Date(),
  };
}

function isValidCoordinate(value: string, min: number, max: number): boolean {
  const num = Number(value);
  return !Number.isNaN(num) && num >= min && num <= max;
}

export function isValidLatitude(value: string): boolean {
  return isValidCoordinate(value, -90, 90);
}

export function isValidLongitude(value: string): boolean {
  return isValidCoordinate(value, -180, 180);
}

