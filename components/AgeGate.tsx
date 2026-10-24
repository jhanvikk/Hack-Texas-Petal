"use client";

import React, { useEffect, useState } from "react";
import { ShieldAlert, Heart, ExternalLink, RefreshCw } from "lucide-react";

interface AgeGateProps {
  children: React.ReactNode;
}

export function AgeGate({ children }: AgeGateProps) {
  const [status, setStatus] = useState<"loading" | "verified" | "blocked">("loading");

  useEffect(() => {
    // Check saved choice on device
    try {
      const savedChoice = localStorage.getItem("petal_age_verified");
      if (savedChoice === "true") {
        setStatus("verified");
      } else if (savedChoice === "false") {
        setStatus("blocked");
      } else {
        setStatus("loading");
      }
    } catch {
      setStatus("loading");
    }
  }, []);

  const handleConfirmAge = () => {
    try {
      localStorage.setItem("petal_age_verified", "true");
    } catch {
      // storage disabled
    }
    setStatus("verified");
  };

  const handleUnderAge = () => {
    try {
      localStorage.setItem("petal_age_verified", "false");
    } catch {
      // storage disabled
    }
    setStatus("blocked");
  };

  const handleReset = () => {
    try {
      localStorage.removeItem("petal_age_verified");
    } catch {
      // storage disabled
    }
    setStatus("loading");
  };

  if (status === "verified") {
    return <>{children}</>;
  }

  if (status === "blocked") {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#EFE6DC] text-center space-y-5">
          <div className="w-16 h-16 bg-[#FDE8E7] text-[#D9534F] rounded-full flex items-center justify-center mx-auto shadow-xs">
            <Heart className="w-8 h-8 fill-current" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-[#2C2220]">
              Caring Support for You
            </h1>
            <p className="text-sm text-[#6B5C58] leading-relaxed">
              Thank you for visiting Petal. Because our peer-to-peer discussions touch on adult medical experiences, this sanctuary is designated for individuals <span className="font-semibold text-[#2C2220]">18 years of age and older</span>.
            </p>
          </div>

          <div className="bg-[#FFF5ED] border border-[#FADCC7] p-4 rounded-2xl text-left text-xs sm:text-sm text-[#7A3E26] space-y-2">
            <p className="font-semibold text-[#8C3E1F] flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> Trusted Resources for Youth & Teens:
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-xs">
              <li>
                <a
                  href="https://www.teenline.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium hover:text-[#2C2220] inline-flex items-center gap-1"
                >
                  Teen Line (Peer-to-peer teen support) <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.thetrevorproject.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium hover:text-[#2C2220] inline-flex items-center gap-1"
                >
                  The Trevor Project (24/7 youth lifeline) <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                Ask a trusted pediatrician, school nurse, or parent to help navigate your cycle questions.
              </li>
            </ul>
          </div>

          <div className="pt-2">
            <button
              onClick={handleReset}
              className="text-xs text-[#998884] hover:text-[#2C2220] underline inline-flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Made a mistake? Re-check age confirmation
            </button>
          </div>
        </div>
      </div>
    );
  }

  // First-visit verification modal
  return (
    <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#EFE6DC] text-center space-y-6">
        <div className="w-16 h-16 bg-[#FFF0EE] text-[#D9534F] rounded-full flex items-center justify-center mx-auto shadow-xs">
          <span className="text-3xl">🌸</span>
        </div>

        <div className="space-y-2">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#FDE8E7] text-[#C54541]">
            Anonymous Sanctuary
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2220] tracking-tight">
            Welcome to Petal
          </h1>
          <p className="text-sm text-[#6B5C58] leading-relaxed">
            A gentle, anonymous peer support network for menstrual health. Share your journey, find peers who understand, and chat safely.
          </p>
        </div>

        <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#EFE6DC] text-xs text-[#6B5C58] leading-relaxed">
          <p className="font-semibold text-[#2C2220] mb-1">Age Verification Required</p>
          Petal is created for adults 18 and older to share peer experiences. Please confirm your age to proceed:
        </div>

        <div className="space-y-3 pt-1">
          <button
            onClick={handleConfirmAge}
            className="w-full min-h-[52px] bg-[#D9534F] hover:bg-[#C54541] active:scale-[0.98] text-white font-semibold py-3.5 px-6 rounded-2xl shadow-sm text-base transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            I am 18 or older
          </button>

          <button
            onClick={handleUnderAge}
            className="w-full min-h-[48px] bg-white hover:bg-[#FAF6F0] active:scale-[0.98] text-[#6B5C58] hover:text-[#2C2220] border border-[#E5DCD2] font-medium py-3 px-6 rounded-2xl text-sm transition-all cursor-pointer"
          >
            I am under 18
          </button>
        </div>

        <p className="text-[11px] text-[#998884] leading-normal">
          Your choice is saved safely in this browser on your device. We do not store any identifying cookies or personal trackers.
        </p>
      </div>
    </div>
  );
}
