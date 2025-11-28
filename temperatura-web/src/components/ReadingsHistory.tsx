'use client';

// React e hooks
import { useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";

// Material UI
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

// Utils
import { Sensor, SensorReading, StoredReading, StoredSensor } from "@/app/utils/types";

// Chaves de armazenamento no localStorage
const SENSOR_STORAGE_KEY = "sensor-app:sensors";
const READING_STORAGE_KEY = "sensor-app:readings";

// Extende window para dizer que pode existir window.google
declare global {
  interface Window {
    // Namespace do Google Charts carregado via script externo.
    google?: any;
  }
}

export function ReadingsHistory() {
  // Estados utilizados no componente
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [selectedSensorId, setSelectedSensorId] = useState<string>("");
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [isGoogleChartsReady, setIsGoogleChartsReady] = useState(false);

  // Referência para onde o gadget será desenhado
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  // Carregamento inicial dos sensores e leituras
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
        setReadings(restoredReadings);
      }
    } catch (error) {
      console.error(
        "Erro ao carregar sensores/leituras do cache do navegador:",
        error,
      );
    }
  }, []);

  // Se o script já foi carregado em outra navegação, marcamos como carregado.
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.google && window.google.charts) {
      setIsGoogleLoaded(true);
    }
  }, []);

  // Inicializa Google Charts assim que o script estiver carregado.
  useEffect(() => {
    if (!isGoogleLoaded || typeof window === "undefined") return;

    const google = window.google as any;
    if (!google) return;

    // Se a visualização já estiver pronta, apenas marcamos como pronto.
    if (google.visualization) {
      setIsGoogleChartsReady(true);
      return;
    }

    // Caso contrário, carregamos o script e marcamos como pronto quando ele estiver carregado.
    google.charts.load("current", {
      packages: ["corechart"],
      language: "pt-BR",
    });
    google.charts.setOnLoadCallback(() => {
      setIsGoogleChartsReady(true);
    });
  }, [isGoogleLoaded]);

  // Filtra as leituras para o sensor selecionado
  const readingsForSelectedSensor = useMemo(() => {
    if (!selectedSensorId) {
      return [];
    }

    const sensorIdNumber = Number(selectedSensorId);

    return readings
      .filter((reading) => reading.sensorId === sensorIdNumber)
      .sort(
        (left, right) =>
          left.createdAt.getTime() - right.createdAt.getTime(),
      );
  }, [readings, selectedSensorId]);

  // Desenha o gadget assim que ele estiver pronto
  useEffect(() => {
    if (!isGoogleChartsReady || !chartContainerRef.current) {
      return;
    }

    const google = window.google as any;
    if (!google) return;

    if (readingsForSelectedSensor.length === 0) {
      chartContainerRef.current.innerHTML =
        "Nenhuma leitura encontrada para o sensor selecionado.";
      return;
    }

    // Cria o DataTable do google charts
    const dataTable = new google.visualization.DataTable();
    dataTable.addColumn("datetime", "Data e hora");
    dataTable.addColumn("number", "Temperatura (°C)");

    // Adiciona as leituras ao DataTable
    readingsForSelectedSensor.forEach((reading) => {
      dataTable.addRow([reading.createdAt, reading.temperature]);
    });

    // Configura as opções do google charts
    const options = {
      title: "Histórico de temperatura",
      legend: { position: "bottom" },
      hAxis: {
        title: "Data e hora",
        format: "dd/MM HH:mm"        
      },
      vAxis: {
        title: "Temperatura (°C)",
      },
      curveType: "function" as const,
      chartArea: { left: 60, right: 16, top: 24, bottom: 60 },
    };

    // Cria instância do google charts
    const chart = new google.visualization.LineChart(
      chartContainerRef.current,
    );
    // Desenha o gadget
    chart.draw(dataTable, options);

    // Atualiza o gadget quando a janela for redimensionada
    function handleResize() {
      chart.draw(dataTable, options);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isGoogleChartsReady, readingsForSelectedSensor]);

  const hasSensors = sensors.length > 0;

  return (
    <>
      {/* Script do google charts */}
      <Script
        src="https://www.gstatic.com/charts/loader.js"
        strategy="afterInteractive" // Carrega o script assim que a navegação estiver pronta
        onLoad={() => setIsGoogleLoaded(true)}
      />

      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Gráfico de histórico de leituras
        </Typography>

        {!hasSensors ? (
          <Typography variant="body2" color="text.secondary">
            Nenhum sensor cadastrado. Cadastre sensores e insira leituras para
            visualizar o histórico.
          </Typography>
        ) : (
          <Box sx={{ mb: 2 }}>
            <TextField
              select
              fullWidth
              id="historySensorId"
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
          </Box>
        )}

        {/* Gadget de gráficos */}
        <Box
          ref={chartContainerRef}
          sx={{
            mt: 2,
            minHeight: 320,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 1,
            bgcolor: "background.paper",
          }}
        >
          {!isGoogleLoaded && (
            <Typography variant="body2" color="text.secondary">
              Carregando biblioteca de gráficos...
            </Typography>
          )}
        </Box>
      </Paper>
    </>
  );
}

