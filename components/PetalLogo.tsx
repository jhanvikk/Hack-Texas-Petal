"use client";

import React, { useState } from "react";

interface PetalLogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  className?: string;
  frameless?: boolean;
}

export function PetalLogo({
  size = "md",
  className = "",
  frameless = false,
}: PetalLogoProps) {
  const [logoSrc, setLogoSrc] = useState<string>("/logo.png");
  const [useFallback, setUseFallback] = useState(false);

  const handleImageError = () => {
    if (logoSrc === "/logo.png") {
      // Try logo.svg if logo.png is not found
      setLogoSrc("/logo.svg");
    } else {
      // Fallback to floral blossom emblem
      setUseFallback(true);
    }
  };

  const dimensionClasses = {
    sm: "w-8 h-8 text-base",
    md: "w-10 h-10 text-xl",
    lg: "w-16 h-16 text-3xl",
    xl: "w-24 h-24 text-5xl",
    "2xl": "w-32 h-32 text-6xl",
    "3xl": "w-48 h-48 sm:w-56 sm:h-56 text-7xl sm:text-8xl",
    "4xl": "w-56 h-56 sm:w-64 sm:h-64 text-8xl", // 2x bigger than 2xl
  }[size];

  if (frameless) {
    return (
      <div
        className={`flex items-center justify-center shrink-0 ${dimensionClasses} ${className}`}
      >
        {!useFallback ? (
          <img
            src={logoSrc}
            alt="Petal Logo"
            className="w-full h-full object-contain drop-shadow-xs"
            onError={handleImageError}
          />
        ) : (
          <span role="img" aria-label="Petal Flower">
            🌸
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl bg-[#FFF0EE] border border-[#FAD4D2] flex items-center justify-center overflow-hidden shrink-0 shadow-2xs ${dimensionClasses} ${className}`}
    >
      {!useFallback ? (
        <img
          src={logoSrc}
          alt="Petal Logo"
          className="w-full h-full object-contain p-1"
          onError={handleImageError}
        />
      ) : (
        <span role="img" aria-label="Petal Flower">
          🌸
        </span>
      )}
    </div>
  );
}
