export interface Sensor {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  createdAt: Date;
}

export interface CreateSensorInput {
  name: string;
  latitude: string;
  longitude: string;
}

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

export interface SensorFormProps {
  onAddSensor: (sensor: Sensor) => void;
}

export interface SensorListProps {
  sensors: Sensor[];
  onDeleteSensor: (id: number) => void;
}

export interface FormErrors {
  name?: string;
  latitude?: string;
  longitude?: string;
}

export interface ReadingFormErrors {
  sensorId?: string;
  temperature?: string;
}

export interface RandomReadingFormErrors {
  sensorId?: string;
  count?: string;
  minTemperature?: string;
  maxTemperature?: string;
}

export type StoredSensor = Omit<Sensor, "createdAt"> & { createdAt: string };
export type StoredReading = Omit<SensorReading, "createdAt"> & { createdAt: string };