import Link from "next/link";
import { Suspense } from "react";
import { obtenerContexto } from "@/lib/contexto";
import { salir } from "../(acceso)/acciones";
import { SelectorEmpresa } from "./selector-empresa";

async function Cabecera() {
  const ctx = await obtenerContexto();
  return (
    <>
      <div className="flex min-w-0 items-center gap-3">
        <SelectorEmpresa empresas={ctx.empresas} activa={ctx.empresa?.id ?? null} />
        {ctx.empresa && (
          <nav className="flex items-center gap-1 text-sm">
            <Link className="rounded-md px-2 py-1 hover:bg-fondo" href="/contactos">Contactos</Link>
          </nav>
        )}
      </div>
      <div className="flex items-center gap-3 text-sm">
        <Link className="hidden text-tenue hover:text-texto sm:inline" href="/empresas/nueva">+ Empresa</Link>
        <span className="hidden max-w-48 truncate text-tenue md:inline">{ctx.usuario.nombre ?? ctx.usuario.email}</span>
        <form action={salir}>
          <button className="text-tenue hover:text-texto">Salir</button>
        </form>
      </div>
    </>
  );
}

export default function LayoutApp({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-borde bg-superficie">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/" className="shrink-0 text-xs font-semibold uppercase tracking-[0.2em] text-acento">
            Global ERP
          </Link>
          <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
            <Suspense fallback={<span className="text-sm text-tenue">…</span>}>
              <Cabecera />
            </Suspense>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
