'use client';

import { useState } from "react";
import { Sensor } from "@/lib/sensorService";
import { SensorForm } from "./SensorForm";
import { SensorList } from "./SensorList";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export function SensorApp() {
  const [sensors, setSensors] = useState<Sensor[]>([]);

  function handleAddSensor(sensor: Sensor) {
    setSensors((previous) => [...previous, sensor]);
  }

  return (
    <Container maxWidth="lg" className="app-container">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Sistema de Leitura de Temperatura
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Etapa 1: cadastro de sensores com georreferenciamento (latitude e
          longitude).
        </Typography>
      </Box>

      <SensorForm onAddSensor={handleAddSensor} />
      <SensorList sensors={sensors} />
    </Container>
  );
}
