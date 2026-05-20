"use client";

import { useEffect, useRef, useState } from "react";

interface BrandMarkProps {
  name: string;
  onNavigate: (view: "profile" | "activity" | "progress" | "pricing") => void;
}

export function BrandMark({ name, onNavigate }: BrandMarkProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const initial = name.trim().charAt(0).toUpperCase() || "U";

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const items = [
    { label: "Profile", view: "profile" as const },
    { label: "Log", view: "activity" as const },
    { label: "Stats", view: "progress" as const },
    { label: "Upgrade to Pro", view: "pricing" as const },
  ];

  return (
    <div ref={containerRef} className="relative">
      <button
        className="flex items-center gap-3 rounded-xl transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a0a0a]/20"
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0a0a0a] text-sm font-semibold text-white">
          {initial}
        </span>
        <span className="text-sm font-semibold">{name.trim() || "User"}</span>
      </button>

      {isOpen ? (
        <div
          className="absolute left-0 top-full mt-2 w-44 overflow-hidden rounded-2xl border border-[#e5e5e5] bg-[#fffaf0] py-1.5 shadow-xl"
          role="menu"
        >
          {items.map((item) => (
            <button
              key={item.label}
              className={`w-full px-4 py-2.5 text-left text-sm font-semibold transition-colors hover:bg-[#f5f0e0] focus-visible:outline-none focus-visible:bg-[#f5f0e0] ${
                item.label === "Upgrade to Pro"
                  ? "text-[#ff4d8b]"
                  : "text-[#3a3a3a]"
              }`}
              onClick={() => {
                onNavigate(item.view);
                setIsOpen(false);
              }}
              role="menuitem"
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
