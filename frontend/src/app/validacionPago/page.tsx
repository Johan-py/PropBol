/*"use client";

import { useEffect, useState } from "react";

// Tipos de datos
interface Transaccion {
  id: number;
  referencia_pago: string;      // Referencia única de pago
  total: number;
  metodo_pago: string;
  estado: "PENDIENTE" | "APROBADO" | "RECHAZADO";
  fecha_intento: string;
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
    correo: string;
  };
  plan_suscripcion: {
    nombre_plan: string;
    duracion_plan_dias: number;
  };
}

export default function ValidacionPagos() {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<number | null>(null);

  // Obtener ID del admin (ajusta según tu autenticación)
  const adminId = 1; // ⚠️ CAMBIA por el ID real del admin logueado

  useEffect(() => {
    fetchTransacciones();
  }, []);

  const fetchTransacciones = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/admin/pagos");
      if (!res.ok) throw new Error("Error al cargar pagos");

      const data = await res.json();
      setTransacciones(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const confirmarPago = async (transaccion: Transaccion) => {
    if (!confirm(`¿Confirmar pago de ${transaccion.usuario.nombre}?`)) return;

    setProcesando(transaccion.id);
    try {
      const res = await fetch("/api/admin/pagos/confirmar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaccionId: transaccion.id,
          adminId: adminId,
        }),
      });

      if (!res.ok) throw new Error("Error al confirmar");

      // Actualizar estado local
      setTransacciones((prev) =>
        prev.map((t) =>
          t.id === transaccion.id
            ? { ...t, estado: "APROBADO" as const }
            : t
        )
      );

      alert(" Pago confirmado y suscripción activada");
    } catch (err) {
      alert(" Error al confirmar el pago");
    } finally {
      setProcesando(null);
    }
  };

  const rechazarPago = async (transaccion: Transaccion) => {
    if (!confirm(`¿Rechazar pago de ${transaccion.usuario.nombre}?`)) return;

    setProcesando(transaccion.id);
    try {
      const res = await fetch("/api/admin/pagos/rechazar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaccionId: transaccion.id,
          adminId: adminId,
        }),
      });

      if (!res.ok) throw new Error("Error al rechazar");

      // Actualizar estado local
      setTransacciones((prev) =>
        prev.map((t) =>
          t.id === transaccion.id
            ? { ...t, estado: "RECHAZADO" as const }
            : t
        )
      );

      alert("❌ Pago rechazado");
    } catch (err) {
      alert("❌ Error al rechazar el pago");
    } finally {
      setProcesando(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Cargando pagos pendientes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
          <button
            onClick={fetchTransacciones}
            className="mt-2 bg-red-500 text-white px-3 py-1 rounded"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Filtrar solo pendientes para mostrar (o mostrar todos según requieras)
  const pendientes = transacciones.filter((t) => t.estado === "PENDIENTE");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Validación De Pagos</h1>

      {pendientes.length === 0 ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          ✅ No hay pagos pendientes de verificación.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 border-b text-left">Usuario</th>
                <th className="px-4 py-3 border-b text-left">Ref. Pago</th>
                <th className="px-4 py-3 border-b text-left">Monto</th>
                <th className="px-4 py-3 border-b text-left">Fecha</th>
                <th className="px-4 py-3 border-b text-left">Estado</th>
                <th className="px-4 py-3 border-b text-left">Acción</th>
              </tr>
            </thead>
            <tbody>
              {pendientes.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 border-b">
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {t.usuario.nombre} {t.usuario.apellido}
                    </div>
                    <div className="text-sm text-gray-500">
                      {t.usuario.correo}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm">
                    {t.referencia_pago || `REF-${t.id}`}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    ${Number(t.total).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(t.fecha_intento).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pendiente
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => confirmarPago(t)}
                        disabled={procesando === t.id}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition disabled:opacity-50"
                      >
                        {procesando === t.id ? "..." : "Confirmar"}
                      </button>
                      <button
                        onClick={() => rechazarPago(t)}
                        disabled={procesando === t.id}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition disabled:opacity-50"
                      >
                        {procesando === t.id ? "..." : "Rechazar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}*/


"use client";

import { useEffect, useState } from "react";

interface Transaccion {
  id: number;
  referencia_pago: string;
  total: number;
  metodo_pago: string;
  estado: "PENDIENTE" | "APROBADO" | "RECHAZADO";
  fecha_intento: string;
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
    correo: string;
  };
  plan_suscripcion: {
    nombre_plan: string;
    duracion_plan_dias: number;
  };
}

// DATOS DE PRUEBA (MOCK)
const DATOS_PRUEBA: Transaccion[] = [
  {
    id: 1,
    referencia_pago: "REF-001-2024",
    total: 49.99,
    metodo_pago: "QR_BANCARIO",
    estado: "PENDIENTE",
    fecha_intento: new Date().toISOString(),
    usuario: {
      id: 1,
      nombre: "Juan",
      apellido: "Pérez",
      correo: "juan@example.com"
    },
    plan_suscripcion: {
      nombre_plan: "Plan Premium",
      duracion_plan_dias: 30
    }
  },
  {
    id: 2,
    referencia_pago: "REF-002-2024",
    total: 99.99,
    metodo_pago: "QR_BANCARIO",
    estado: "PENDIENTE",
    fecha_intento: new Date().toISOString(),
    usuario: {
      id: 2,
      nombre: "María",
      apellido: "García",
      correo: "maria@example.com"
    },
    plan_suscripcion: {
      nombre_plan: "Plan Empresarial",
      duracion_plan_dias: 60
    }
  },
  {
    id: 3,
    referencia_pago: "REF-003-2024",
    total: 29.99,
    metodo_pago: "QR_BANCARIO",
    estado: "PENDIENTE",
    fecha_intento: new Date().toISOString(),
    usuario: {
      id: 3,
      nombre: "Carlos",
      apellido: "López",
      correo: "carlos@example.com"
    },
    plan_suscripcion: {
      nombre_plan: "Plan Básico",
      duracion_plan_dias: 15
    }
  }
];

export default function ValidacionPagos() {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState<number | null>(null);

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setTransacciones(DATOS_PRUEBA);
      setLoading(false);
    }, 1000);
  }, []);

  const confirmarPago = async (transaccion: Transaccion) => {
    if (!confirm(`¿Confirmar pago de ${transaccion.usuario.nombre}?`)) return;

    setProcesando(transaccion.id);
    
    // Simular llamada a API
    setTimeout(() => {
      setTransacciones((prev) =>
        prev.map((t) =>
          t.id === transaccion.id
            ? { ...t, estado: "APROBADO" as const }
            : t
        )
      );
      setProcesando(null);
      alert("✅ Pago confirmado y suscripción activada");
    }, 500);
  };

  const rechazarPago = async (transaccion: Transaccion) => {
    if (!confirm(`¿Rechazar pago de ${transaccion.usuario.nombre}?`)) return;

    setProcesando(transaccion.id);
    
    // Simular llamada a API
    setTimeout(() => {
      setTransacciones((prev) =>
        prev.map((t) =>
          t.id === transaccion.id
            ? { ...t, estado: "RECHAZADO" as const }
            : t
        )
      );
      setProcesando(null);
      alert("❌ Pago rechazado");
    }, 500);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Cargando pagos pendientes...</div>
      </div>
    );
  }

  const pendientes = transacciones.filter((t) => t.estado === "PENDIENTE");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Validación De Pagos</h1>

      {pendientes.length === 0 ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          ✅ No hay pagos pendientes de verificación.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 border-b text-left">Usuario</th>
                <th className="px-4 py-3 border-b text-left">Ref. Pago</th>
                <th className="px-4 py-3 border-b text-left">Monto</th>
                <th className="px-4 py-3 border-b text-left">Fecha</th>
                <th className="px-4 py-3 border-b text-left">Estado</th>
                <th className="px-4 py-3 border-b text-left">Acción</th>
              </tr>
            </thead>
            <tbody>
              {pendientes.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 border-b">
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {t.usuario.nombre} {t.usuario.apellido}
                    </div>
                    <div className="text-sm text-gray-500">
                      {t.usuario.correo}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm">
                    {t.referencia_pago}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    ${t.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(t.fecha_intento).toLocaleDateString("es-ES")}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pendiente
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => confirmarPago(t)}
                        disabled={procesando === t.id}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition disabled:opacity-50"
                      >
                        {procesando === t.id ? "..." : "Confirmar"}
                      </button>
                      <button
                        onClick={() => rechazarPago(t)}
                        disabled={procesando === t.id}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition disabled:opacity-50"
                      >
                        {procesando === t.id ? "..." : "Rechazar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mostrar historial de pagos procesados */}
      {transacciones.filter(t => t.estado !== 'PENDIENTE').length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Historial de Pagos</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">Usuario</th>
                  <th className="px-4 py-2 border">Referencia</th>
                  <th className="px-4 py-2 border">Monto</th>
                  <th className="px-4 py-2 border">Estado</th>
                  <th className="px-4 py-2 border">Acción</th>
                </tr>
              </thead>
              <tbody>
                {transacciones
                  .filter(t => t.estado !== 'PENDIENTE')
                  .map((t) => (
                    <tr key={t.id} className="border-b">
                      <td className="px-4 py-2">{t.usuario.nombre} {t.usuario.apellido}</td>
                      <td className="px-4 py-2">{t.referencia_pago}</td>
                      <td className="px-4 py-2">${t.total.toFixed(2)}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-white text-xs ${
                          t.estado === 'APROBADO' ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                          {t.estado === 'APROBADO' ? 'Aprobado' : 'Rechazado'}
                        </span>
                       </td>
                      <td className="px-4 py-2">
                        <span className="text-gray-500">
                          {t.estado === 'APROBADO' ? 'Aceptado' : 'Rechazado'}
                        </span>
                       </td>
                     </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
