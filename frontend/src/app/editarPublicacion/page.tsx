"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import Modal from "@/components/Modal";
import EditForm from "@/components/EditForm";
import { initialProperties, currentUser, emptyErrors } from "@/data/properties";

export default function EditarPublicacionPage() {
  const searchParams = useSearchParams();
  const [id, setId] = useState<number | null>(null);

  useEffect(() => {
    const param = searchParams.get("id");
    setId(param ? Number(param) : null);
  }, [searchParams]);


  const [properties, setProperties] = useState(initialProperties);
  const [formData, setFormData] = useState<any>(null);
  const [fieldErrors, setFieldErrors] = useState(emptyErrors);
  const [showConfirmSave, setShowConfirmSave] = useState(false);

  useEffect(() => {
    const property = properties.find((p: any) => p.id === id);
    if (property) {
      setFormData(property);
    }
  }, [id]);

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

  if (!formData) return <p>Cargando...</p>;

  if (id === null) {
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
          <button onClick={handleConfirmSave}>Confirmar Guardado</button>
        </Modal>
      )}
    </div>
  );
}
