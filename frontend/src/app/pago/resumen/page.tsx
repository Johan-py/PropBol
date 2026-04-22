import { Suspense } from "react";
import ResumenCliente from "./resumenCliente";

export default function Page(): JSX.Element {
  return (
    <Suspense fallback={<div className="text-center py-10 text-gray-600">Cargando...</div>}>
      <ResumenCliente />
    </Suspense>
  );
}