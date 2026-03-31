type PublicarSectionProps = {
  confirmed: boolean;
  onConfirmedChange: (value: boolean) => void;
  onPublish: () => void;
  publishError?: string;
};

export default function PublicarSection({
  confirmed,
  onConfirmedChange,
  onPublish,
  publishError,
}: PublicarSectionProps) {
  return (
    <section
      style={{
        background: "#fff",
        border: "1px solid #f0dfd8",
        borderRadius: "18px",
        padding: "24px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "18px",
            color: "#444",
          }}
        >
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => onConfirmedChange(e.target.checked)}
          />
          <span>Confirmo que la información es correcta y deseo publicar</span>
        </label>

        <button
          onClick={onPublish}
          disabled={!confirmed}
          style={{
            background: confirmed ? "#ff7f11" : "#d9d9d9",
            color: "white",
            border: "none",
            borderRadius: "10px",
            padding: "14px 22px",
            fontSize: "16px",
            fontWeight: 600,
            cursor: confirmed ? "pointer" : "not-allowed",
          }}
        >
          Publicar Inmueble
        </button>
      </div>

      {publishError && (
        <p style={{ color: "#d32f2f", fontSize: "14px", marginTop: "12px" }}>
          {publishError}
        </p>
      )}

      <p style={{ marginTop: "12px", fontSize: "16px", color: "#666" }}>
        Nota: Puedes publicar hasta 2 inmuebles de forma gratuita.
      </p>
    </section>
  );
}