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
    id: "tour-propiedades",
    mobileId: "tour-propiedades-mobile",
    title: "Propiedades",
    description: "Explora casas, departamentos, terrenos y más.",
    required: true,
  },
  {
    id: "tour-blogs",
    mobileId: "tour-blogs-mobile",
    title: "Blogs",
    description: "Lee artículos y consejos sobre el mercado inmobiliario.",
    required: true,
  },
  {
    id: "tour-planes",
    mobileId: "tour-planes-mobile",
    title: "Planes de membresía",
    description: "Conoce nuestros planes y beneficios para publicar tu inmueble.",
    required: true,
  },
  {
    id: "tour-ayuda",
    mobileId: "tour-ayuda-mobile",
    title: "Ayuda",
    description: "Vuelve a ver este tour cuando quieras desde aquí.",
    required: true,
  },
  {
    id: "tour-buscador",
    title: "Buscador de propiedades",
    description:
      "Filtra por tipo de operación (Venta, Alquiler o Anticrético), elige el tipo de inmueble y escribe una ubicación para encontrar la propiedad ideal.",
    required: true,
  },
  {
    id: "tour-filtros-visuales",
    title: "Explora por ciudad y tipo",
    description:
      "Aquí puedes ver propiedades en alquiler o venta agrupadas por departamento, y también explorar por tipo de inmueble: casas, departamentos, oficinas y terrenos.",
    required: true,
  },
  {
    id: "tour-publicar-home",
    title: "Publica tu inmueble",
    description:
      "¿Tienes una propiedad para vender o alquilar? Haz clic aquí para registrar tu inmueble y llegar a miles de compradores e inquilinos.",
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

const FOOTER_STEP_INDEX = 11;

// ✅ Helpers para saber si el usuario está logueado
const isLoggedIn = () => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("token");
};

export default function TourGuiado() {
  const [showTour, setShowTour] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlight, setHighlight] = useState<DOMRect | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipH, setTooltipH] = useState(180);

  // ✅ Decidir si mostrar el tour al montar
  useEffect(() => {
    if (isLoggedIn()) {
      setShowTour(true);
    }
    // Si no está logueado, no se muestra — salvo que lo active el botón Ayuda
  }, []);

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
      if (e.key === "ArrowLeft" && currentStep > 0)
        setCurrentStep((prev) => prev - 1);
      if (e.key === "ArrowRight") {
        if (currentStep < TOUR_STEPS.length - 1)
          setCurrentStep((prev) => prev + 1);
        else setShowTour(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showTour, currentStep]);

  // 🔁 Reactivación manual desde el botón Ayuda
  // ✅ Funciona para usuarios logueados Y no logueados
  useEffect(() => {
    const handleIniciarTour = () => {
      setHighlight(null);
      setCurrentStep(0);
      setShowTour(true);
    };
    window.addEventListener("propbol:iniciar-tour", handleIniciarTour);
    return () =>
      window.removeEventListener("propbol:iniciar-tour", handleIniciarTour);
  }, []);

  // 📐 Medir altura del tooltip
  useEffect(() => {
    if (!showTour) return;

    const measure = () => {
      if (tooltipRef.current) {
        setTooltipH(tooltipRef.current.offsetHeight);
      }
      const step = TOUR_STEPS[currentStep];
      const isMobileNav =
        (window.visualViewport?.width ?? window.innerWidth) < 768;
      const mobileId =
        "mobileId" in step
          ? (step as typeof step & { mobileId: string }).mobileId
          : undefined;
      const id = isMobileNav && mobileId ? mobileId : step.id;
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        const vh = window.visualViewport?.height ?? window.innerHeight;
        // Solo actualiza si el elemento ya está visible en el viewport
        if (
          rect.width > 0 &&
          rect.height > 0 &&
          rect.top < vh &&
          rect.bottom > 0
        ) {
          setHighlight(rect);
        }
      }
    };

    measure();

    const ro = tooltipRef.current ? new ResizeObserver(measure) : null;
    if (ro && tooltipRef.current) ro.observe(tooltipRef.current);

    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("scroll", measure);

    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("scroll", measure);
    };
  }, [currentStep, showTour]);

  const applyHighlight = (el: HTMLElement) => {
    const isFooter = currentStep >= FOOTER_STEP_INDEX;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (isFooter) {
      document.body.style.overflow = "";
      // Esperar un frame para que el browser procese el overflow antes de scrollear
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: "auto", block: "start" });
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setHighlight(el.getBoundingClientRect());
            document.body.style.overflow = "hidden";
          });
        });
      });
    } else {
      el.scrollIntoView({ behavior: "auto", block: "center" });
      timeoutRef.current = setTimeout(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setHighlight(el.getBoundingClientRect());
          });
        });
      }, 50);
    }
  };

  // Búsqueda del elemento con reintentos y manejo de menú móvil
  useEffect(() => {
    if (!showTour) return;

    const step = TOUR_STEPS[currentStep];
    const isMobileNav =
      (window.visualViewport?.width ?? window.innerWidth) < 768;
    const mobileId =
      "mobileId" in step
        ? (step as typeof step & { mobileId: string }).mobileId
        : undefined;
    const needsMobileMenu = isMobileNav && !!mobileId;
    const id = needsMobileMenu ? mobileId! : step.id;

    if (needsMobileMenu) {
      window.dispatchEvent(new Event("propbol:abrir-menu-movil"));
    } else if (isMobileNav) {
      window.dispatchEvent(new Event("propbol:cerrar-menu-movil"));
    }

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
      window.dispatchEvent(new Event("propbol:cerrar-menu-movil"));
      setShowTour(false);
    }
  };

  const handleSkip = () => {
    window.dispatchEvent(new Event("propbol:cerrar-menu-movil"));
    setShowTour(false);
  };

  if (!showTour) return null;

  const PADDING = 8;
  const hasValid = highlight !== null;

  const vw = window.visualViewport?.width ?? window.innerWidth;
  const vh = window.visualViewport?.height ?? window.innerHeight;
  const vOffsetTop = window.visualViewport?.offsetTop ?? 0;
  const vOffsetLeft = window.visualViewport?.offsetLeft ?? 0;

  const tooltipW = Math.min(300, vw - 24);
  const isMobile = vw < 480;
  const tooltipPad = isMobile ? "12px" : "16px";
  const fontTitle = isMobile ? 13 : 14;
  const fontDesc = isMobile ? 12 : 13;
  const fontMeta = isMobile ? 10 : 11;
  const fontBtn = isMobile ? 12 : 13;
  const fontSkip = isMobile ? 11 : 12;

  let top = vOffsetTop + 80;
  let left = vOffsetLeft + (vw - tooltipW) / 2;

  if (hasValid) {
    const H = tooltipH;
    const GAP = PADDING + 12;
    const spaceBelow = vOffsetTop + vh - highlight.bottom;
    const spaceAbove = highlight.top - vOffsetTop;

    top =
      spaceBelow >= H + GAP || spaceBelow > spaceAbove
        ? highlight.bottom + GAP
        : highlight.top - H - GAP;

    top = Math.max(vOffsetTop + 10, Math.min(top, vOffsetTop + vh - H - 10));
    left = Math.max(
      vOffsetLeft + 12,
      Math.min(
        highlight.left + highlight.width / 2 - tooltipW / 2,
        vOffsetLeft + vw - tooltipW - 12,
      ),
    );
  }

  return (
    <>
      {/* Overlay oscuro con recorte */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          pointerEvents: "all",
        }}
      >
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
        >
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
          <rect
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.75)"
            mask="url(#tm)"
          />
        </svg>
      </div>

      {/* Tooltip siempre renderizado — solo se oculta con opacity */}
      <div
        ref={tooltipRef}
        style={{
          position: "fixed",
          top,
          left,
          width: tooltipW,
          zIndex: 9999,
          background: "#fff",
          borderRadius: 12,
          padding: tooltipPad,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          opacity: hasValid ? 1 : 0,
          pointerEvents: hasValid ? "all" : "none",
          transition: "opacity 0.15s ease",
          maxHeight: `${vh - 20}px`,
          overflowY: "auto",
        }}
      >
        {/* Barras de progreso */}
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

        <p style={{ fontWeight: 700, fontSize: fontTitle, marginBottom: 4 }}>
          {TOUR_STEPS[currentStep].title}
        </p>

        <p style={{ fontSize: fontDesc, color: "#374151", marginBottom: !hasValid ? 8 : 14 }}>
          {TOUR_STEPS[currentStep].description}
        </p>

        {!hasValid && (
          <p
            style={{
              fontSize: fontMeta,
              color: "#9ca3af",
              marginBottom: 14,
              fontStyle: "italic",
            }}
          >
            Esta sección no está visible en tu dispositivo actual.
          </p>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button
            onClick={handleSkip}
            style={{
              fontSize: fontSkip,
              color: "#9ca3af",
              background: "none",
              border: "none",
              cursor: "pointer",
              minHeight: 44,
              padding: "0 4px",
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
                  padding: isMobile ? "8px 12px" : "10px 18px",
                  fontSize: fontBtn,
                  fontWeight: 600,
                  cursor: "pointer",
                  minHeight: 44,
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
                fontSize: fontBtn,
                fontWeight: 600,
                cursor: "pointer",
                minHeight: 44,
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
