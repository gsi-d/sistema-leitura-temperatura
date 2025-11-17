'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
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
    <nav aria-label="Navegação principal">
      <ButtonGroup
        variant="outlined"
        color="inherit"
        aria-label="Menu principal"
        sx={{ flexWrap: "wrap" }}
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
              size="small"
              variant={isActive ? "contained" : "outlined"}
              sx={{ textTransform: "none" }}
            >
              {item.label}
            </Button>
          );
        })}
      </ButtonGroup>
    </nav>
  );
}

