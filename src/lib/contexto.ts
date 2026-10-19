import { cache } from "react";
import { redirect } from "next/navigation";
import { crearCliente } from "@/lib/supabase/server";

export type Alcance = "todo" | "propio";

export type Contexto = {
  usuario: { id: string; email: string | null; nombre: string | null };
  empresas: { id: string; nombre: string }[];
  empresa: { id: string; nombre: string } | null;
  rol: { nombre: string; esAdmin: boolean } | null;
  miembroId: string | null;
  /** Alcance del permiso en la empresa activa, o null si no lo tiene. */
  alcance: (permiso: string) => Alcance | null;
};

type FilaMiembro = {
  id: string;
  empresa_id: string;
  empresas: { id: string; nombre: string } | null;
  roles: {
    nombre: string;
    es_admin: boolean;
    roles_permisos: { permiso: string; alcance: Alcance }[];
  } | null;
};

/**
 * Quién es el usuario, a qué empresas pertenece, cuál tiene activa y qué puede hacer en ella.
 * Se calcula una vez por petición. La base de datos vuelve a comprobar cada permiso:
 * esto solo sirve para mostrar u ocultar cosas en pantalla.
 */
export const obtenerContexto = cache(async (): Promise<Contexto> => {
  const supabase = await crearCliente();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const [{ data: usuario }, { data: miembros }] = await Promise.all([
    supabase.from("usuarios").select("id, email, nombre, ultima_empresa_id").eq("id", user.id).maybeSingle(),
    supabase
      .from("miembros")
      .select("id, empresa_id, empresas(id, nombre), roles(nombre, es_admin, roles_permisos(permiso, alcance))")
      .eq("usuario_id", user.id)
      .eq("activo", true),
  ]);

  const filas = ((miembros ?? []) as unknown as FilaMiembro[]).filter((m) => m.empresas);
  const empresas = filas
    .map((m) => ({ id: m.empresas!.id, nombre: m.empresas!.nombre }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  const activa =
    filas.find((m) => m.empresa_id === usuario?.ultima_empresa_id) ??
    filas.sort((a, b) => a.empresas!.nombre.localeCompare(b.empresas!.nombre, "es"))[0];

  const permisos = new Map<string, Alcance>(
    (activa?.roles?.roles_permisos ?? []).map((p) => [p.permiso, p.alcance]),
  );
  const esAdmin = activa?.roles?.es_admin ?? false;

  return {
    usuario: { id: user.id, email: usuario?.email ?? user.email ?? null, nombre: usuario?.nombre ?? null },
    empresas,
    empresa: activa?.empresas ? { id: activa.empresas.id, nombre: activa.empresas.nombre } : null,
    rol: activa?.roles ? { nombre: activa.roles.nombre, esAdmin } : null,
    miembroId: activa?.id ?? null,
    alcance: (permiso) => (esAdmin ? "todo" : (permisos.get(permiso) ?? null)),
  };
});

/** Igual que obtenerContexto, pero exige tener una empresa activa. */
export async function obtenerContextoConEmpresa() {
  const ctx = await obtenerContexto();
  if (!ctx.empresa) redirect("/empresas/nueva");
  return ctx as Contexto & { empresa: { id: string; nombre: string } };
}
