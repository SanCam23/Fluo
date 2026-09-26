import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface GlassSelectOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  subtitle?: string;
}

interface GlassSelectProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: GlassSelectOption<T>[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export function GlassSelect<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = 'Selecciona una opción...',
  label,
  disabled = false,
  className = '',
  size = 'md',
}: GlassSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (val: T) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="text-xs font-medium text-slate-400 block mb-1">
          {label}
        </label>
      )}

      {/* Disparador Liquid Glass */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/15 focus:outline-none transition-all duration-200 cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] active:scale-[0.99] backdrop-blur-xl ${
          size === 'sm' ? 'px-3 py-2 text-xs' : 'px-3.5 py-2.5 text-sm'
        } ${
          isOpen
            ? 'border-indigo-400/60 ring-2 ring-indigo-500/20 bg-white/[0.09]'
            : 'hover:border-white/25'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {selectedOption?.icon && (
            <div className="shrink-0 flex items-center justify-center">
              {selectedOption.icon}
            </div>
          )}
          {selectedOption?.color && !selectedOption.icon && (
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: selectedOption.color }}
            />
          )}
          <span className="truncate font-medium text-white">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ml-2 ${
            isOpen ? 'rotate-180 text-indigo-400' : ''
          }`}
        />
      </button>

      {/* Menú Desplegable Flotante Liquid Glass */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 overflow-hidden rounded-2xl bg-[#0D1527]/95 backdrop-blur-2xl border border-white/20 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] animate-fadeIn">
          {/* Specular Top Hairline */}
          <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          <div
            role="listbox"
            className="max-h-56 overflow-y-auto space-y-1 overscroll-contain pr-0.5 scrollbar-thin"
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-left transition-all duration-150 cursor-pointer ${
                    size === 'sm' ? 'text-xs' : 'text-sm'
                  } ${
                    isSelected
                      ? 'bg-indigo-600/25 text-white font-semibold border border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.08] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {option.icon && (
                      <div className="shrink-0 flex items-center justify-center">
                        {option.icon}
                      </div>
                    )}
                    {option.color && !option.icon && (
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: option.color }}
                      />
                    )}
                    <div className="truncate">
                      <div className="truncate font-medium">{option.label}</div>
                      {option.subtitle && (
                        <div className="text-[10px] text-slate-400 font-normal truncate">
                          {option.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="h-4 w-4 shrink-0 text-indigo-400 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
