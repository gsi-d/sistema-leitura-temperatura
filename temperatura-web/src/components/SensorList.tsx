import { Sensor } from "@/lib/sensorService";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Box from "@mui/material/Box";

interface SensorListProps {
  sensors: Sensor[];
}

export function SensorList({ sensors }: SensorListProps) {
  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
        Sensores cadastrados
      </Typography>
      {sensors.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Nenhum sensor cadastrado ainda. Utilize o formulário acima.
        </Typography>
      ) : (
        <TableContainer component={Box}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Latitude</TableCell>
                <TableCell>Longitude</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Data de cadastro</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sensors.map((sensor) => (
                <TableRow key={sensor.id}>
                  <TableCell>{sensor.name}</TableCell>
                  <TableCell>{sensor.latitude.toFixed(6)}</TableCell>
                  <TableCell>{sensor.longitude.toFixed(6)}</TableCell>
                  <TableCell>
                    {sensor.type === "indoor" ? "Interno" : "Externo"}
                  </TableCell>
                  <TableCell>
                    {sensor.createdAt.toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}

