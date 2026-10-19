import { Suspense } from "react";
import { obtenerContextoConEmpresa } from "@/lib/contexto";
import { tiposDeContacto } from "../datos";
import { FormularioContacto } from "../formulario";

export const metadata = { title: "Nuevo contacto · Global ERP" };

async function Contenido({ searchParams }: { searchParams: PageProps<"/contactos/nuevo">["searchParams"] }) {
  const ctx = await obtenerContextoConEmpresa();
  if (!ctx.alcance("contactos.crear")) {
    return <p className="tarjeta p-6 text-sm text-tenue">Tu rol no tiene permiso para crear contactos.</p>;
  }
  const sp = await searchParams;
  const tipos = await tiposDeContacto(ctx.empresa.id);
  return (
    <div className="tarjeta p-6">
      <FormularioContacto contacto={null} tipos={tipos} papelInicial={typeof sp.papel === "string" ? sp.papel : undefined} />
    </div>
  );
}

export default function NuevoContacto(props: PageProps<"/contactos/nuevo">) {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-xl font-semibold">Nuevo contacto</h1>
      <Suspense fallback={<p className="text-sm text-tenue">Cargando…</p>}>
        <Contenido searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
