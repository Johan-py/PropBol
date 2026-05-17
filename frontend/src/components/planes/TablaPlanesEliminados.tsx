"use client";

const planesEliminados = [
  {
    id: 3,
    nombre: "Empresarial",
    precioMensual: 150,
    limitePublicaciones: 50,
    vigenciaDias: 30,
  },
];

export default function TablaPlanesEliminados() {
  return (
    <div className="border rounded-2xl p-5">
      <h2 className="text-2xl font-semibold mb-5">
        Historial de Planes Eliminados
      </h2>

      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3">Nombre</th>

            <th className="text-left py-3">Precio/Mes</th>

            <th className="text-left py-3">Publicaciones</th>

            <th className="text-left py-3">Vigencia</th>

            <th className="text-left py-3">Estado</th>

            <th className="text-left py-3">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {planesEliminados.map((plan) => (
            <tr key={plan.id} className="border-b">
              <td className="py-4">{plan.nombre}</td>

              <td>Bs. {plan.precioMensual}</td>

              <td>{plan.limitePublicaciones}</td>

              <td>{plan.vigenciaDias} días</td>

              <td>
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                  Eliminado
                </span>
              </td>

              <td>
                <button className="bg-green-600 text-white px-3 py-2 rounded-lg">
                  Restaurar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
