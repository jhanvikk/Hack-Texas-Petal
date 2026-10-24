"use client";

import React from "react";
import { Phone, HeartHandshake, Stethoscope, X, ExternalLink } from "lucide-react";

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmergencyModal({ isOpen, onClose }: EmergencyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-4 shadow-xl border border-[#FCA5A5] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#991B1B]">
                Immediate Caring Support
              </h3>
              <p className="text-xs text-[#7F1D1D]">Free, confidential, available 24/7</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#F3ECE2] text-[#998884] hover:text-[#2C2220] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-[#6B5C58] leading-relaxed">
          Petal is for peer support only. If you are experiencing an emotional crisis, severe bleeding, or a medical emergency, please reach out directly:
        </p>

        {/* 988 Lifeline */}
        <div className="p-4 bg-[#FFF5F5] border border-[#FECACA] rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-[#991B1B] flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-[#DC2626]" /> 988 Suicide & Crisis Lifeline
            </span>
            <span className="text-[10px] bg-[#FEE2E2] text-[#991B1B] px-2 py-0.5 rounded-full font-bold">
              24/7
            </span>
          </div>
          <p className="text-xs text-[#7F1D1D]">
            Call or text <strong>988</strong> anytime in the United States and Canada. Free, confidential support for emotional distress or crises.
          </p>
          <div className="pt-1 flex gap-2">
            <a
              href="tel:988"
              className="flex-1 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold rounded-xl text-xs text-center shadow-xs transition-colors"
            >
              Call 988 Now
            </a>
            <a
              href="sms:988"
              className="flex-1 py-2.5 bg-white border border-[#FECACA] hover:bg-[#FEE2E2] text-[#991B1B] font-bold rounded-xl text-xs text-center transition-colors"
            >
              Text 988
            </a>
          </div>
        </div>

        {/* Medical Emergency */}
        <div className="p-4 bg-[#FFF9ED] border border-[#FDE3B7] rounded-2xl space-y-2">
          <span className="font-bold text-sm text-[#8A5812] flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4 text-[#C85A32]" /> Severe Bleeding or Acute Pain
          </span>
          <p className="text-xs text-[#6E4207] leading-relaxed">
            If you are bleeding through a pad in an hour or less, feel faint or dizzy, or have sudden severe abdominal pain, please call <strong>911</strong> or visit your nearest Urgent Care / Emergency Room immediately.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 bg-[#FAF6F0] hover:bg-[#F3ECE2] text-[#2C2220] font-semibold rounded-xl text-xs transition-colors cursor-pointer"
        >
          Return to Petal
        </button>
      </div>
    </div>
  );
}
