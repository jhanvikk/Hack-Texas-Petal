"use client";

import React, { useEffect, useState } from "react";
import { ShieldAlert, Heart, ExternalLink, RefreshCw } from "lucide-react";
import { PetalLogo } from "@/components/PetalLogo";

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
      <div className="min-h-screen bg-[#e6abb2] flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-[#f4db9a] rounded-3xl p-6 sm:p-8 shadow-lg border border-[#dfc278] text-center space-y-5">
          <div className="w-16 h-16 bg-white/85 text-[#c66974] border border-[#dfc278] rounded-full flex items-center justify-center mx-auto shadow-xs">
            <Heart className="w-8 h-8 fill-current" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-[#2C2220]">
              Caring Support for You
            </h1>
            <p className="text-sm text-[#523d13] leading-relaxed">
              Thank you for visiting Petal. Because our peer-to-peer discussions touch on adult medical experiences, this sanctuary is designated for individuals <span className="font-semibold text-[#2C2220]">18 years of age and older</span>.
            </p>
          </div>

          <div className="bg-white/90 border border-[#dfc278] p-4 rounded-2xl text-left text-xs sm:text-sm text-[#523d13] space-y-2 shadow-2xs">
            <p className="font-semibold text-[#8C3E1F] flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> Trusted Resources for Youth & Teens:
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-xs">
              <li>
                <a
                  href="https://www.teenline.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium hover:text-[#2C2220] inline-flex items-center gap-1 text-[#8C3E1F]"
                >
                  Teen Line (Peer-to-peer teen support) <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.thetrevorproject.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium hover:text-[#2C2220] inline-flex items-center gap-1 text-[#8C3E1F]"
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
              className="text-xs text-[#78591d] hover:text-[#2C2220] underline inline-flex items-center gap-1 cursor-pointer transition-colors"
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
    <div className="min-h-screen bg-[#e6abb2] flex items-start sm:items-center justify-center p-4 sm:p-6 pt-3 sm:pt-4">
      {/* Yellow rectangle shifted higher up */}
      <div className="max-w-md w-full bg-[#f4db9a] rounded-3xl pt-3 sm:pt-4 px-5 sm:px-7 pb-6 sm:pb-7 shadow-lg border border-[#dfc278] text-center space-y-4 -mt-2 sm:-mt-8">
        {/* Logo shifted higher up towards the top */}
        <div className="flex justify-center -mt-1 sm:-mt-2">
          <PetalLogo size="3xl" frameless />
        </div>

        {/* 'A Safe Haven for Her Health', 'Welcome to', 'Petal' positioned higher with spacious, uncompressed layout */}
        <div className="-mt-3 sm:-mt-4 space-y-2">
          <div className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold bg-white/85 text-[#8b4650] border border-[#dfc278] shadow-2xs">
            A Safe Haven for Her Health
          </div>

          <div className="pt-1">
            <span className="block text-xs sm:text-sm uppercase tracking-[0.25em] font-medium text-[#784e54]">
              Welcome to
            </span>
            <h1 className="text-5xl sm:text-6xl font-black text-[#c66974] tracking-tight leading-none mt-1 font-poppins">
              Petal
            </h1>
          </div>
        </div>

        {/* Text at the bottom */}
        <p className="text-xs sm:text-sm text-[#523d13] leading-relaxed pt-1 max-w-sm mx-auto">
          An anonymous peer support network for women&apos;s health. Share your journey, find peers who understand, and chat safely.
        </p>

        {/* Age verification text bubble */}
        <div className="bg-white/90 p-4 rounded-2xl border border-[#dfc278] text-xs text-[#523d13] leading-relaxed shadow-2xs">
          <p className="font-bold text-[#38280a] mb-1">Age Verification Required</p>
          Petal is created for adults 18 and older to share peer experiences. Please confirm your age to proceed:
        </div>

        <div className="space-y-2.5 pt-0.5">
          <button
            onClick={handleConfirmAge}
            className="w-full min-h-[50px] bg-[#c66974] hover:bg-[#b35762] active:scale-[0.98] text-white font-semibold py-3 px-6 rounded-2xl shadow-sm text-base transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            I am 18 or older
          </button>

          <button
            onClick={handleUnderAge}
            className="w-full min-h-[46px] bg-white hover:bg-[#FFF9EE] active:scale-[0.98] text-[#6B5C58] hover:text-[#2C2220] border border-[#dfc278] font-medium py-2.5 px-6 rounded-2xl text-sm transition-all cursor-pointer"
          >
            I am under 18
          </button>
        </div>

        <p className="text-[11px] text-[#78591d] leading-normal">
          Your choice is saved safely in this browser on your device. We do not store any identifying cookies or personal trackers.
        </p>
      </div>
    </div>
  );
}
