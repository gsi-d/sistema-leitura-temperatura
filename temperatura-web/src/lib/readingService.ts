import type { Sensor } from "./sensorService";

export interface SensorReading {
  id: number;
  sensorId: Sensor["id"];
  temperature: number;
  createdAt: Date;
}

export interface CreateReadingInput {
  sensorId: Sensor["id"];
  temperature: string;
  createdAt?: Date;
}

let nextReadingId = 1;

export function createReading(input: CreateReadingInput): SensorReading {
  return {
    id: nextReadingId++,
    sensorId: input.sensorId,
    temperature: parseFloat(input.temperature),
    createdAt: input.createdAt ?? new Date(),
  };
}

export function initializeReadingIds(existingReadings: SensorReading[]): void {
  if (!existingReadings || existingReadings.length === 0) {
    nextReadingId = 1;
    return;
  }

  const maxId = existingReadings.reduce(
    (max, reading) => (reading.id > max ? reading.id : max),
    0,
  );

  nextReadingId = maxId + 1;
}