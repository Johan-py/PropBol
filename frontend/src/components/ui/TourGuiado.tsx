"use client";

import { useState } from "react";

export default function TourGuiado() {
  const [showTour, setShowTour] = useState(true);

  if (!showTour) return null;

  return (
    <>
      {/* OVERLAY */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          zIndex: 9999,
        }}
      />

      {/* BOTÓN SALTAR */}
      <button
        onClick={() => setShowTour(false)}
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 10000,
          background: "#fff",
          color: "#000",
          padding: "8px 12px",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Saltar tour
      </button>
    </>
  );
}
