"use client";


import React from "react";
import { AlertCircle, PhoneCall } from "lucide-react";

interface DisclaimerBannerProps {
  compact?: boolean;
}

export function DisclaimerBanner({ compact = false }: DisclaimerBannerProps) {
  if (compact) {
    return (
      <div className="bg-[#FFF3E8] border border-[#FAD8C3] text-[#7A3E26] px-3 py-2 rounded-xl text-xs flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0 text-[#C85A32]" />
        <p className="leading-snug">
          <span className="font-semibold">Peer support only, not medical advice.</span> In an emergency, call 911 or text/call{" "}
          <a href="tel:988" className="underline font-bold text-[#A63F1B] hover:text-[#7A3E26]">
            988
          </a>.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF5ED] border border-[#FADCC7] rounded-2xl p-3.5 sm:p-4 text-[#6E3C27] shadow-xs">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-[#FCE8DA] rounded-full text-[#C85A32] shrink-0 mt-0.5">
          <AlertCircle className="w-4 h-4" />
        </div>
        <div className="text-xs sm:text-sm leading-relaxed space-y-1">
          <p className="font-semibold text-[#8C3E1F]">
            This is peer support, not medical advice.
          </p>
          <p className="text-[#6E3C27]">
            Stories and messages here are personal experiences. If you have severe symptoms, heavy bleeding, or an emergency, please contact a doctor or call your local emergency number. In the US & Canada, call or text{" "}
            <a href="tel:988" className="inline-flex items-center gap-1 font-bold underline text-[#9C3814] hover:text-[#6E3C27]">
              <PhoneCall className="w-3 h-3" /> 988 Lifeline
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
