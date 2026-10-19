"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { crearCliente } from "@/lib/supabase/server";
import { obtenerContextoConEmpresa } from "@/lib/contexto";

export type EstadoContacto = { error?: string } | undefined;

const texto = (datos: FormData, campo: string) => {
  const v = String(datos.get(campo) ?? "").trim();
  return v === "" ? null : v;
};

export async function guardarContacto(_: EstadoContacto, datos: FormData): Promise<EstadoContacto> {
  const ctx = await obtenerContextoConEmpresa();
  const supabase = await crearCliente();
  const id = texto(datos, "id");

  const nombre = texto(datos, "nombre");
  if (!nombre) return { error: "El contacto necesita un nombre." };

  const fila = {
    tipo: datos.get("tipo") === "persona" ? "persona" : "empresa",
    nombre,
    nombre_comercial: texto(datos, "nombre_comercial"),
    nif: texto(datos, "nif")?.toUpperCase() ?? null,
    email: texto(datos, "email")?.toLowerCase() ?? null,
    telefono: texto(datos, "telefono"),
    direccion: texto(datos, "direccion"),
    codigo_postal: texto(datos, "codigo_postal"),
    poblacion: texto(datos, "poblacion"),
    provincia: texto(datos, "provincia"),
    pais: texto(datos, "pais") ?? "ES",
    notas: texto(datos, "notas"),
    activo: id ? datos.get("activo") === "on" : true,
  };

  let contactoId = id;
  if (id) {
    const { data, error } = await supabase.from("contactos").update(fila).eq("id", id).eq("empresa_id", ctx.empresa.id).select("id");
    if (error) return { error: "No se ha podido guardar: " + error.message };
    if (!data?.length) return { error: "No tienes permiso para editar este contacto." };
  } else {
    const { data, error } = await supabase
      .from("contactos")
      .insert({ ...fila, empresa_id: ctx.empresa.id })
      .select("id")
      .single();
    if (error) {
      if (error.code === "42501") return { error: "No tienes permiso para crear contactos." };
      return { error: "No se ha podido crear: " + error.message };
    }
    contactoId = data.id;
  }

  // Papeles: cliente, proveedor, empleado...
  const elegidos = new Set(datos.getAll("papeles").map(String));
  const { data: actuales } = await supabase.from("contactos_tipos").select("tipo_id").eq("contacto_id", contactoId!);
  const tenia = new Set((actuales ?? []).map((t) => t.tipo_id));

  const quitar = [...tenia].filter((t) => !elegidos.has(t));
  const poner = [...elegidos].filter((t) => !tenia.has(t));

  if (quitar.length) {
    await supabase.from("contactos_tipos").delete().eq("contacto_id", contactoId!).in("tipo_id", quitar);
  }
  if (poner.length) {
    const { error } = await supabase
      .from("contactos_tipos")
      .insert(poner.map((tipo_id) => ({ contacto_id: contactoId!, tipo_id, empresa_id: ctx.empresa.id })));
    if (error) return { error: "El contacto se ha guardado, pero no sus papeles: " + error.message };
  }

  revalidatePath("/contactos");
  redirect("/contactos");
}

export async function borrarContacto(datos: FormData) {
  const ctx = await obtenerContextoConEmpresa();
  const id = String(datos.get("id") ?? "");
  const supabase = await crearCliente();
  await supabase.from("contactos").delete().eq("id", id).eq("empresa_id", ctx.empresa.id);
  revalidatePath("/contactos");
  redirect("/contactos");
}
