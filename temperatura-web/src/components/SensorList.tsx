// Material UI
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import SvgIcon from "@mui/material/SvgIcon";

// Utils
import { SensorListProps } from "@/app/utils/types";

// Ícone de exclusão
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

// Recebe os sensores e a função de exclusão via props para renderizar a lista
export function SensorList({ sensors, onDeleteSensor }: SensorListProps) {
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
                <TableCell>Data de cadastro</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sensors.map((sensor) => (
                <TableRow key={sensor.id}>
                  <TableCell>{sensor.name}</TableCell>
                  <TableCell>{sensor.latitude?.toFixed(6)}</TableCell>
                  <TableCell>{sensor.longitude?.toFixed(6)}</TableCell>
                  <TableCell>
                    {sensor.createdAt.toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Excluir sensor">
                      <IconButton
                        size="small"
                        color="error"
                        aria-label="Excluir sensor"
                        onClick={() => onDeleteSensor(sensor.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
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
