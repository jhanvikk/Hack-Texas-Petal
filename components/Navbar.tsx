"use client";

import React from "react";
import { Heart, Users, MessageCircle, Settings, ShieldCheck, LifeBuoy, Stethoscope } from "lucide-react";
import { PetalLogo } from "@/components/PetalLogo";

export type NavTab = "story" | "matches" | "chat" | "care" | "clinics" | "settings";

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  matchesCount: number;
  unreadChatCount?: number;
  onOpenEmergencyModal?: () => void;
}

export function Navbar({
  activeTab,
  setActiveTab,
  matchesCount,
  unreadChatCount = 0,
  onOpenEmergencyModal,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#e6abb2]/95 backdrop-blur-md border-b border-[#d89ba3]">
      <div className="max-w-2xl mx-auto px-4 py-[3px] flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5 ml-3">
          <button
            onClick={() => setActiveTab("story")}
            className="flex items-center gap-0 group text-left cursor-pointer"
          >
            <PetalLogo size="sm" className="group-hover:scale-105 transition-transform" />
            <div>
              <span className="font-extrabold text-[#2C2220] text-lg tracking-tight block leading-none">
                Petal
              </span>
              <span className="text-[11px] font-semibold text-[#8b4650] tracking-wide">
                A Safe Haven for Her Health
              </span>
            </div>
          </button>
        </div>

        {/* Status & Crisis Button */}
        <div className="flex items-center gap-2">
          <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#EFE6DC] rounded-full text-[11px] font-medium text-[#4D7C59]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Anonymous</span>
          </div>

          <button
            type="button"
            onClick={onOpenEmergencyModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f4db9a] border border-[#dfc278] hover:bg-[#ebd087] text-[#4a350c] rounded-full text-xs font-bold shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="Crisis and Urgent Support Resources"
          >
            <LifeBuoy className="w-3.5 h-3.5 text-[#6c4e12]" />
            <span>988 Help</span>
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <nav className="max-w-2xl mx-auto px-2 pb-[3px]">
        <div className="grid grid-cols-6 gap-1 p-[3px] bg-[#dc9ea6] rounded-2xl border border-[#d89ba3]">
          {/* Story Tab */}
          <button
            type="button"
            onClick={() => setActiveTab("story")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-[7.5px] px-1 rounded-xl text-[10px] sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === "story"
              ? "bg-white text-[#D9534F] shadow-xs"
              : "text-[#6B5C58] hover:text-[#2C2220] hover:bg-white/40"
              }`}
          >
            <Heart className={`w-4 h-4 ${activeTab === "story" ? "fill-[#D9534F]" : ""}`} />
            <span>My Story</span>
          </button>

          {/* Matches Tab */}
          <button
            type="button"
            onClick={() => setActiveTab("matches")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-[7.5px] px-1 rounded-xl text-[10px] sm:text-sm font-semibold transition-all cursor-pointer relative ${activeTab === "matches"
              ? "bg-white text-[#D9534F] shadow-xs"
              : "text-[#6B5C58] hover:text-[#2C2220] hover:bg-white/40"
              }`}
          >
            <Users className="w-4 h-4" />
            <span>Matches</span>
            {matchesCount > 0 && (
              <span className="ml-0.5 hidden sm:inline-flex px-1.5 py-0.2 bg-[#FDE8E7] text-[#C54541] rounded-full text-[10px] font-bold">
                {matchesCount}
              </span>
            )}
          </button>

          {/* Chat Tab */}
          <button
            type="button"
            onClick={() => setActiveTab("chat")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-[7.5px] px-1 rounded-xl text-[10px] sm:text-sm font-semibold transition-all cursor-pointer relative ${activeTab === "chat"
              ? "bg-white text-[#D9534F] shadow-xs"
              : "text-[#6B5C58] hover:text-[#2C2220] hover:bg-white/40"
              }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat</span>
            {unreadChatCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#D9534F] absolute top-2 right-2 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Care Tab */}
          <button
            type="button"
            onClick={() => setActiveTab("care")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-[7.5px] px-1 rounded-xl text-[10px] sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === "care"
              ? "bg-white text-[#D9534F] shadow-xs"
              : "text-[#6B5C58] hover:text-[#2C2220] hover:bg-white/40"
              }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Care</span>
          </button>

          {/* Clinics Tab */}
          <button
            type="button"
            onClick={() => setActiveTab("clinics")}
            className={`flex items-center justify-center gap-1 py-[7.5px] px-1 rounded-xl text-[11px] sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === "clinics"
                ? "bg-white text-[#D9534F] shadow-xs"
                : "text-[#6B5C58] hover:text-[#2C2220] hover:bg-white/40"
              }`}
          >
            <Stethoscope className="w-4 h-4 shrink-0" />
            <span>Clinics</span>
          </button>

          {/* Settings Tab */}
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-[7.5px] px-1 rounded-xl text-[10px] sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === "settings"
              ? "bg-white text-[#D9534F] shadow-xs"
              : "text-[#6B5C58] hover:text-[#2C2220] hover:bg-white/40"
              }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
