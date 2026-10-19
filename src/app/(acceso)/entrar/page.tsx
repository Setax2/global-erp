import { FormularioAcceso } from "../formulario-acceso";

export const metadata = { title: "Entrar · Global ERP" };

export default function PaginaEntrar() {
  return (
    <>
      <h1 className="mb-5 text-xl font-semibold">Entrar</h1>
      <FormularioAcceso modo="entrar" />
    </>
  );
}
