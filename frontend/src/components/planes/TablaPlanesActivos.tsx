"use client";

const planesActivos = [
  {
    id: 1,
    nombre: "Básico",
    precioMensual: 30,
    limitePublicaciones: 5,
    vigenciaDias: 30,
  },

  {
    id: 2,
    nombre: "Premium",
    precioMensual: 80,
    limitePublicaciones: 20,
    vigenciaDias: 30,
  },
];

export default function TablaPlanesActivos() {
  return (
    <div className="border rounded-2xl p-5">
      <h2 className="text-2xl font-semibold mb-5">Planes Activos</h2>

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
          {planesActivos.map((plan) => (
            <tr key={plan.id} className="border-b">
              <td className="py-4">{plan.nombre}</td>

              <td>Bs. {plan.precioMensual}</td>

              <td>{plan.limitePublicaciones}</td>

              <td>{plan.vigenciaDias} días</td>

              <td>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  Activo
                </span>
              </td>

              <td>
                <div className="flex gap-2">
                  <button className="bg-blue-600 text-white px-3 py-2 rounded-lg">
                    Editar
                  </button>

                  <button className="bg-red-600 text-white px-3 py-2 rounded-lg">
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
