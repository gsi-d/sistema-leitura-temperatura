'use client';

import { useEffect, useMemo, useState } from "react";
import type { Sensor } from "@/lib/sensorService";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

const SENSOR_STORAGE_KEY = "sensor-app:sensors";

type StoredSensor = Omit<Sensor, "createdAt"> & { createdAt: string };

function buildOpenStreetMapEmbedUrl(latitude: number, longitude: number) {
  const deltaLat = 0.01;
  const deltaLng = 0.01;

  const south = latitude - deltaLat;
  const north = latitude + deltaLat;
  const west = longitude - deltaLng;
  const east = longitude + deltaLng;

  const bbox = `${west},${south},${east},${north}`;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    bbox,
  )}&layer=mapnik&marker=${latitude},${longitude}`;
}

export function SensorsMap() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [selectedSensorId, setSelectedSensorId] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedSensors = window.localStorage.getItem(SENSOR_STORAGE_KEY);
      if (!storedSensors) {
        return;
      }

      const parsedSensors = JSON.parse(storedSensors) as StoredSensor[];
      const restoredSensors: Sensor[] = parsedSensors.map((item) => ({
        ...item,
        createdAt: new Date(item.createdAt),
      }));
      setSensors(restoredSensors);

      if (restoredSensors.length > 0) {
        setSelectedSensorId(String(restoredSensors[0].id));
      }
    } catch (error) {
      console.error(
        "Erro ao carregar sensores do cache do navegador:",
        error,
      );
    }
  }, []);

  const hasSensors = sensors.length > 0;

  const selectedSensor = useMemo(() => {
    if (!selectedSensorId) return null;
    const id = Number(selectedSensorId);
    return sensors.find((sensor) => sensor.id === id) ?? null;
  }, [selectedSensorId, sensors]);

  const mapUrl = useMemo(() => {
    if (!selectedSensor) {
      // Fallback: centro em Florianópolis
      return buildOpenStreetMapEmbedUrl(-27.5954, -48.548);
    }

    return buildOpenStreetMapEmbedUrl(
      selectedSensor.latitude,
      selectedSensor.longitude,
    );
  }, [selectedSensor]);

  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        mb: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
        Mapa interativo de sensores
      </Typography>

      {!hasSensors ? (
        <Typography variant="body2" color="text.secondary">
          Nenhum sensor cadastrado. Cadastre sensores para visualizar a
          localização no mapa.
        </Typography>
      ) : (
        <>
          <Box sx={{ mb: 2 }}>
            <TextField
              select
              fullWidth
              id="mapSensorId"
              label="Sensor em destaque"
              value={selectedSensorId}
              onChange={(event) => setSelectedSensorId(event.target.value)}
            >
              {sensors.map((sensor) => (
                <MenuItem key={sensor.id} value={sensor.id}>
                  {sensor.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box
            sx={{
              flex: 1,
              minHeight: "60vh",
              borderRadius: 1,
              overflow: "hidden",
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <iframe
              title="Mapa de sensores"
              src={mapUrl}
              style={{ width: "100%", height: 600, border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Box>
        </>
      )}
    </Paper>
  );
}

