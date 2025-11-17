'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";

const navItems = [
  { href: "/", label: "Cadastro de sensores" },
  { href: "/insercao-dados", label: "Inserção de dados" },
  { href: "/historico", label: "Gráficos / Histórico" },
  { href: "/tempo-real", label: "Leitura em tempo real" },
  { href: "/mapas", label: "Mapas interativos" },
];

export function NavMenu() {
  const pathname = usePathname();

  return (
    <Box
      component="nav"
      aria-label="Navegação principal"
      sx={{ flex: 1, minWidth: 0 }}
    >
      <ButtonGroup
        variant="text"
        color="inherit"
        aria-label="Menu principal"
        fullWidth
        sx={{
          flexWrap: "nowrap",
          borderRadius: 999,
          bgcolor: "rgba(255,255,255,0.06)",
          overflowX: "auto",
          "& .MuiButton-root": {
            flex: 1,
            minWidth: 0,
            textTransform: "none",
            fontSize: 14,
            fontWeight: 500,
            whiteSpace: "nowrap",
            px: 3.25,
            py: 1.1,
          },
        }}
      >
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Button
              key={item.href}
              component={Link}
              href={item.href}
              size="medium"
              disableRipple
              sx={
                isActive
                  ? {
                      fontWeight: 600,
                      bgcolor: "rgba(255,255,255,0.16)",
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.24)",
                      },
                    }
                  : {
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.08)",
                      },
                    }
              }
            >
              {item.label}
            </Button>
          );
        })}
      </ButtonGroup>
    </Box>
  );
}
