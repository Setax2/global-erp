import { Suspense } from "react";
import { obtenerContexto } from "@/lib/contexto";
import { FormularioEmpresa } from "./formulario";

export const metadata = { title: "Nueva empresa · Global ERP" };

async function Intro() {
  const ctx = await obtenerContexto();
  return ctx.empresas.length === 0 ? (
    <p className="mb-5 text-sm text-tenue">
      Para empezar, crea tu empresa. Quedarás como administrador y tendrás ya preparados los roles
      Comercial, Almacén y Administración, que podrás cambiar cuando quieras.
    </p>
  ) : (
    <p className="mb-5 text-sm text-tenue">
      Puedes trabajar con varias empresas y cambiar entre ellas desde arriba. Cada una tiene sus
      datos completamente separados.
    </p>
  );
}

export default function NuevaEmpresa() {
  return (
    <div className="mx-auto max-w-md">
      <div className="tarjeta p-6">
        <h1 className="mb-2 text-xl font-semibold">Nueva empresa</h1>
        <Suspense fallback={<div className="mb-5 h-10" />}>
          <Intro />
        </Suspense>
        <FormularioEmpresa />
      </div>
    </div>
  );
}
