import Link from "next/link";
import { Suspense } from "react";
import { obtenerContextoConEmpresa } from "@/lib/contexto";
import { listarContactos, tiposDeContacto, type Contacto, type TipoContacto } from "./datos";

export const metadata = { title: "Contactos · Global ERP" };

const AMBOS = "cliente+proveedor";

function filtrar(contactos: Contacto[], papel: string) {
  if (!papel || papel === "todos") return contactos;
  const claves = papel.split("+");
  return contactos.filter((c) => claves.every((k) => c.papeles.some((p) => p.clave === k)));
}

function Filtros({ tipos, papel, q }: { tipos: TipoContacto[]; papel: string; q: string }) {
  const plural = (n: string) => (/[aeiouáéíóú]$/i.test(n) ? n + "s" : n + "es");
  const opciones = [{ clave: "todos", nombre: "Todos" }, ...tipos.map((t) => ({ clave: t.clave, nombre: plural(t.nombre) }))];
  const hayAmbos = tipos.some((t) => t.clave === "cliente") && tipos.some((t) => t.clave === "proveedor");
  if (hayAmbos) opciones.splice(3, 0, { clave: AMBOS, nombre: "Clientes y proveedores" });

  const enlace = (clave: string) => {
    const p = new URLSearchParams();
    if (clave !== "todos") p.set("papel", clave);
    if (q) p.set("q", q);
    const s = p.toString();
    return "/contactos" + (s ? "?" + s : "");
  };

  return (
    <div className="flex flex-wrap gap-2">
      {opciones.map((o) => {
        const activo = (papel || "todos") === o.clave;
        return (
          <Link
            key={o.clave}
            href={enlace(o.clave)}
            className={
              "rounded-full border px-3 py-1 text-sm transition " +
              (activo ? "border-acento bg-acento text-acento-texto" : "border-borde bg-superficie hover:border-acento")
            }
            title={o.clave === AMBOS ? "Contactos que son a la vez cliente y proveedor" : undefined}
          >
            {o.nombre}
          </Link>
        );
      })}
    </div>
  );
}

async function Listado({ searchParams }: { searchParams: PageProps<"/contactos">["searchParams"] }) {
  const ctx = await obtenerContextoConEmpresa();
  const sp = await searchParams;
  const papel = typeof sp.papel === "string" ? sp.papel : "";
  const q = typeof sp.q === "string" ? sp.q : "";

  const puedeVer = ctx.alcance("contactos.ver");
  if (!puedeVer) {
    return <p className="tarjeta p-6 text-sm text-tenue">Tu rol no tiene permiso para ver contactos.</p>;
  }

  const [tipos, todos] = await Promise.all([tiposDeContacto(ctx.empresa.id), listarContactos(ctx.empresa.id, q)]);
  const contactos = filtrar(todos, papel);
  const puedeCrear = ctx.alcance("contactos.crear") !== null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Contactos</h1>
          {puedeVer === "propio" && <p className="text-sm text-tenue">Ves solo los contactos que tienes asignados.</p>}
        </div>
        {puedeCrear && (
          <Link className="boton" href="/contactos/nuevo">
            Nuevo contacto
          </Link>
        )}
      </div>

      <form className="flex gap-2" action="/contactos">
        {papel && <input type="hidden" name="papel" value={papel} />}
        <input className="campo max-w-md" name="q" defaultValue={q} placeholder="Buscar por nombre, NIF, email o teléfono" />
        <button className="boton-secundario">Buscar</button>
      </form>

      <Filtros tipos={tipos} papel={papel} q={q} />

      {contactos.length === 0 ? (
        <div className="tarjeta p-10 text-center text-sm text-tenue">
          {todos.length === 0 && !q ? "Todavía no hay contactos." : "Ningún contacto coincide con el filtro."}
        </div>
      ) : (
        <div className="tarjeta overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-borde text-left text-tenue">
              <tr>
                <th className="px-4 py-2 font-medium">Nombre</th>
                <th className="px-4 py-2 font-medium">Papel</th>
                <th className="hidden px-4 py-2 font-medium md:table-cell">NIF</th>
                <th className="hidden px-4 py-2 font-medium lg:table-cell">Email</th>
                <th className="hidden px-4 py-2 font-medium md:table-cell">Teléfono</th>
                <th className="hidden px-4 py-2 font-medium lg:table-cell">Población</th>
              </tr>
            </thead>
            <tbody>
              {contactos.map((c) => (
                <tr key={c.id} className="border-b border-borde last:border-0 hover:bg-fondo">
                  <td className="px-4 py-2">
                    <Link href={`/contactos/${c.id}`} className="font-medium hover:text-acento">
                      {c.nombre}
                    </Link>
                    {c.nombre_comercial && <span className="block text-xs text-tenue">{c.nombre_comercial}</span>}
                    {!c.activo && <span className="ml-2 text-xs text-tenue">(inactivo)</span>}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {c.papeles.map((p) => (
                        <span key={p.id} className="rounded bg-acento-suave px-1.5 py-0.5 text-xs">
                          {p.nombre}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="hidden px-4 py-2 font-mono text-xs md:table-cell">{c.nif}</td>
                  <td className="hidden px-4 py-2 lg:table-cell">{c.email}</td>
                  <td className="hidden px-4 py-2 md:table-cell">{c.telefono}</td>
                  <td className="hidden px-4 py-2 lg:table-cell">{c.poblacion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-tenue">{contactos.length} contacto{contactos.length === 1 ? "" : "s"}</p>
    </div>
  );
}

export default function PaginaContactos(props: PageProps<"/contactos">) {
  return (
    <Suspense fallback={<p className="text-sm text-tenue">Cargando contactos…</p>}>
      <Listado searchParams={props.searchParams} />
    </Suspense>
  );
}
