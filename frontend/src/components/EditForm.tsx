import React from "react";

const OPERATION_TYPES = ["Venta", "Alquiler", "Anticrético"];

interface FormData {
  title: string;
  details: string;
  operationType: string;
  price: string | number;
  location: string;
}

interface FieldErrors {
  title?: string;
  details?: string;
  operationType?: string;
  price?: string;
  location?: string;
}

interface EditFormProps {
  formData: FormData;
  fieldErrors: FieldErrors;
  onChange: (field: keyof FormData, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  toast?: string | null;
  globalError?: string | null;
}

export default function EditForm({
  formData,
  fieldErrors,
  onChange,
  onSave,
  onCancel,
  toast,
  globalError,
}: EditFormProps) {
  return (
    <div>
      <h1 className="edit-title">Editar Publicación</h1>
      <p className="edit-subtitle">INFORMACIÓN DE LA PUBLICACIÓN</p>

      {toast && <div className="alert success mt-20">{toast}</div>}
      {globalError && <div className="alert error mt-20">{globalError}</div>}

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">TÍTULO PROPIEDAD</label>
          <input
            className={`form-input ${fieldErrors.title ? "input-error" : ""}`}
            value={formData.title}
            onChange={(e) => onChange("title", e.target.value)}
            placeholder="Apartamento Centro"
          />
          <div className="input-line"></div>
          {fieldErrors.title && (
            <span className="field-error">{fieldErrors.title}</span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">DETALLES DE LA PROPIEDAD</label>
          <input
            className={`form-input ${fieldErrors.details ? "input-error" : ""}`}
            value={formData.details}
            onChange={(e) => onChange("details", e.target.value)}
            placeholder="Descripción de la propiedad"
          />
          <div className="input-line"></div>
          {fieldErrors.details && (
            <span className="field-error">{fieldErrors.details}</span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">TIPO OPERACIÓN</label>
          <select
            className={`form-input ${fieldErrors.operationType ? "input-error" : ""}`}
            value={formData.operationType}
            onChange={(e) => onChange("operationType", e.target.value)}
          >
            <option value="">Seleccionar...</option>
            {OPERATION_TYPES.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
          {fieldErrors.operationType && (
            <span className="field-error">{fieldErrors.operationType}</span>
          )}

          <label className="form-label" style={{ marginTop: "24px" }}>
            PRECIO
          </label>
          <input
            className={`form-input ${fieldErrors.price ? "input-error" : ""}`}
            value={formData.price}
            onChange={(e) => onChange("price", e.target.value)}
            placeholder="230.00"
          />
          <div className="input-line"></div>
          {fieldErrors.price && (
            <span className="field-error">{fieldErrors.price}</span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">UBICACIÓN</label>
          <input
            className={`form-input ${fieldErrors.location ? "input-error" : ""}`}
            value={formData.location}
            onChange={(e) => onChange("location", e.target.value)}
            placeholder="16 de julio y Av. Oquendo"
          />
          <div className="input-line"></div>
          {fieldErrors.location && (
            <span className="field-error">{fieldErrors.location}</span>
          )}
        </div>
      </div>

      <div className="edit-actions">
        <button className="btn btn-primary" onClick={onSave}>
          GUARDAR CAMBIOS
        </button>
        <button className="btn btn-light" onClick={onCancel}>
          CANCELAR
        </button>
      </div>
    </div>
  );
}