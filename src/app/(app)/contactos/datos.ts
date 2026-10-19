import { crearCliente } from "@/lib/supabase/server";

export type TipoContacto = { id: string; clave: string; nombre: string };

export type Contacto = {
  id: string;
  tipo: "persona" | "empresa";
  nombre: string;
  nombre_comercial: string | null;
  nif: string | null;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  codigo_postal: string | null;
  poblacion: string | null;
  provincia: string | null;
  pais: string | null;
  notas: string | null;
  activo: boolean;
  papeles: TipoContacto[];
};

const COLUMNAS =
  "id, tipo, nombre, nombre_comercial, nif, email, telefono, direccion, codigo_postal, poblacion, provincia, pais, notas, activo, contactos_tipos(tipos_contacto(id, clave, nombre))";

type FilaContacto = Omit<Contacto, "papeles"> & {
  contactos_tipos: { tipos_contacto: TipoContacto | null }[];
};

function aContacto(fila: FilaContacto): Contacto {
  const { contactos_tipos, ...resto } = fila;
  return {
    ...resto,
    papeles: contactos_tipos.flatMap((ct) => (ct.tipos_contacto ? [ct.tipos_contacto] : [])),
  };
}

export async function tiposDeContacto(empresaId: string): Promise<TipoContacto[]> {
  const supabase = await crearCliente();
  const { data } = await supabase
    .from("tipos_contacto")
    .select("id, clave, nombre, de_sistema")
    .eq("empresa_id", empresaId)
    .order("de_sistema", { ascending: false })
    .order("nombre");
  return (data ?? []).map(({ id, clave, nombre }) => ({ id, clave, nombre }));
}

export async function listarContactos(empresaId: string, busqueda: string): Promise<Contacto[]> {
  const supabase = await crearCliente();
  let consulta = supabase.from("contactos").select(COLUMNAS).eq("empresa_id", empresaId).order("nombre").limit(500);

  // Quitamos caracteres que romperían la sintaxis del filtro
  const q = busqueda.replace(/[,()*%\\]/g, " ").trim();
  if (q) {
    const patron = `%${q}%`;
    consulta = consulta.or(
      `nombre.ilike.${patron},nombre_comercial.ilike.${patron},nif.ilike.${patron},email.ilike.${patron},telefono.ilike.${patron}`,
    );
  }

  const { data } = await consulta;
  return ((data ?? []) as unknown as FilaContacto[]).map(aContacto);
}

export async function obtenerContacto(empresaId: string, id: string): Promise<Contacto | null> {
  const supabase = await crearCliente();
  const { data } = await supabase.from("contactos").select(COLUMNAS).eq("empresa_id", empresaId).eq("id", id).maybeSingle();
  return data ? aContacto(data as unknown as FilaContacto) : null;
}
