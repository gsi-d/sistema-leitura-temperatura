import { CreateReadingInput, GenerateRandomReadingsInput, SensorReading } from "@/app/utils/types";

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

// Gera leituras aleatórias para um sensor específico com base nos parâmetros fornecidos
// Retorna um array contendo as leituras geradas
export function generateRandomReadings(
  input: GenerateRandomReadingsInput,
): SensorReading[] {
  const { sensorId, count, minTemperature, maxTemperature } = input;

  if (count <= 0) {
    return [];
  }

  // Garante que o valor de temperatura mínima seja menor que o máximo e vice-versa
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
