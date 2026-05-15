import ExchangeRateBar from "@/components/ExchangeRateBar";
import { getExchangeRate } from "@/services/exchangeRateService";

export default async function HomeExchangeSection() {
  const { officialRate, referentialRate, updatedAt } = await getExchangeRate();
  const updatedLabel = updatedAt
    ? new Date(updatedAt).toLocaleString("es-BO", { day: "numeric", month: "numeric", year: "numeric" })
    : "No disponible";

  return (
    <ExchangeRateBar
      officialRate={officialRate}
      referentialRate={referentialRate}
      updatedAt={updatedLabel}
    />
  );
}
