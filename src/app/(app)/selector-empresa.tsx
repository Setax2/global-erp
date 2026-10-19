"use client";

import { cambiarEmpresa } from "./acciones";

export function SelectorEmpresa({
  empresas,
  activa,
}: {
  empresas: { id: string; nombre: string }[];
  activa: string | null;
}) {
  if (empresas.length === 0) return null;

  if (empresas.length === 1) {
    return <span className="truncate text-sm font-medium">{empresas[0].nombre}</span>;
  }

  return (
    <form action={cambiarEmpresa}>
      <label className="sr-only" htmlFor="empresa_id">Empresa</label>
      <select
        id="empresa_id"
        name="empresa_id"
        defaultValue={activa ?? undefined}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="max-w-48 truncate rounded-md border border-borde bg-superficie px-2 py-1 text-sm font-medium"
      >
        {empresas.map((e) => (
          <option key={e.id} value={e.id}>
            {e.nombre}
          </option>
        ))}
      </select>
    </form>
  );
}
