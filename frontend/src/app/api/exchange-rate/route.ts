import { NextResponse } from "next/server";
import { getExchangeRate } from "@/services/exchangeRateService";

export async function GET() {
  const exchangeRate = await getExchangeRate();
  return NextResponse.json(exchangeRate);
}
