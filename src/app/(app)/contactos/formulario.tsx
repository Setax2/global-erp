"use client";

import Link from "next/link";
import { useActionState } from "react";
import { guardarContacto, type EstadoContacto } from "./acciones";
import type { Contacto, TipoContacto } from "./datos";

export function FormularioContacto({
  contacto,
  tipos,
  papelInicial,
}: {
  contacto: Contacto | null;
  tipos: TipoContacto[];
  papelInicial?: string;
}) {
  const [estado, accion, pendiente] = useActionState<EstadoContacto, FormData>(guardarContacto, undefined);
  const papeles = new Set(
    contacto ? contacto.papeles.map((p) => p.id) : tipos.filter((t) => t.clave === papelInicial).map((t) => t.id),
  );

  return (
    <form action={accion} className="flex flex-col gap-5">
      {contacto && <input type="hidden" name="id" value={contacto.id} />}

      <fieldset>
        <legend className="etiqueta">Papel</legend>
        <div className="flex flex-wrap gap-3">
          {tipos.map((t) => (
            <label key={t.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="papeles" value={t.id} defaultChecked={papeles.has(t.id)} className="accent-acento" />
              {t.nombre}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
        <div>
          <label className="etiqueta" htmlFor="tipo">Es</label>
          <select className="campo" id="tipo" name="tipo" defaultValue={contacto?.tipo ?? "empresa"}>
            <option value="empresa">Empresa</option>
            <option value="persona">Persona</option>
          </select>
        </div>
        <div>
          <label className="etiqueta" htmlFor="nombre">Nombre o razón social</label>
          <input className="campo" id="nombre" name="nombre" defaultValue={contacto?.nombre} required autoFocus={!contacto} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo nombre="nombre_comercial" etiqueta="Nombre comercial" valor={contacto?.nombre_comercial} />
        <Campo nombre="nif" etiqueta="NIF / CIF" valor={contacto?.nif} />
        <Campo nombre="email" etiqueta="Email" tipo="email" valor={contacto?.email} />
        <Campo nombre="telefono" etiqueta="Teléfono" tipo="tel" valor={contacto?.telefono} />
      </div>

      <Campo nombre="direccion" etiqueta="Dirección" valor={contacto?.direccion} />
      <div className="grid gap-4 sm:grid-cols-4">
        <Campo nombre="codigo_postal" etiqueta="C. postal" valor={contacto?.codigo_postal} />
        <Campo nombre="poblacion" etiqueta="Población" valor={contacto?.poblacion} />
        <Campo nombre="provincia" etiqueta="Provincia" valor={contacto?.provincia} />
        <Campo nombre="pais" etiqueta="País" valor={contacto?.pais ?? "ES"} />
      </div>

      <div>
        <label className="etiqueta" htmlFor="notas">Notas</label>
        <textarea className="campo min-h-24" id="notas" name="notas" defaultValue={contacto?.notas ?? ""} />
      </div>

      {contacto && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="activo" defaultChecked={contacto.activo} className="accent-acento" />
          Activo
        </label>
      )}

      {estado?.error && <p className="text-sm text-peligro">{estado.error}</p>}

      <div className="flex gap-2">
        <button className="boton" disabled={pendiente}>{pendiente ? "Guardando…" : "Guardar"}</button>
        <Link className="boton-secundario" href="/contactos">Cancelar</Link>
      </div>
    </form>
  );
}

function Campo({ nombre, etiqueta, valor, tipo = "text" }: { nombre: string; etiqueta: string; valor?: string | null; tipo?: string }) {
  return (
    <div>
      <label className="etiqueta" htmlFor={nombre}>{etiqueta}</label>
      <input className="campo" id={nombre} name={nombre} type={tipo} defaultValue={valor ?? ""} />
    </div>
  );
}
