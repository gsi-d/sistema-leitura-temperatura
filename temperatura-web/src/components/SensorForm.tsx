'use client';

import { useState, FormEvent } from "react";
import {
  Sensor,
  SensorType,
  createSensor,
  isValidLatitude,
  isValidLongitude,
} from "@/lib/sensorService";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";

interface SensorFormProps {
  onAddSensor: (sensor: Sensor) => void;
}

interface FormErrors {
  name?: string;
  latitude?: string;
  longitude?: string;
}

export function SensorForm({ onAddSensor }: SensorFormProps) {
  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [type, setType] = useState<SensorType>("outdoor");
  const [errors, setErrors] = useState<FormErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors: FormErrors = {};

    if (!name.trim()) {
      validationErrors.name = "Informe um nome para o sensor.";
    }

    if (!isValidLatitude(latitude)) {
      validationErrors.latitude = "Latitude deve estar entre -90 e 90.";
    }

    if (!isValidLongitude(longitude)) {
      validationErrors.longitude = "Longitude deve estar entre -180 e 180.";
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const sensor = createSensor({
      name,
      latitude,
      longitude,
      type,
    });

    onAddSensor(sensor);

    setName("");
    setLatitude("");
    setLongitude("");
    setType("outdoor");
    setErrors({});
  }

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
        Cadastro de sensores
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              id="name"
              label="Nome do sensor"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Sensor 1 - Laboratório"
              error={Boolean(errors.name)}
              helperText={errors.name}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              id="latitude"
              label="Latitude"
              type="number"
              value={latitude}
              onChange={(event) => setLatitude(event.target.value)}
              placeholder="-27.5935"
              inputProps={{ step: "0.000001" }}
              error={Boolean(errors.latitude)}
              helperText={errors.latitude}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              id="longitude"
              label="Longitude"
              type="number"
              value={longitude}
              onChange={(event) => setLongitude(event.target.value)}
              placeholder="-48.5585"
              inputProps={{ step: "0.000001" }}
              error={Boolean(errors.longitude)}
              helperText={errors.longitude}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              id="type"
              label="Tipo de ambiente"
              value={type}
              onChange={(event) =>
                setType(event.target.value as SensorType)
              }
            >
              <MenuItem value="indoor">Interno</MenuItem>
              <MenuItem value="outdoor">Externo</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}>
              <Button type="submit" variant="contained">
                Adicionar sensor
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}

