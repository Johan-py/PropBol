"use client";

import { useSearchParams } from "next/navigation";
import ResumenPanel from "@/components/resumen-final/ResumenPanel";

export default function Page() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  return (
    <main className="min-h-screen bg-[#f5f1eb] px-4 py-6 md:px-8">
      <ResumenPanel publicacionId={id ? Number(id) : null} />
    </main>
  );
}
