"use client";

import { useState, useEffect, useRef } from "react";

const TOUR_STEPS = [
  {
    id: "tour-banner",
    title: "¡Bienvenido a PropBol!",
    description: "Aquí encontrarás las propiedades destacadas del momento.",
    required: false,
  },
  {
    id: "tour-logo",
    title: "Logo - Inicio",
    description: "Haz clic en el logo para volver a la página principal.",
    required: true,
  },
  {
    id: "tour-inicio",
    title: "Inicio",
    description: "Navega a la página principal desde aquí.",
    required: true,
  },
  {
    id: "tour-propiedades",
    title: "Propiedades",
    description: "Explora casas, departamentos, terrenos y más.",
    required: true,
  },
  {
    id: "tour-blogs",
    title: "Blogs",
    description: "Lee artículos y consejos sobre el mercado inmobiliario.",
    required: true,
  },
  {
    id: "tour-planes",
    title: "Planes de membresía",
    description: "Conoce nuestros planes y beneficios para publicar tu inmueble.",
    required: true,
  },
  {
    id: "tour-contacto",
    title: "Contáctanos",
    description: "¿Tienes dudas? Escríbenos y te ayudamos.",
    required: true,
  },
  {
    id: "tour-nosotros",
    title: "Sobre Nosotros",
    description: "Conoce más sobre el equipo detrás de PropBol.",
    required: true,
  },
  {
    id: "tour-ayuda",
    title: "Ayuda",
    description: "Vuelve a ver este tour cuando quieras desde aquí.",
    required: true,


  },
  { 
    id: "tour-notificaciones",
    title: "Notificaciones",
    description: "Aquí aparecerán tus alertas y novedades importantes.",
    required: true,
  },
  {
    id: "tour-user",
    title: "Tu cuenta",
    description: "Accede a tu perfil, publicaciones y configuración.",
    required: true,
   
  },
  {
    id: "tour-footer-logo",
    title: "PropBol",
    description: "Nuestra misión: revolucionar el mercado inmobiliario en Bolivia.",
    required: true,
  },
  {
    id: "tour-footer-explorar",
    title: "Explorar propiedades",
    description: "Encuentra inmuebles en venta, alquiler o anticrético.",
    required: true,
  },
  {
    id: "tour-footer-conocenos",
    title: "Conócenos",
    description: "Accede a información sobre nosotros, términos y políticas de privacidad.",
    required: true,
  },
  {
    id: "tour-footer-redes",
    title: "Redes Sociales",
    description: "Síguenos en Facebook e Instagram para estar al tanto de las novedades.",
    required: true,
  },
];

const FOOTER_STEP_INDEX = 11; // índice desde donde empiezan los pasos del footer

export default function TourGuiado() {
  const [showTour, setShowTour] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlight, setHighlight] = useState<DOMRect | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryRef = useRef<NodeJS.Timeout | null>(null);

  // 🔒 Bloquear scroll + ir al inicio
  useEffect(() => {
    if (showTour) {
      document.body.style.overflow = "hidden";
      window.scrollTo({ top: 0, behavior: "auto" });
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [showTour]);

  // ⌨️ Navegación por teclado
  useEffect(() => {
    if (!showTour) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") e.preventDefault();
      if (e.key === "Escape") handleSkip();
      if (e.key === "ArrowLeft" && currentStep > 0) setCurrentStep((prev) => prev - 1);
      if (e.key === "ArrowRight") {
        if (currentStep < TOUR_STEPS.length - 1) setCurrentStep((prev) => prev + 1);
        else setShowTour(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showTour, currentStep]);

  // HU-05: Criterio 9 — Reactivación manual desde el botón Ayuda
  useEffect(() => {
    const handleIniciarTour = () => {
      setCurrentStep(0);
      setHighlight(null);
      setShowTour(true);
    };

    window.addEventListener("propbol:iniciar-tour", handleIniciarTour);
    return () => window.removeEventListener("propbol:iniciar-tour", handleIniciarTour);
  }, []);

  const applyHighlight = (el: HTMLElement) => {
    const isFooter = currentStep >= FOOTER_STEP_INDEX;

    el.scrollIntoView({
      behavior: "auto",
      block: isFooter ? "start" : "center",
    });

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setHighlight(el.getBoundingClientRect());
        });
      });
    }, 50);
  };

  // 🔍 Buscar elemento con reintentos
  useEffect(() => {
    if (!showTour) return;

    const step = TOUR_STEPS[currentStep];
    const id = step.id;

    let attempts = 0;
    const maxAttempts = 10;

    const tryFind = () => {
      const el = document.getElementById(id);

      if (el) {
        if (retryRef.current) clearTimeout(retryRef.current);
        applyHighlight(el);
      } else {
        attempts++;
        if (attempts < maxAttempts) {
          retryRef.current = setTimeout(tryFind, 300);
        } else {
          if (step.required === false) {
            setCurrentStep((prev) => prev + 1);
          } else {
            console.warn(`Elemento ${id} no encontrado`);
          }
          setHighlight(null);
        }
      }
    };

    tryFind();

    return () => {
      if (retryRef.current) clearTimeout(retryRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentStep, showTour]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setShowTour(false);
    }
  };

  const handleSkip = () => setShowTour(false);

  if (!showTour) return null;

  const PADDING = 8;
  const hasValid = highlight !== null;

  let top = 100;
  if (hasValid) {
    const H = 180;
    const spaceBelow = window.innerHeight - highlight.bottom;
    const spaceAbove = highlight.top;

    if (spaceBelow >= H + 20 || spaceBelow > spaceAbove) {
      top = highlight.bottom + PADDING + 12;
      if (top + H > window.innerHeight) {
        top = highlight.top - H - PADDING - 12;
      }
    } else {
      top = highlight.top - H - PADDING - 12;
      if (top < 10) {
        top = highlight.bottom + PADDING + 12;
      }
    }
  }

  const left = hasValid
    ? Math.max(12, Math.min(highlight.left + highlight.width / 2 - 150, window.innerWidth - 312))
    : window.innerWidth / 2 - 150;

  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 9998, pointerEvents: "all" }}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <defs>
            <mask id="tm">
              <rect width="100%" height="100%" fill="white" />
              {hasValid && (
                <rect
                  x={highlight.left - PADDING}
                  y={highlight.top - PADDING}
                  width={highlight.width + PADDING * 2}
                  height={highlight.height + PADDING * 2}
                  rx="8"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="rgba(0,0,0,0.75)" mask="url(#tm)" />
        </svg>
      </div>

      {hasValid && (
        <div
          style={{
            position: "fixed",
            top,
            left,
            width: 300,
            zIndex: 9999,
            background: "#fff",
            borderRadius: 12,
            padding: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          }}
        >
          <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
            {TOUR_STEPS.map((_, i) => (
              <span
                key={i}
                style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 99,
                  background: i <= currentStep ? "#E68B25" : "#e5e7eb",
                }}
              />
            ))}
          </div>

          <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
            {TOUR_STEPS[currentStep].title}
          </p>

          <p style={{ fontSize: 13, marginBottom: 14 }}>
            {TOUR_STEPS[currentStep].description}
          </p>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              onClick={handleSkip}
              style={{
                fontSize: 12,
                color: "#9ca3af",
                background: "none",
                border: "none",
                cursor: "pointer",
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
      )}
    </>
  );
}