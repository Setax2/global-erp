"use client";

import Link from "next/link";
import { useActionState } from "react";
import { entrar, registrarse, type EstadoFormulario } from "./acciones";

export function FormularioAcceso({ modo }: { modo: "entrar" | "registro" }) {
  const [estado, accion, pendiente] = useActionState<EstadoFormulario, FormData>(
    modo === "entrar" ? entrar : registrarse,
    undefined,
  );

  return (
    <form action={accion} className="flex flex-col gap-4">
      {modo === "registro" && (
        <div>
          <label className="etiqueta" htmlFor="nombre">Tu nombre</label>
          <input className="campo" id="nombre" name="nombre" autoComplete="name" required />
        </div>
      )}
      <div>
        <label className="etiqueta" htmlFor="email">Email</label>
        <input className="campo" id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div>
        <label className="etiqueta" htmlFor="password">Contraseña</label>
        <input
          className="campo"
          id="password"
          name="password"
          type="password"
          autoComplete={modo === "entrar" ? "current-password" : "new-password"}
          minLength={modo === "registro" ? 8 : undefined}
          required
        />
      </div>

      {estado?.error && <p className="text-sm text-peligro">{estado.error}</p>}
      {estado?.aviso && <p className="rounded-md bg-acento-suave p-3 text-sm">{estado.aviso}</p>}

      <button className="boton" disabled={pendiente}>
        {pendiente ? "Un momento…" : modo === "entrar" ? "Entrar" : "Crear cuenta"}
      </button>

      <p className="text-center text-sm text-tenue">
        {modo === "entrar" ? (
          <>¿No tienes cuenta? <Link className="text-acento underline" href="/registro">Regístrate</Link></>
        ) : (
          <>¿Ya tienes cuenta? <Link className="text-acento underline" href="/entrar">Entra</Link></>
        )}
      </p>
    </form>
  );
}
