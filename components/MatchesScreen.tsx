"use client";

import React, { useState } from "react";
import { Heart, MessageCircle, ShieldCheck, Sparkles, Clock, X, ArrowRight } from "lucide-react";
import { MatchedStory } from "@/lib/sampleData";

export interface MatchConnectionState {
  [storyId: string]: "idle" | "requested" | "connected" | "declined";
}

interface MatchesScreenProps {
  matches: MatchedStory[];
  isLoading?: boolean;
  connectionStates: MatchConnectionState;
  onConnectRequest: (storyId: string) => void;
  onSimulatePeerAccept: (storyId: string) => void;
  onDeclineMatch: (storyId: string) => void;
  onOpenChatWithMatch: (match: MatchedStory) => void;
}

export function MatchesScreen({
  matches,
  isLoading = false,
  connectionStates,
  onConnectRequest,
  onSimulatePeerAccept,
  onDeclineMatch,
  onOpenChatWithMatch,
}: MatchesScreenProps) {
  const [activeInfoNotice, setActiveInfoNotice] = useState(true);

  const visibleMatches = matches.filter(
    (m) => connectionStates[m.id] !== "declined"
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#EFE6DC] shadow-xs space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EBF3ED] text-[#4D7C59] rounded-full text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Step 2 of 3: Recommended Matches
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2220] tracking-tight">
          Peers who walk a similar road.
        </h1>
        <p className="text-sm text-[#6B5C58] leading-relaxed">
          Here are the top 3 people whose shared journeys, symptoms, and coping goals closely mirror yours. Exact ages and personal details are strictly private.
        </p>
      </div>

      {/* Mutual Opt-In Notice */}
      {activeInfoNotice && (
        <div className="bg-[#FFF5ED] border border-[#FADCC7] rounded-2xl p-4 text-[#7A3E26] text-xs sm:text-sm flex items-start justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#C85A32] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#8C3E1F]">Mutual Opt-In Protection</p>
              <p className="text-[#7A3E26] mt-0.5 leading-relaxed">
                A live chat will <strong>only open</strong> if both people choose to connect. You can decline any match quietly at any time.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveInfoNotice(false)}
            className="text-[#998884] hover:text-[#2C2220] p-1"
            title="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="bg-white rounded-3xl p-8 border border-[#EFE6DC] text-center text-sm text-[#6B5C58]">
          Finding people with similar experiences...
        </div>
      )}

      {/* Matches List */}
      {!isLoading && (
        <div className="space-y-4">
          {visibleMatches.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-[#EFE6DC] text-center space-y-3">
              <p className="text-base font-semibold text-[#2C2220]">
                No active matches remaining.
              </p>
              <p className="text-xs text-[#6B5C58]">
                You can update your story or preferences at any time to discover new peer connections.
              </p>
            </div>
          ) : (
            visibleMatches.slice(0, 3).map((match) => {
              const state = connectionStates[match.id] || "idle";

              return (
                <div
                  key={match.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EFE6DC] shadow-xs space-y-4 hover:border-[#FAD4D2] transition-colors"
                >
                  {/* Match Header */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#FFF0EE] border border-[#FAD4D2] flex items-center justify-center text-xl shadow-2xs">
                        🌱
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base sm:text-lg font-bold text-[#2C2220]">
                            {match.alias}
                          </h2>
                          <span className="text-[11px] px-2 py-0.5 bg-[#FAF6F0] border border-[#E5DCD2] rounded-full text-[#6B5C58]">
                            {match.duration}
                          </span>
                        </div>
                        <p className="text-xs text-[#7C6C68]">{match.condition}</p>
                      </div>
                    </div>

                    <div className="px-3 py-1 bg-[#EBF3ED] text-[#4D7C59] border border-[#D5E6D8] rounded-full text-xs font-bold">
                      {match.score}% match
                    </div>
                  </div>

                  {/* Non-identifying summary card */}
                  <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#EFE6DC] text-xs sm:text-sm text-[#2C2220] leading-relaxed italic">
                    &ldquo;{match.summary}&rdquo;
                  </div>

                  {/* Why you matched */}
                  <p className="text-xs text-[#6B5C58]">{match.why}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {match.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#F3ECE2] text-[#6B5C58]"
                      >
                        #{tag}
                      </span>
                    ))}
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#FFF0EE] text-[#C54541]">
                      Goal: {match.supportGoal}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-[#F3ECE2] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => onDeclineMatch(match.id)}
                      className="text-xs text-[#998884] hover:text-[#D9534F] py-2 px-3 rounded-xl transition-colors cursor-pointer text-center"
                    >
                      Decline quietly
                    </button>

                    <div className="flex items-center gap-2">
                      {state === "idle" && (
                        <button
                          type="button"
                          onClick={() => onConnectRequest(match.id)}
                          className="w-full sm:w-auto min-h-[44px] bg-[#D9534F] hover:bg-[#C54541] active:scale-95 text-white font-semibold py-2.5 px-5 rounded-xl shadow-xs text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Heart className="w-4 h-4 fill-white" />
                          <span>Request to Connect</span>
                        </button>
                      )}

                      {state === "requested" && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#FFF9ED] border border-[#FDE3B7] text-[#8A5812] rounded-xl text-xs font-semibold">
                            <Clock className="w-3.5 h-3.5 animate-spin" />
                            <span>Waiting for {match.alias}...</span>
                          </div>

                          {/* Demo helper button so judges can simulate peer acceptance instantly */}
                          <button
                            type="button"
                            onClick={() => onSimulatePeerAccept(match.id)}
                            className="min-h-[40px] px-3 py-2 bg-[#FAF6F0] hover:bg-[#EBF3ED] text-[#4D7C59] border border-[#D5E6D8] rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                            title="Simulate peer accepting the match"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Simulate Mutual Accept</span>
                          </button>
                        </div>
                      )}

                      {state === "connected" && (
                        <button
                          type="button"
                          onClick={() => onOpenChatWithMatch(match)}
                          className="w-full sm:w-auto min-h-[44px] bg-[#4D7C59] hover:bg-[#3D6647] active:scale-95 text-white font-bold py-2.5 px-5 rounded-xl shadow-xs text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Connected! Open Chat</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}