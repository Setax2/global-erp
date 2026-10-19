// Dirección y clave pública del proyecto de Supabase.
// La clave publicable está pensada para ir en el navegador: lo que protege
// los datos son las reglas de seguridad por filas de la base de datos.
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://oyhnbnqmiabmgjwunlad.supabase.co";

export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_f53DGP_jljkKSPnB6Hjvog_zjKZVtOk";
