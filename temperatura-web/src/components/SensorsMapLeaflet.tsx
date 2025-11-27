'use client';

import { useEffect, useMemo, useState } from "react";
import type { Sensor } from "@/lib/sensorService";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";

const SENSOR_STORAGE_KEY = "sensor-app:sensors";

type StoredSensor = Omit<Sensor, "createdAt"> & { createdAt: string };

export function SensorsMapLeaflet() {
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

  const mapCenter: LatLngExpression = useMemo(() => {
    if (selectedSensor) {
      return [selectedSensor.latitude, selectedSensor.longitude];
    }

    if (sensors.length > 0) {
      return [sensors[0].latitude, sensors[0].longitude];
    }

    // Centro padrão (Florianópolis)
    return [-27.5954, -48.548];
  }, [selectedSensor, sensors]);

  const zoomLevel = sensors.length === 1 ? 14 : 4;

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
        <Box sx={{ display: "flex", flexDirection: "column", flex: 1, height: "1000px" }}>
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
              height: "1000px",
              borderRadius: 1,
              overflow: "hidden",
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <MapContainer
              center={mapCenter}
              zoom={zoomLevel}
              style={{ width: "100%", height: "100%" }}
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {sensors.map((sensor) => (
                <Marker
                  key={sensor.id}
                  position={[sensor.latitude, sensor.longitude]}
                >
                  <Popup>
                    <strong>{sensor.name}</strong>
                    <br />
                    Latitude: {sensor.latitude.toFixed(6)}
                    <br />
                    Longitude: {sensor.longitude.toFixed(6)}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </Box>
        </Box>
      )}
    </Paper>
  );
}

