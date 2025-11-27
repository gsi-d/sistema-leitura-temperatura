"use client";

// React e hooks
import { useEffect, useState } from "react";
import { initializeSensorIds } from "@/lib/sensorService";

// Material UI
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

// Componentes internos
import { SensorForm } from "./SensorForm";
import { SensorList } from "./SensorList";
import { Sensor } from "@/app/utils/types";

const STORAGE_KEY = "sensor-app:sensors";

export function SensorApp() {
  // Estados utilizados no componente
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Na montagem do componente, carregamos os sensores do cache do navegador
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setIsHydrated(true);
        return;
      }

      // Parse dos sensores armazenados
      const parsed = JSON.parse(stored) as Array<
        Omit<Sensor, "createdAt"> & { createdAt: string }
      >;

      // Restauração dos sensores com a conversão da data
      const restored: Sensor[] = parsed.map((item) => ({
        ...item,
        createdAt: new Date(item.createdAt),
      }));

      // Atualização dos estados
      setSensors(restored);
      initializeSensorIds(restored);
    } catch (error) {
      console.error("Erro ao carregar sensores do cache do navegador:", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Sempre que os sensores mudam, salvamos no cache do navegador
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

  // Funções para inserir sensores
  function handleAddSensor(sensor: Sensor) {
    setSensors((previous) => [...previous, sensor]);
  }

  // Função para deletar sensores
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
          Cadastro de sensores com georreferenciamento (latitude e longitude).
        </Typography>
      </Box>

      <SensorForm onAddSensor={handleAddSensor} />
      <SensorList sensors={sensors} onDeleteSensor={handleDeleteSensor} />
    </Container>
  );
}
