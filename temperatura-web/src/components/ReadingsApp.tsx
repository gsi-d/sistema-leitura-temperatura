'use client';

import { FormEvent, useEffect, useState } from "react";
import type { Sensor } from "@/lib/sensorService";
import {
  SensorReading,
  createReading,
  initializeReadingIds,
  generateRandomReadings,
} from "@/lib/readingService";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import SvgIcon from "@mui/material/SvgIcon";

const SENSOR_STORAGE_KEY = "sensor-app:sensors";
const READING_STORAGE_KEY = "sensor-app:readings";

interface ReadingFormErrors {
  sensorId?: string;
  temperature?: string;
}

interface RandomReadingFormErrors {
  sensorId?: string;
  count?: string;
  minTemperature?: string;
  maxTemperature?: string;
}

type StoredSensor = Omit<Sensor, "createdAt"> & { createdAt: string };
type StoredReading = Omit<SensorReading, "createdAt"> & { createdAt: string };

function DeleteIcon() {
  return (
    <SvgIcon fontSize="small" viewBox="0 0 24 24">
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </SvgIcon>
  );
}

export function ReadingsApp() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const [readingMode, setReadingMode] = useState<"manual" | "random">(
    "manual",
  );

  const [selectedSensorId, setSelectedSensorId] = useState<string>("");
  const [temperature, setTemperature] = useState<string>("");
  const [errors, setErrors] = useState<ReadingFormErrors>({});

  const [randomCount, setRandomCount] = useState<string>("10");
  const [randomMinTemperature, setRandomMinTemperature] =
    useState<string>("20");
  const [randomMaxTemperature, setRandomMaxTemperature] =
    useState<string>("30");
  const [randomErrors, setRandomErrors] = useState<RandomReadingFormErrors>(
    {},
  );

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
        initializeReadingIds(restoredReadings);
      }
    } catch (error) {
      console.error(
        "Erro ao carregar sensores/leituras do cache do navegador:",
        error,
      );
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;

    try {
      const serializedReadings: StoredReading[] = readings.map((reading) => ({
        ...reading,
        createdAt: reading.createdAt.toISOString(),
      }));

      window.localStorage.setItem(
        READING_STORAGE_KEY,
        JSON.stringify(serializedReadings),
      );
    } catch (error) {
      console.error("Erro ao salvar leituras no cache do navegador:", error);
    }
  }, [readings, isHydrated]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors: ReadingFormErrors = {};

    if (!selectedSensorId) {
      validationErrors.sensorId = "Selecione um sensor.";
    }

    const tempNumber = Number(temperature);
    if (Number.isNaN(tempNumber)) {
      validationErrors.temperature =
        "Informe uma temperatura válida (ex.: 23.5).";
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const reading = createReading({
      sensorId: Number(selectedSensorId),
      temperature,
    });

    setReadings((previous) => [...previous, reading]);
    setTemperature("");
  }

  function handleGenerateRandomReadings() {
    const validationErrors: RandomReadingFormErrors = {};

    if (!selectedSensorId) {
      validationErrors.sensorId = "Selecione um sensor.";
    }

    const countNumber = Number(randomCount);
    if (!Number.isInteger(countNumber) || countNumber <= 0) {
      validationErrors.count =
        "Informe uma quantidade inteira maior que zero.";
    }

    const minNumber = Number(randomMinTemperature);
    const maxNumber = Number(randomMaxTemperature);

    if (Number.isNaN(minNumber)) {
      validationErrors.minTemperature =
        "Informe uma temperatura mínima válida.";
    }

    if (Number.isNaN(maxNumber)) {
      validationErrors.maxTemperature =
        "Informe uma temperatura máxima válida.";
    }

    setRandomErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const readingsToAdd = generateRandomReadings({
      sensorId: Number(selectedSensorId),
      count: countNumber,
      minTemperature: minNumber,
      maxTemperature: maxNumber,
    });

    if (readingsToAdd.length === 0) {
      return;
    }

    setReadings((previous) => [...previous, ...readingsToAdd]);
  }

  const hasSensors = sensors.length > 0;
  const sensorError =
    readingMode === "manual" ? errors.sensorId : randomErrors.sensorId;

  return (
    <Container maxWidth="lg" className="app-container">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Inserção de dados de temperatura
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Registre leituras de temperatura associadas aos sensores cadastrados,
          simulando a coleta automática dos dados.
        </Typography>
      </Box>

      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Registro de leituras
        </Typography>

        {!hasSensors ? (
          <Typography variant="body2" color="text.secondary">
            Nenhum sensor cadastrado. Cadastre pelo menos um sensor na tela de{" "}
            &quot;Cadastro de sensores&quot; para registrar leituras.
          </Typography>
        ) : (
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Box
              sx={{
                mb: 2,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <ToggleButtonGroup
                color="primary"
                exclusive
                size="small"
                value={readingMode}
                onChange={(_, newMode) => {
                  if (!newMode) return;
                  setReadingMode(newMode as "manual" | "random");
                  setErrors({});
                  setRandomErrors({});
                }}
              >
                <ToggleButton value="manual">Inserção manual</ToggleButton>
                <ToggleButton value="random">Geração aleatória</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  id="sensorId"
                  label="Sensor"
                  value={selectedSensorId}
                  onChange={(event) => setSelectedSensorId(event.target.value)}
                  error={Boolean(sensorError)}
                  helperText={sensorError}
                >
                  {sensors.map((sensor) => (
                    <MenuItem key={sensor.id} value={sensor.id}>
                      {sensor.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {readingMode === "manual" ? (
                <>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      id="temperature"
                      label="Temperatura (°C)"
                      type="number"
                      value={temperature}
                      onChange={(event) => setTemperature(event.target.value)}
                      placeholder="Ex.: 23.5"
                      inputProps={{ step: "0.1" }}
                      error={Boolean(errors.temperature)}
                      helperText={errors.temperature}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Box
                      sx={{
                        mt: 1,
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button type="submit" variant="contained">
                        Registrar leitura
                      </Button>
                    </Box>
                  </Grid>
                </>
              ) : (
                <>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      id="randomCount"
                      label="Quantidade de leituras"
                      type="number"
                      value={randomCount}
                      onChange={(event) => setRandomCount(event.target.value)}
                      inputProps={{ min: 1, step: 1 }}
                      error={Boolean(randomErrors.count)}
                      helperText={randomErrors.count}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      id="randomMinTemperature"
                      label="Temperatura mínima (°C)"
                      type="number"
                      value={randomMinTemperature}
                      onChange={(event) =>
                        setRandomMinTemperature(event.target.value)
                      }
                      inputProps={{ step: "0.1" }}
                      error={Boolean(randomErrors.minTemperature)}
                      helperText={randomErrors.minTemperature}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      id="randomMaxTemperature"
                      label="Temperatura máxima (°C)"
                      type="number"
                      value={randomMaxTemperature}
                      onChange={(event) =>
                        setRandomMaxTemperature(event.target.value)
                      }
                      inputProps={{ step: "0.1" }}
                      error={Boolean(randomErrors.maxTemperature)}
                      helperText={randomErrors.maxTemperature}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Box
                      sx={{
                        mt: 1,
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        type="button"
                        variant="outlined"
                        onClick={handleGenerateRandomReadings}
                      >
                        Gerar leituras aleatórias
                      </Button>
                    </Box>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        )}
      </Paper>

      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Leituras registradas
        </Typography>

        {readings.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Nenhuma leitura registrada ainda. Utilize o formulário acima para
            inserir dados de temperatura.
          </Typography>
        ) : (
          <TableContainer component={Box}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Sensor</TableCell>
                  <TableCell>Temperatura (°C)</TableCell>
                  <TableCell>Data e hora</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {readings.map((reading) => {
                  const sensor = sensors.find(
                    (item) => item.id === reading.sensorId,
                  );

                  return (
                    <TableRow key={reading.id}>
                      <TableCell>
                        {sensor ? sensor.name : "Sensor removido"}
                      </TableCell>
                      <TableCell>{reading.temperature.toFixed(1)}</TableCell>
                      <TableCell>
                        {reading.createdAt.toLocaleString("pt-BR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Excluir leitura">
                          <IconButton
                            size="small"
                            color="error"
                            aria-label="Excluir leitura"
                            onClick={() =>
                              setReadings((previous) =>
                                previous.filter(
                                  (current) => current.id !== reading.id,
                                ),
                              )
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
}

