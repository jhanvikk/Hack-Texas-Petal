"use client";

import React from "react";
import { Heart, Users, MessageCircle, Settings, ShieldCheck, LifeBuoy, Stethoscope } from "lucide-react";

export type NavTab = "story" | "matches" | "chat" | "care" | "settings";

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
    <header className="sticky top-0 z-40 bg-[#FAF6F0]/90 backdrop-blur-md border-b border-[#EFE6DC]">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab("story")}
            className="flex items-center gap-2 group text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FFF0EE] border border-[#FAD4D2] flex items-center justify-center text-lg shadow-2xs group-hover:scale-105 transition-transform">
              🌸
            </div>
            <div>
              <span className="font-extrabold text-[#2C2220] text-lg tracking-tight block leading-none">
                Petal
              </span>
              <span className="text-[11px] font-medium text-[#7C6C68] tracking-wide">
                Anonymous Sanctuary
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
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF0EE] border border-[#FAD4D2] hover:bg-[#FDE8E7] text-[#C54541] rounded-full text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="Crisis and Urgent Support Resources"
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>988 Help</span>
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <nav className="max-w-2xl mx-auto px-2 pb-2">
        <div className="grid grid-cols-5 gap-1 p-1 bg-[#F3ECE2] rounded-2xl border border-[#E9DFD3]">
          {/* Story Tab */}
          <button
            type="button"
            onClick={() => setActiveTab("story")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-1 rounded-xl text-[10px] sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "story"
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
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-1 rounded-xl text-[10px] sm:text-sm font-semibold transition-all cursor-pointer relative ${
              activeTab === "matches"
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
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-1 rounded-xl text-[10px] sm:text-sm font-semibold transition-all cursor-pointer relative ${
              activeTab === "chat"
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
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-1 rounded-xl text-[10px] sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "care"
                ? "bg-white text-[#D9534F] shadow-xs"
                : "text-[#6B5C58] hover:text-[#2C2220] hover:bg-white/40"
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Care</span>
          </button>

          {/* Settings Tab */}
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-1 rounded-xl text-[10px] sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "settings"
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
