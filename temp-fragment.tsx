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

