'use client'

import React from 'react'
//Componente para colocar las opciones de compartir del blog, pendiente de implementar xd

export default function BlogSharePlaceholder() {
  return (
    <div className="mt-8 w-full rounded-2xl bg-white p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 min-h-[120px] transition-all duration-300">
      <div className="flex flex-col gap-6">
        <h3 className="text-xs font-bold uppercase tracking-[0.24em] text-[#a56400]">
          Compartir
        </h3>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center justify-start gap-4 sm:gap-5 md:gap-6">
            <button className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-stone-100 hover:bg-stone-200 transition-colors duration-200 group shrink-0">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg"
                alt="Gmail"
                className="w-7 h-7 sm:w-8 sm:h-8 opacity-90 group-hover:opacity-100 transition-opacity"
              />
            </button>
            <button className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-stone-100 hover:bg-stone-200 transition-colors duration-200 group shrink-0">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/9/95/Instagram_logo_2022.svg"
                alt="Instagram"
                className="w-7 h-7 sm:w-8 sm:h-8 opacity-90 group-hover:opacity-100 transition-opacity"
              />
            </button>
            <button className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-stone-100 hover:bg-stone-200 transition-colors duration-200 group shrink-0">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                alt="WhatsApp"
                className="w-7 h-7 sm:w-8 sm:h-8 opacity-90 group-hover:opacity-100 transition-opacity"
              />
            </button>
            <button className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-stone-100 hover:bg-stone-200 transition-colors duration-200 group shrink-0">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg"
                alt="Facebook"
                className="w-7 h-7 sm:w-8 sm:h-8 opacity-90 group-hover:opacity-100 transition-opacity"
              />
            </button>
            <button className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-stone-100 hover:bg-stone-200 transition-colors duration-200 group shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-[7px] bg-black flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
                <img
                  src="https://cdn.simpleicons.org/tiktok/white"
                  alt="TikTok"
                  className="w-4 h-4 sm:w-5 sm:h-5"
                />
              </div>
            </button>
            <button className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-stone-100 hover:bg-stone-200 transition-colors duration-200 group shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-[22px] sm:h-[22px] opacity-90 group-hover:opacity-100 transition-opacity text-[#433527]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2.5" ry="2.5"></rect>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
              </svg>
            </button>
            <button className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-stone-100 hover:bg-stone-200 transition-colors duration-200 group shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 opacity-90 group-hover:opacity-100 transition-opacity text-stone-800" fill="currentColor">
                <circle cx="5" cy="12" r="1.8"></circle>
                <circle cx="12" cy="12" r="1.8"></circle>
                <circle cx="19" cy="12" r="1.8"></circle>
              </svg>
            </button>
          </div>

          <button className="flex items-center justify-center gap-2 px-4 sm:px-5 h-10 sm:h-12 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors duration-200 group whitespace-nowrap shrink-0 ml-4 sm:ml-0">
            <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#433527]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.08em] text-[#433527]">DESCARGAR</span>
            <svg viewBox="0 0 24 24" className="w-3 h-3 sm:w-4 sm:h-4 text-[#433527]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
