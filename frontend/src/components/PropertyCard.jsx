import React from "react";

export default function PropertyCard({ property, canEdit, onEdit, onDelete }) {
  return (
    <div className="property-card">
      <img src={property.image} alt={property.title} className="property-image" />
      <div className="property-body">
        <div className="property-header">
          <h2 className="property-title">{property.title}</h2>
          <span className="property-price">
            ${Number(property.price).toLocaleString('en-US')}
          </span>
        </div>

        <div className="property-location">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {property.location}
        </div>

        <div className="property-features">
          <div className="feature">🛁 {property.beds}</div>
          <div className="feature">🚿 {property.baths}</div>
          <div className="feature">⬜ {property.area}</div>
        </div>

        <div className="property-actions">
          {canEdit ? (
            <button className="btn btn-outline" onClick={onEdit}>Editar</button>
          ) : (
            <button className="btn btn-gray" disabled>Editar</button>
          )}
          <button className="btn btn-primary" onClick={onDelete}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}