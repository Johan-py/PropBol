"use client";
import { useState, useEffect } from "react";
import PropertyCard from "@/components/PropertyCard";
import Modal from "@/components/Modal";
import EditForm from "@/components/EditForm";
import { initialProperties, currentUser, emptyErrors } from "@/data/properties";
import { api } from "@/lib/api";

export default function Home() {
  const [properties, setProperties] = useState(initialProperties);
  const [loading, setLoading] = useState(true);
  const [editingProperty, setEditingProperty] = useState(null);
  const [formData, setFormData] = useState(null);
  const [fieldErrors, setFieldErrors] = useState(emptyErrors);
  const [showConfirmEdit, setShowConfirmEdit] = useState(false);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [pendingEdit, setPendingEdit] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Cargar publicaciones del backend
  useEffect(() => {
    api.getPublicaciones(currentUser.id)
      .then((data) => {
        if (data && data.length > 0) setProperties(data);
      })
      .catch(() => console.log("Usando datos locales"))
      .finally(() => setLoading(false));
  }, []);

  const userProperties = properties.filter((p) => p.ownerId === currentUser.id);

  const handleEditClick = (property) => {
    setPendingEdit(property);
    setShowConfirmEdit(true);
  };

  const handleConfirmEdit = () => {
    setFormData({ ...pendingEdit });
    setEditingProperty(pendingEdit);
    setFieldErrors(emptyErrors);
    setShowConfirmEdit(false);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSaveClick = () => {
    const errors = { ...emptyErrors };
    let hasError = false;
    if (!formData.title?.trim()) { errors.title = "El título es requerido"; hasError = true; }
    if (!formData.details?.trim()) { errors.details = "Los detalles son requeridos"; hasError = true; }
    if (!formData.operationType) { errors.operationType = "Seleccione un tipo"; hasError = true; }
    if (!formData.price) { errors.price = "El precio es requerido"; hasError = true; }
    if (!formData.location?.trim()) { errors.location = "La ubicación es requerida"; hasError = true; }
    if (hasError) { setFieldErrors(errors); return; }
    setShowConfirmSave(true);
  };

  const handleConfirmSave = async () => {
    try {
      await api.updatePublicacion(formData.id, formData);
    } catch (e) {
      console.log("Guardado local");
    }
    setProperties((prev) => prev.map((p) => (p.id === formData.id ? formData : p)));
    setEditingProperty(null);
    setFormData(null);
    setShowConfirmSave(false);
    setSuccessMessage("Publicación Actualizada con exactitud");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleDelete = async (id) => {
    try {
      await api.deletePublicacion(id);
    } catch (e) {
      console.log("Eliminado local");
    }
    setProperties((prev) => prev.filter((p) => p.id !== id));
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <p className="text-gray-500">Cargando publicaciones...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Mis publicaciones</h1>

      {successMessage && (
        <div className="alert success mb-6">{successMessage}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userProperties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            canEdit={property.ownerId === currentUser.id}
            onEdit={() => handleEditClick(property)}
            onDelete={() => handleDelete(property.id)}
          />
        ))}
      </div>

      {showConfirmEdit && (
        <Modal onClose={() => setShowConfirmEdit(false)}>
          <h2 className="text-xl font-bold mb-2">Editar publicación</h2>
          <p className="text-gray-500 mb-6">¿Está seguro que desea editar?</p>
          <div className="flex gap-3 justify-end">
            <button className="btn btn-light" style={{minWidth:"120px"}} onClick={() => setShowConfirmEdit(false)}>Cancelar</button>
            <button className="btn btn-primary" style={{background:"#1a1a1a", minWidth:"120px"}} onClick={handleConfirmEdit}>Editar</button>
          </div>
        </Modal>
      )}

      {editingProperty && formData && !showConfirmSave && (
        <Modal onClose={() => setEditingProperty(null)}>
          <EditForm
            formData={formData}
            fieldErrors={fieldErrors}
            onChange={handleChange}
            onSave={handleSaveClick}
            onCancel={() => setEditingProperty(null)}
          />
        </Modal>
      )}

      {showConfirmSave && (
        <Modal onClose={() => setShowConfirmSave(false)}>
          <h2 className="text-xl font-bold mb-2">Confirmar cambios</h2>
          <p className="text-gray-500 mb-6">¿Desea guardar los cambios realizados en la publicación?</p>
          <div className="flex gap-3 justify-end">
            <button className="btn btn-light" style={{minWidth:"120px"}} onClick={() => setShowConfirmSave(false)}>Cancelar</button>
            <button className="btn btn-primary" style={{minWidth:"120px"}} onClick={handleConfirmSave}>Guardar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}