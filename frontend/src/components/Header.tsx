import React from "react";

interface HeaderProps {
  userName?: string; // El ? significa que es opcional
}

export default function Header({ userName = "Usuario" }: HeaderProps) {
  return (
    <header className="header">
      <div className="logo-wrap">
        <div className="logo-icon">
          <div className="logo-grid">
            <div className="logo-square"></div>
            <div className="logo-square"></div>
            <div className="logo-rect"></div>
          </div>
        </div>
        <span className="logo-text">Sigma</span>
      </div>
      <div className="header-actions">
        <button className="home-btn">Inicio</button>
        <span className="account">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          {userName}
        </span>
      </div>
    </header>
  );
}