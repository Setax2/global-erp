import { Suspense } from "react";
import { redirect } from "next/navigation";
import { obtenerContexto } from "@/lib/contexto";

async function Redirigir() {
  const ctx = await obtenerContexto();
  redirect(ctx.empresa ? "/contactos" : "/empresas/nueva");
  return null;
}

export default function Inicio() {
  return (
    <Suspense fallback={<p className="text-sm text-tenue">Cargando…</p>}>
      <Redirigir />
    </Suspense>
  );
}
