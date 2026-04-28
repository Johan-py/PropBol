"use client";

import { useState } from "react";
import { Loader } from "@/components/Loader";

export default function Page() {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="p-5">
      <h1>Demo Loader</h1>

      <button
        onClick={handleClick}
        className="bg-black text-white px-4 py-2 mt-4"
      >
        Simular carga
      </button>

      <div className="mt-5">
        {loading && <Loader />}
      </div>
    </div>
  );
}