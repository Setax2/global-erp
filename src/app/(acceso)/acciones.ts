"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { crearCliente } from "@/lib/supabase/server";

export type EstadoFormulario = { error?: string; aviso?: string } | undefined;

export async function entrar(_: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  const email = String(datos.get("email") ?? "").trim();
  const password = String(datos.get("password") ?? "");
  if (!email || !password) return { error: "Escribe tu email y tu contraseña." };

  const supabase = await crearCliente();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.code === "email_not_confirmed") return { error: "Antes de entrar tienes que confirmar tu email. Revisa tu correo." };
    return { error: "Email o contraseña incorrectos." };
  }
  redirect("/");
}

export async function registrarse(_: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  const nombre = String(datos.get("nombre") ?? "").trim();
  const email = String(datos.get("email") ?? "").trim();
  const password = String(datos.get("password") ?? "");
  if (!nombre || !email || !password) return { error: "Rellena todos los campos." };
  if (password.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres." };

  const cabeceras = await headers();
  const origen = cabeceras.get("origin") ?? `https://${cabeceras.get("host")}`;

  const supabase = await crearCliente();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nombre }, emailRedirectTo: `${origen}/auth/confirmar` },
  });
  if (error) {
    if (error.code === "user_already_exists") return { error: "Ya hay una cuenta con ese email." };
    if (error.code === "weak_password") return { error: "La contraseña es demasiado débil." };
    return { error: "No se ha podido crear la cuenta: " + error.message };
  }

  // Si el proyecto exige confirmar el email, todavía no hay sesión
  if (!data.session) {
    return { aviso: `Te hemos enviado un correo a ${email}. Abre el enlace para confirmar tu cuenta y después entra.` };
  }
  redirect("/");
}

export async function salir() {
  const supabase = await crearCliente();
  await supabase.auth.signOut();
  redirect("/entrar");
}
