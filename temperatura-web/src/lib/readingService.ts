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

export interface GenerateRandomReadingsInput {
  sensorId: Sensor["id"];
  count: number;
  minTemperature: number;
  maxTemperature: number;
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

export function generateRandomReadings(
  input: GenerateRandomReadingsInput,
): SensorReading[] {
  const { sensorId, count, minTemperature, maxTemperature } = input;

  if (count <= 0) {
    return [];
  }

  const lower =
    minTemperature <= maxTemperature ? minTemperature : maxTemperature;
  const upper =
    maxTemperature >= minTemperature ? maxTemperature : minTemperature;

  const readings: SensorReading[] = [];

  for (let index = 0; index < count; index += 1) {
    const randomTemperature =
      Math.random() * (upper - lower) + lower;

    readings.push(
      createReading({
        sensorId,
        temperature: randomTemperature.toFixed(1),
      }),
    );
  }

  return readings;
}
