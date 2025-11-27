'use client';

// React e hooks
import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";

// Serviços
import { createReading, initializeReadingIds } from "@/lib/readingService";

// Material UI
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

// Utils
import { Sensor, SensorReading, StoredReading, StoredSensor } from "@/app/utils/types";

// Chaves de armazenamento no localStorage
const SENSOR_STORAGE_KEY = "sensor-app:sensors";
const READING_STORAGE_KEY = "sensor-app:readings";

declare global {
  interface Window {
    google?: any;
  }
}

export function RealTimeReadings() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [selectedSensorId, setSelectedSensorId] = useState<string>("");

  const [currentTemperature, setCurrentTemperature] = useState<number | null>(
    null,
  );
  const [lastReadingTime, setLastReadingTime] = useState<Date | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [isGoogleChartsReady, setIsGoogleChartsReady] = useState(false);

  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedSensors = window.localStorage.getItem(SENSOR_STORAGE_KEY);
      if (storedSensors) {
        const parsedSensors = JSON.parse(storedSensors) as StoredSensor[];
        const restoredSensors: Sensor[] = parsedSensors.map((item) => ({
          ...item,
          createdAt: new Date(item.createdAt),
        }));
        setSensors(restoredSensors);

        if (restoredSensors.length > 0) {
          setSelectedSensorId(String(restoredSensors[0].id));
        }
      }

      const storedReadings = window.localStorage.getItem(READING_STORAGE_KEY);
      if (storedReadings) {
        const parsedReadings = JSON.parse(storedReadings) as StoredReading[];
        const restoredReadings: SensorReading[] = parsedReadings.map(
          (item) => ({
            ...item,
            createdAt: new Date(item.createdAt),
          }),
        );
        initializeReadingIds(restoredReadings);
      }
    } catch (error) {
      console.error(
        "Erro ao carregar sensores do cache do navegador:",
        error,
      );
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.google && window.google.charts) {
      setIsGoogleLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isGoogleLoaded || typeof window === "undefined") return;

    const google = window.google as any;
    if (!google) return;

    if (google.visualization && google.visualization.Gauge) {
      setIsGoogleChartsReady(true);
      return;
    }

    google.charts.load("current", {
      packages: ["gauge"],
      language: "pt-BR",
    });
    google.charts.setOnLoadCallback(() => {
      setIsGoogleChartsReady(true);
    });
  }, [isGoogleLoaded]);

  const canStart = useMemo(
    () => Boolean(selectedSensorId) && sensors.length > 0,
    [selectedSensorId, sensors.length],
  );

  // Simula leituras em tempo real para o sensor selecionado.
  useEffect(() => {
    if (!isRunning || !selectedSensorId) {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const sensorIdNumber = Number(selectedSensorId);

    function generateNextTemperature(previous: number | null): number {
      const base = previous ?? 24;
      const variation = (Math.random() - 0.5) * 2.5;
      const raw = base + variation;
      // Limite de segurança.
      return Math.min(50, Math.max(-10, raw));
    }

    function emitReading() {
      const nextTemperature = generateNextTemperature(currentTemperature);
      setCurrentTemperature(nextTemperature);
      const createdAt = new Date();
      setLastReadingTime(createdAt);

      const reading = createReading({
        sensorId: sensorIdNumber,
        temperature: nextTemperature.toFixed(1),
        createdAt,
      });

      try {
        const stored = window.localStorage.getItem(READING_STORAGE_KEY);
        const parsed = stored ? (JSON.parse(stored) as StoredReading[]) : [];
        const updated: StoredReading[] = [
          ...parsed,
          {
            ...reading,
            createdAt: reading.createdAt.toISOString(),
          },
        ];
        window.localStorage.setItem(
          READING_STORAGE_KEY,
          JSON.stringify(updated),
        );
      } catch (error) {
        console.error("Erro ao salvar leitura em tempo real:", error);
      }
    }

    emitReading();

    intervalRef.current = window.setInterval(emitReading, 3000);

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, selectedSensorId]);

  useEffect(() => {
    if (!isGoogleChartsReady || !chartContainerRef.current) {
      return;
    }

    const google = window.google as any;
    if (!google) return;

    const value = currentTemperature ?? 0;

    const data = google.visualization.arrayToDataTable([
      ["Label", "Value"],
      ["°C", value],
    ]);

    const options = {
      width: 420,
      height: 200,
      redFrom: 35,
      redTo: 50,
      yellowFrom: 25,
      yellowTo: 35,
      minorTicks: 5,
      min: -10,
      max: 50,
    };

    const chart = new google.visualization.Gauge(chartContainerRef.current);
    chart.draw(data, options);
  }, [isGoogleChartsReady, currentTemperature]);

  const hasSensors = sensors.length > 0;

  return (
    <>
      <Script
        src="https://www.gstatic.com/charts/loader.js"
        strategy="afterInteractive"
        onLoad={() => setIsGoogleLoaded(true)}
      />

      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Leitura em tempo real
        </Typography>

        {!hasSensors ? (
          <Typography variant="body2" color="text.secondary">
            Nenhum sensor cadastrado. Cadastre sensores para acompanhar as
            leituras em tempo real.
          </Typography>
        ) : (
          <Stack spacing={2}>
            <TextField
              select
              fullWidth
              id="realtimeSensorId"
              label="Sensor"
              value={selectedSensorId}
              onChange={(event) => setSelectedSensorId(event.target.value)}
            >
              {sensors.map((sensor) => (
                <MenuItem key={sensor.id} value={sensor.id}>
                  {sensor.name}
                </MenuItem>
              ))}
            </TextField>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Estado da simulação
                </Typography>
                <Typography variant="body1">
                  {isRunning ? "Em execução" : "Pausada"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  type="button"
                  variant="contained"
                  disabled={!canStart || isRunning}
                  onClick={() => setIsRunning(true)}
                >
                  Iniciar simulação
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  disabled={!isRunning}
                  onClick={() => setIsRunning(false)}
                >
                  Pausar
                </Button>
              </Box>
            </Box>

            <Box
              sx={{
                mt: 2,
                minHeight: 220,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 1,
                bgcolor: "background.paper",
              }}
            >
              <div
                ref={chartContainerRef}
                style={{ width: "100%", height: 220 }}
              />
            </Box>

            {!isGoogleLoaded && (
              <Typography variant="body2" color="text.secondary">
                Carregando biblioteca de gráficos...
              </Typography>
            )}
            {isGoogleLoaded && currentTemperature === null && (
              <Typography variant="body2" color="text.secondary">
                Selecione um sensor e clique em &quot;Iniciar simulação&quot;
                para visualizar as leituras em tempo real.
              </Typography>
            )}

            {currentTemperature !== null && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Última leitura
                </Typography>
                <Typography variant="body1">
                  {currentTemperature.toFixed(1)} °C
                  {lastReadingTime && (
                    <>
                      {" "}
                      —{" "}
                      {lastReadingTime.toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "medium",
                      })}
                    </>
                  )}
                </Typography>
              </Box>
            )}
          </Stack>
        )}
      </Paper>
    </>
  );
}
