import ExchangeRateBar from "@/components/ExchangeRateBar";

const mockExchangeRate = {
  officialRate: 6.96,
  referentialRate: 11.5,
  updatedAt: "4/5/2026",
};

export default function HomeExchangeSection() {
  return (
    <ExchangeRateBar
      officialRate={mockExchangeRate.officialRate}
      referentialRate={mockExchangeRate.referentialRate}
      updatedAt={mockExchangeRate.updatedAt}
    />
  );
}
