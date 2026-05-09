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
        <div className="flex items-center justify-start gap-10">
          <button className="flex items-center justify-center w-14 h-14 rounded-2xl bg-stone-100 hover:bg-stone-200 transition-colors duration-200 group">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg"
              alt="Gmail"
              className="w-8 h-8 opacity-90 group-hover:opacity-100 transition-opacity"
            />
          </button>
          <button className="flex items-center justify-center w-14 h-14 rounded-2xl bg-stone-100 hover:bg-stone-200 transition-colors duration-200 group">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/9/95/Instagram_logo_2022.svg"
              alt="Instagram"
              className="w-8 h-8 opacity-90 group-hover:opacity-100 transition-opacity"
            />
          </button>
          <button className="flex items-center justify-center w-14 h-14 rounded-2xl bg-stone-100 hover:bg-stone-200 transition-colors duration-200 group">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
              alt="WhatsApp"
              className="w-8 h-8 opacity-90 group-hover:opacity-100 transition-opacity"
            />
          </button>
          <button className="flex items-center justify-center w-14 h-14 rounded-2xl bg-stone-100 hover:bg-stone-200 transition-colors duration-200 group">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg"
              alt="Facebook"
              className="w-8 h-8 opacity-90 group-hover:opacity-100 transition-opacity"
            />
          </button>
          <button className="flex items-center justify-center w-14 h-14 rounded-2xl bg-stone-100 hover:bg-stone-200 transition-colors duration-200 group">
            <div className="w-8 h-8 rounded-[7px] bg-black flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
              <img
                src="https://cdn.simpleicons.org/tiktok/white"
                alt="TikTok"
                className="w-5 h-5"
              />
            </div>
          </button>
          <button className="flex items-center justify-center w-14 h-14 rounded-2xl bg-stone-100 hover:bg-stone-200 transition-colors duration-200 group">
            <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] opacity-90 group-hover:opacity-100 transition-opacity text-[#433527]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect width="14" height="14" x="8" y="8" rx="2.5" ry="2.5"></rect>
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
            </svg>
          </button>
          <button className="flex items-center justify-center w-14 h-14 rounded-2xl bg-stone-100 hover:bg-stone-200 transition-colors duration-200 group">
            <svg viewBox="0 0 24 24" className="w-6 h-6 opacity-90 group-hover:opacity-100 transition-opacity text-stone-800" fill="currentColor">
              <circle cx="5" cy="12" r="1.8"></circle>
              <circle cx="12" cy="12" r="1.8"></circle>
              <circle cx="19" cy="12" r="1.8"></circle>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
