"use client";

import { useActionState } from "react";
import { crearEmpresa, type EstadoFormulario } from "../../acciones";

export function FormularioEmpresa() {
  const [estado, accion, pendiente] = useActionState<EstadoFormulario, FormData>(crearEmpresa, undefined);

  return (
    <form action={accion} className="flex flex-col gap-4">
      <div>
        <label className="etiqueta" htmlFor="nombre">Nombre de la empresa</label>
        <input className="campo" id="nombre" name="nombre" required autoFocus />
      </div>
      <div>
        <label className="etiqueta" htmlFor="nif">NIF / CIF <span className="font-normal text-tenue">(opcional)</span></label>
        <input className="campo" id="nif" name="nif" />
      </div>
      {estado?.error && <p className="text-sm text-peligro">{estado.error}</p>}
      <button className="boton" disabled={pendiente}>{pendiente ? "Creando…" : "Crear empresa"}</button>
    </form>
  );
}
