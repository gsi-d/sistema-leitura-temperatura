'use client';

import { ReactNode, useEffect, useMemo, useState } from "react";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'; 
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
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import SvgIcon from "@mui/material/SvgIcon";
import { NavMenu } from "./NavMenu";

interface AppProvidersProps {
  children: ReactNode;
}

function LightModeIcon() {
  return (
    <SvgIcon fontSize="medium" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="5" fill="currentColor" />
      <g
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      >
        <line x1="12" y1="2" x2="12" y2="5" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="2" y1="12" x2="5" y2="12" />
        <line x1="19" y1="12" x2="22" y2="12" />
        <line x1="5" y1="5" x2="7" y2="7" />
        <line x1="17" y1="17" x2="19" y2="19" />
        <line x1="5" y1="19" x2="7" y2="17" />
        <line x1="17" y1="7" x2="19" y2="5" />
      </g>
    </SvgIcon>
  );
}

function DarkModeIcon() {
  return (
    <SvgIcon fontSize="medium" viewBox="0 0 24 24">
      <path
        d="M21 13.5A7.5 7.5 0 0 1 10.5 3 7.5 7.5 0 1 0 21 13.5Z"
        fill="currentColor"
      />
    </SvgIcon>
  );
}

export function AppProviders({ children }: AppProvidersProps) {
  const [mode, setMode] = useState<PaletteMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedMode = window.localStorage.getItem("theme-mode") as PaletteMode | null;
    
    if (storedMode === "light" || storedMode === "dark") {
      setMode(storedMode);
    } else if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setMode("dark");
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      window.localStorage.setItem("theme-mode", mode);
    }
  }, [mode, mounted]);

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
    <AppRouterCacheProvider>
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
                flexWrap: "nowrap",
                minWidth: 0,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flex: 1,
                  justifyContent: "flex-end",
                  minWidth: 0,
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <NavMenu />
                </Box>
                <Tooltip
                  title={
                    mode === "dark" ? "Usar tema claro" : "Usar tema escuro"
                  }
                >
                  <IconButton
                    color="inherit"
                    sx={{
                      color: mode === "dark" ? "#ffeb3b" : "#ffffff",
                    }}
                    aria-label={
                      mode === "dark"
                        ? "Alterar para tema claro"
                        : "Alterar para tema escuro"
                    }
                    onClick={() =>
                      setMode((previous) =>
                        previous === "light" ? "dark" : "light",
                      )
                    }
                    edge="end"
                  >
                    {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Toolbar>
          </AppBar>

          <main className="app-main">{children}</main>
        </div>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
