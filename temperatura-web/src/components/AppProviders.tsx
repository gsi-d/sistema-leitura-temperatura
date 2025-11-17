'use client';

import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  ThemeProvider,
  createTheme,
  PaletteMode,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { NavMenu } from "./NavMenu";

interface AppProvidersProps {
  children: ReactNode;
}

function getInitialMode(): PaletteMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedMode = window.localStorage.getItem(
    "theme-mode",
  ) as PaletteMode | null;

  if (storedMode === "light" || storedMode === "dark") {
    return storedMode;
  }

  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return "light";
}

export function AppProviders({ children }: AppProvidersProps) {
  const [mode, setMode] = useState<PaletteMode>(getInitialMode);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("theme-mode", mode);
    }
  }, [mode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: "#1976d2",
          },
          background: {
            default: mode === "light" ? "#f5f5f5" : "#121212",
            paper: mode === "light" ? "#ffffff" : "#1e1e1e",
          },
        },
        typography: {
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
        shape: {
          borderRadius: 8,
        },
      }),
    [mode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app-shell">
        <AppBar position="static" color="primary" enableColorOnDark>
          <Toolbar
            sx={{
              maxWidth: "1100px",
              width: "100%",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              px: 2,
            }}
          >
            <Typography variant="h6" component="h1" sx={{ fontSize: 18 }}>
              Sistema de Leitura de Temperatura
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <NavMenu />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={mode === "dark"}
                    onChange={() =>
                      setMode((previous) =>
                        previous === "light" ? "dark" : "light",
                      )
                    }
                  />
                }
                label="Tema escuro"
              />
            </Box>
          </Toolbar>
        </AppBar>

        <main className="app-main">{children}</main>
      </div>
    </ThemeProvider>
  );
}
