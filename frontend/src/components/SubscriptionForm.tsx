import { useState } from "react";
import { createSubscription } from "../services/api";

const planes = [
  { id: "basic", nombre: "Básico", precio: "9.99" },
  { id: "premium", nombre: "Premium", precio: "29.99" },
];

export default function SubscriptionForm() {
  const [selectedPlan, setSelectedPlan] = useState(planes[0].id);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const handleSubscribe = async () => {
    setLoading(true);
    setMensaje("");

    try {
      // Aquí normalmente integrarías la pasarela de pago para obtener un token real.
      // Simularemos un token de prueba (¡nunca hagas esto en producción!).
      const paymentToken = "tok_visa_de_prueba"; // Stripe test token

      const respuesta = await createSubscription({
        planId: selectedPlan,
        paymentToken,
      });

      setMensaje(respuesta.mensaje); // ej. "Suscripción activada. Revisa tu correo."
    } catch (error) {
      setMensaje("Ocurrió un error. Intenta nuevamente.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Elige tu plan</h2>
      <select
        value={selectedPlan}
        onChange={(e) => setSelectedPlan(e.target.value)}
      >
        {planes.map((plan) => (
          <option key={plan.id} value={plan.id}>
            {plan.nombre} - USD {plan.precio}/mes
          </option>
        ))}
      </select>

      <button onClick={handleSubscribe} disabled={loading}>
        {loading ? "Procesando..." : "Suscribirme"}
      </button>

      {mensaje && <p>{mensaje}</p>}
    </div>
  );
}
