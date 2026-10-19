"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { crearCliente } from "@/lib/supabase/server";

export type EstadoFormulario = { error?: string } | undefined;

export async function cambiarEmpresa(datos: FormData) {
  const empresaId = String(datos.get("empresa_id") ?? "");
  const supabase = await crearCliente();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !empresaId) redirect("/");

  // La regla de seguridad solo deja elegir empresas de las que eres miembro
  await supabase.from("usuarios").update({ ultima_empresa_id: empresaId }).eq("id", user.id);
  revalidatePath("/", "layout");
  redirect("/contactos");
}

export async function crearEmpresa(_: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  const nombre = String(datos.get("nombre") ?? "").trim();
  const nif = String(datos.get("nif") ?? "").trim() || null;
  if (!nombre) return { error: "La empresa necesita un nombre." };

  const supabase = await crearCliente();
  const { error } = await supabase.rpc("crear_empresa", { p_nombre: nombre, ...(nif ? { p_nif: nif } : {}) });
  if (error) return { error: "No se ha podido crear la empresa: " + error.message };

  revalidatePath("/", "layout");
  redirect("/contactos");
}
