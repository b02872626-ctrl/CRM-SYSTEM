"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type NotionOption = {
  label: string;
  value: string;
  color?: "blue" | "purple" | "gray" | "yellow" | "green" | "emerald" | "rose" | "orange";
};

type NotionSelectProps = {
  options: NotionOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export function NotionSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className,
  disabled = false
}: NotionSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const getColorClasses = (color?: string) => {
    switch (color) {
      case "blue":
        return "bg-[#2383e2]/30 text-white/90";
      case "purple":
        return "bg-[#9065b0]/30 text-white/90";
      case "gray":
        return "bg-white/10 text-white/60";
      case "yellow":
      case "orange":
        return "bg-[#d9730d]/30 text-white/90";
      case "green":
      case "emerald":
        return "bg-[#0f7b6c]/30 text-white/90";
      case "rose":
        return "bg-[#e03131]/30 text-white/90";
      default:
        return "bg-white/10 text-white/60";
    }
  };

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-fit flex items-center gap-1 transition-all text-left group/button",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className={cn(
          "px-1.5 py-0.5 rounded-[4px] text-[13px] font-normal leading-tight",
          getColorClasses(selectedOption?.color)
        )}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-[100] top-full mt-1.5 left-0 min-w-[220px] bg-[#1a1a1a] border border-white/10 rounded-xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-white/5 flex items-center gap-2 group">
            <Search className="h-3 w-3 text-white/20 group-focus-within:text-[#2383E2] transition-colors" />
            <input
              autoFocus
              className="bg-transparent border-none outline-none text-[11px] text-white/70 w-full py-0.5"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div 
            className="max-h-60 overflow-y-auto p-1.5 space-y-0.5" 
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors group"
                >
                     <span className={cn(
                      "px-1.5 py-0.5 rounded-[4px] text-[13px] font-normal leading-tight",
                      getColorClasses(option.color)
                    )}>
                    {option.label}
                  </span>
                  {value === option.value && <Check className="h-3 w-3 text-[#2383E2]" />}
                </button>
              ))
            ) : (
              <p className="p-4 text-center text-[10px] text-white/20 uppercase font-black">No results</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
