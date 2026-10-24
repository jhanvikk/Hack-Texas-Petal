"use client";

import React from "react";
import { HeartHandshake, Phone, Stethoscope, ChevronRight } from "lucide-react";
import { CrisisCheckResult } from "@/lib/safety";

interface CrisisCardProps {
  crisis: CrisisCheckResult;
  onContinue?: () => void;
}

export function CrisisCard({ crisis, onContinue }: CrisisCardProps) {
  if (!crisis.triggered) return null;

  const isMentalHealth = crisis.type === "mental_health";

  return (
    <div className="bg-[#FFF5F5] border-2 border-[#FCA5A5] rounded-3xl p-5 sm:p-6 shadow-sm my-4 transition-all animate-in fade-in duration-300">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center shrink-0 shadow-xs">
          {isMentalHealth ? <HeartHandshake className="w-6 h-6" /> : <Stethoscope className="w-6 h-6" />}
        </div>
        <div className="flex-1 space-y-2">
          <div className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEE2E2] text-[#991B1B] uppercase tracking-wide">
            Caring Support Notice
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[#991B1B] leading-snug">
            {crisis.headline}
          </h3>
          <p className="text-sm text-[#7F1D1D] leading-relaxed">
            {crisis.message}
          </p>

          <div className="pt-2 flex flex-wrap gap-2.5">
            <a
              href="tel:988"
              className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-xs transition-colors"
            >
              <Phone className="w-4 h-4" />
              Call or Text 988 Lifeline
            </a>

            <a
              href="https://www.988lifeline.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-white border border-[#FCA5A5] hover:bg-[#FEE2E2] text-[#991B1B] px-3.5 py-2.5 rounded-xl font-medium text-sm transition-colors"
            >
              Free Online Chat (988)
            </a>
          </div>

          <div className="pt-3 border-t border-[#FECACA] flex items-center justify-between text-xs text-[#991B1B]">
            <span>We will never dismiss you or turn you away.</span>
            {onContinue && (
              <button
                type="button"
                onClick={onContinue}
                className="inline-flex items-center gap-1 font-semibold underline text-[#991B1B] hover:text-[#7F1D1D] cursor-pointer"
              >
                Continue writing my story <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
