const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

interface SubscriptionRequest {
  planId: string;
  paymentToken: string;
  email: string;
  nombre: string;
}

interface SubscriptionResponse {
  mensaje: string;
}

export async function createSubscription(
  data: SubscriptionRequest,
): Promise<SubscriptionResponse> {
  const response = await fetch(`${API_BASE_URL}/subscriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Authorization: `Bearer ${token}` (si el usuario está autenticado)
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || "Error al procesar la suscripción");
  }

  return response.json();
}
