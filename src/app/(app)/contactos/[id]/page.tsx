import { Suspense } from "react";
import { notFound } from "next/navigation";
import { obtenerContextoConEmpresa } from "@/lib/contexto";
import { obtenerContacto, tiposDeContacto } from "../datos";
import { FormularioContacto } from "../formulario";
import { borrarContacto } from "../acciones";

export const metadata = { title: "Contacto · Global ERP" };

async function Contenido({ params }: { params: PageProps<"/contactos/[id]">["params"] }) {
  const { id } = await params;
  const ctx = await obtenerContextoConEmpresa();
  const [contacto, tipos] = await Promise.all([obtenerContacto(ctx.empresa.id, id), tiposDeContacto(ctx.empresa.id)]);
  // Si no existe o tu rol no puede verlo, la base de datos no lo devuelve
  if (!contacto) notFound();

  const puedeEditar = ctx.alcance("contactos.editar") !== null;
  const puedeBorrar = ctx.alcance("contactos.borrar") !== null;

  return (
    <>
      <h1 className="mb-4 text-xl font-semibold">{contacto.nombre}</h1>
      <div className="tarjeta p-6">
        {puedeEditar ? (
          <FormularioContacto contacto={contacto} tipos={tipos} />
        ) : (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {[
              ["Papel", contacto.papeles.map((p) => p.nombre).join(", ")],
              ["Nombre comercial", contacto.nombre_comercial],
              ["NIF", contacto.nif],
              ["Email", contacto.email],
              ["Teléfono", contacto.telefono],
              ["Dirección", [contacto.direccion, contacto.codigo_postal, contacto.poblacion, contacto.provincia].filter(Boolean).join(", ")],
              ["Notas", contacto.notas],
            ].map(([k, v]) => (
              <div key={k as string}>
                <dt className="text-tenue">{k}</dt>
                <dd>{v || "—"}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      {puedeBorrar && (
        <form action={borrarContacto} className="mt-6">
          <input type="hidden" name="id" value={contacto.id} />
          <button className="text-sm text-peligro hover:underline">Borrar este contacto</button>
        </form>
      )}
    </>
  );
}

export default function PaginaContacto(props: PageProps<"/contactos/[id]">) {
  return (
    <div className="mx-auto max-w-3xl">
      <Suspense fallback={<p className="text-sm text-tenue">Cargando…</p>}>
        <Contenido params={props.params} />
      </Suspense>
    </div>
  );
}
