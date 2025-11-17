'use client';

import { useEffect, useState } from "react";
import { Sensor, initializeSensorIds } from "@/lib/sensorService";
import { SensorForm } from "./SensorForm";
import { SensorList } from "./SensorList";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const STORAGE_KEY = "sensor-app:sensors";

export function SensorApp() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setIsHydrated(true);
        return;
      }

      const parsed = JSON.parse(stored) as Array<
        Omit<Sensor, "createdAt"> & { createdAt: string }
      >;

      const restored: Sensor[] = parsed.map((item) => ({
        ...item,
        createdAt: new Date(item.createdAt),
      }));

      setSensors(restored);
      initializeSensorIds(restored);
    } catch (error) {
      console.error("Erro ao carregar sensores do cache do navegador:", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;

    try {
      const serialized = sensors.map((sensor) => ({
        ...sensor,
        createdAt: sensor.createdAt.toISOString(),
      }));

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
    } catch (error) {
      console.error("Erro ao salvar sensores no cache do navegador:", error);
    }
  }, [sensors, isHydrated]);

  function handleAddSensor(sensor: Sensor) {
    setSensors((previous) => [...previous, sensor]);
  }

  function handleDeleteSensor(id: number) {
    setSensors((previous) => previous.filter((sensor) => sensor.id !== id));
  }

  return (
    <Container maxWidth="lg" className="app-container">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Sistema de Leitura de Temperatura
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Cadastro de sensores com georreferenciamento (latitude e
          longitude).
        </Typography>
      </Box>

      <SensorForm onAddSensor={handleAddSensor} />
      <SensorList sensors={sensors} onDeleteSensor={handleDeleteSensor} />
    </Container>
  );
}
