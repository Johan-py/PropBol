"use client";
import React, { useState, useRef, useEffect } from 'react';
import { LucideIcon, ChevronDown } from 'lucide-react';

export interface ComboBoxOption {
  label: string;
  icon?: LucideIcon;
}

interface ComboBoxProps {
  label: string;
  placeholder?: string;
  options?: (string | ComboBoxOption)[];
  icon?: LucideIcon;
}

export function ComboBox({ label, placeholder, options = [], icon: Icon }: ComboBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const comboBoxRef = useRef<HTMLDivElement>(null);

  const handleOptionClick = (option: string) => {
    setSelectedValue(option);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (comboBoxRef.current && !comboBoxRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col gap-2 w-full font-inter" ref={comboBoxRef}>
      <label className="text-sm font-medium text-stone-900">
        {label}
      </label>
      
      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
            <Icon className={`w-5 h-5 transition-colors ${isOpen ? 'text-amber-600' : 'text-stone-400'}`} />
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between appearance-none bg-white border text-stone-600 py-2.5 pr-3 rounded-xl focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 cursor-pointer transition-all shadow-sm hover:border-stone-300 ${
            Icon ? 'pl-10' : 'pl-4'
          } ${isOpen ? 'border-amber-600 ring-1 ring-amber-600' : 'border-stone-200'}`}
        >
          <span className={selectedValue ? 'text-stone-900' : 'text-stone-500'}>
            {selectedValue || placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <ul className="absolute z-20 w-full mt-1 bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden">
            {options.map((option) => {
              const isString = typeof option === 'string';
              const optionLabel = isString ? option : option.label;
              const OptionIcon = isString ? null : option.icon;

              return (
                <li key={optionLabel} onClick={() => handleOptionClick(optionLabel)} className="px-4 py-2.5 text-stone-600 hover:bg-amber-50 hover:text-amber-700 cursor-pointer flex items-center gap-2 transition-colors">
                  {OptionIcon && <OptionIcon className="w-4 h-4 opacity-70" />}
                  {optionLabel}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}