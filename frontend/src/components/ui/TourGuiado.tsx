"use client";
 
import { useState, useEffect } from "react";
 
const TOUR_STEPS = [
  {
    id: "tour-banner",
    title: "¡Bienvenido a PropBol!",
    description: "Aquí encontrarás las propiedades destacadas del momento.",
  },
  {
    id: "tour-logo",
    title: "Logo - Inicio",
    description: "Haz clic en el logo para volver a la página principal.",
  },
  {
    id: "tour-inicio",
    title: "Inicio",
    description: "Navega a la página principal desde aquí.",
  },
  {
    id: "tour-contacto",
    title: "Contáctanos",
    description: "¿Tienes dudas? Escríbenos y te ayudamos.",
  },
  {
    id: "tour-nosotros",
    title: "Sobre Nosotros",
    description: "Conoce más sobre el equipo detrás de PropBol.",
  },
  {
    id: "tour-notificaciones",
    title: "Notificaciones",
    description: "Aquí aparecerán tus alertas y novedades importantes.",
  },
  {
    id: "tour-user",
    title: "Tu cuenta",
    description: "Accede a tu perfil, publicaciones y configuración.",
  },
];
 
export default function TourGuiado() {
  const [showTour, setShowTour] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlight, setHighlight] = useState<DOMRect | null>(null);
 
  useEffect(() => {
    if (!showTour) return;
 
    const step = TOUR_STEPS[currentStep];
    const el = document.getElementById(step.id);
    if (!el) return;
 
    const rect = el.getBoundingClientRect();
    setHighlight(rect);
  }, [currentStep, showTour]);
 
  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setShowTour(false);
    }
  };
 
  const handleSkip = () => {
    setShowTour(false);
  };
 
  if (!showTour || !highlight) return null;
 
  const PADDING = 8;
  const tooltipTop = highlight.bottom + PADDING + 12;
  const tooltipLeft = Math.max(
    12,
    Math.min(
      highlight.left + highlight.width / 2 - 150,
      window.innerWidth - 312
    )
  );
 
  return (
    <>
      {/* OVERLAY con agujero recortado encima del elemento */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          pointerEvents: "all",
        }}
      >
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          <defs>
            <mask id="tour-mask">
              <rect width="100%" height="100%" fill="white" />
              <rect
                x={highlight.left - PADDING}
                y={highlight.top - PADDING}
                width={highlight.width + PADDING * 2}
                height={highlight.height + PADDING * 2}
                rx="8"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.75)"
            mask="url(#tour-mask)"
          />
        </svg>
      </div>
 
      {/* TOOLTIP */}
      <div
        style={{
          position: "fixed",
          top: tooltipTop,
          left: tooltipLeft,
          width: 300,
          zIndex: 9999,
          background: "#fff",
          borderRadius: 12,
          padding: "16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}
      >
        {/* Indicador de pasos */}
        <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
          {TOUR_STEPS.map((_, i) => (
            <span
              key={i}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 99,
                background: i <= currentStep ? "#E68B25" : "#e5e7eb",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>
 
        <p style={{ fontWeight: 700, fontSize: 14, color: "#1c1c1c", marginBottom: 4 }}>
          {TOUR_STEPS[currentStep].title}
        </p>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 14, lineHeight: 1.5 }}>
          {TOUR_STEPS[currentStep].description}
        </p>
 
        {/* Botones */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={handleSkip}
            style={{
              fontSize: 12,
              color: "#9ca3af",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 0",
            }}
          >
            Saltar tour
          </button>

          <div style={{ display: "flex", gap: 8 }}>
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep((prev) => prev - 1)}
                style={{
                  background: "none",
                  color: "#E68B25",
                  border: "1px solid #E68B25",
                  borderRadius: 8,
                  padding: "8px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                ← Anterior
              </button>
            )}

            <button
              onClick={handleNext}
              style={{
                background: "#E68B25",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 18px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {currentStep < TOUR_STEPS.length - 1 ? "Siguiente →" : "Finalizar"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}