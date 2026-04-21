"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import Modal from "@/components/Modal";
import EditForm from "@/components/EditForm";
import { initialProperties, emptyErrors } from "@/data/properties";

export default function EditarPublicacionPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const [id, setId] = useState<number | null>(null);

  const [properties, setProperties] = useState(initialProperties);
  const [formData, setFormData] = useState<any>(null);
  const [fieldErrors, setFieldErrors] = useState(emptyErrors);
  const [showConfirmSave, setShowConfirmSave] = useState(false);

  useEffect(() => {
    if (searchParams?.id) {
      setId(Number(searchParams.id));
    }
  }, [searchParams]);

  useEffect(() => {
    if (id === null) return;

    const property = properties.find((p: any) => p.id === id);
    if (property) {
      setFormData(property);
    }
  }, [id, properties]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSaveClick = () => {
    setShowConfirmSave(true);
  };

  const handleConfirmSave = () => {
    setProperties((prev: any[]) =>
      prev.map((p) => (p.id === formData.id ? formData : p))
    );
    setShowConfirmSave(false);
    alert("Guardado correctamente");
  };

  if (id === null || !formData) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      <EditForm
        formData={formData}
        fieldErrors={fieldErrors}
        onChange={handleChange}
        onSave={handleSaveClick}
        onCancel={() => window.history.back()}
      />

      {showConfirmSave && (
        <Modal onClose={() => setShowConfirmSave(false)}>
          <div className="p-4 text-center">
            <p className="mb-4">¿Confirmar guardado?</p>
            <button
              onClick={handleConfirmSave}
              className="px-4 py-2 bg-orange-500 text-white rounded"
            >
              Confirmar Guardado
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

