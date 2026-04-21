import type { DatosPropiedad } from "./ResumenPanel";

interface Props {
  datos: DatosPropiedad;
}

export default function InfoPropiedad({ datos }: Props) {
  const valor = (texto?: string) =>
    texto && texto.trim() !== "" ? texto : "No registrado";

  return (
    <div className="rounded-2xl border border-gray-200 bg-[#f7f7f7] p-6">
      <h3 className="mb-5 text-2xl font-semibold text-[#0f172a]">
        Datos Generales
      </h3>

      <div className="space-y-4 text-base text-gray-700 md:text-lg">
        <p>
          <span className="font-semibold text-[#0f172a]">Título del anuncio:</span>{" "}
          {valor(datos.titulo)}
        </p>

        <p>
          <span className="font-semibold text-[#0f172a]">Tipo de operación:</span>{" "}
          {valor(datos.tipoOperacion)}
        </p>

        <p>
          <span className="font-semibold text-[#0f172a]">Tipo inmueble:</span>{" "}
          {valor(datos.tipoInmueble)}
        </p>

        <p>
          <span className="font-semibold text-[#0f172a]">Precio:</span>{" "}
          {valor(datos.precio)}
        </p>

        <p>
          <span className="font-semibold text-[#0f172a]">Área total:</span>{" "}
          {valor(datos.areaTotal)}
        </p>

        <p>
          <span className="font-semibold text-[#0f172a]">Habitaciones:</span>{" "}
          {valor(datos.habitaciones)}
        </p>

        <p>
          <span className="font-semibold text-[#0f172a]">Baños:</span>{" "}
          {valor(datos.banos)}
        </p>

        <p>
          <span className="font-semibold text-[#0f172a]">Dirección:</span>{" "}
          {valor(datos.direccion)}
        </p>

        <p>
          <span className="font-semibold text-[#0f172a]">Zona:</span>{" "}
          {valor(datos.zona)}
        </p>

        <div>
          <p className="mb-2 font-semibold text-[#0f172a]">
            Descripción detallada:
          </p>
          <p className="leading-7 text-gray-700">{valor(datos.descripcion)}</p>
        </div>
      </div>
    </div>
  );
}
