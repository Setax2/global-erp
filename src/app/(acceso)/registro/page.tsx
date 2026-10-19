import { FormularioAcceso } from "../formulario-acceso";

export const metadata = { title: "Crear cuenta · Global ERP" };

export default function PaginaRegistro() {
  return (
    <>
      <h1 className="mb-5 text-xl font-semibold">Crear cuenta</h1>
      <FormularioAcceso modo="registro" />
    </>
  );
}
