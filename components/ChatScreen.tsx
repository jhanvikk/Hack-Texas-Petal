"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  ShieldAlert,
  Ban,
  Flag,
  AlertCircle,
  Sparkles,
  Info,
  CheckCircle2,
  X,
  PhoneCall,
} from "lucide-react";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { moderateChatMessage, ModerationResult } from "@/lib/safety";

export interface ChatMessage {
  id: string;
  senderAlias: string;
  isSelf: boolean;
  text: string;
  timestamp: string;
}

interface ChatScreenProps {
  peerAlias: string;
  userAlias: string;
  onBlockUser: (peerAlias: string) => void;
  onReportUser: (peerAlias: string, reason: string) => void;
  onBackToMatches: () => void;
}

export function ChatScreen({
  peerAlias = "Gentle Fern",
  userAlias = "Quiet Willow",
  onBlockUser,
  onReportUser,
  onBackToMatches,
}: ChatScreenProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      senderAlias: peerAlias,
      isSelf: false,
      text: "Hi there! So glad we connected. Dealing with cycle symptoms can feel really lonely sometimes.",
      timestamp: "Just now",
    },
    {
      id: "msg-2",
      senderAlias: userAlias,
      isSelf: true,
      text: "Hello! It feels so comforting to chat with someone who actually gets how exhausting flare-ups are.",
      timestamp: "Just now",
    },
    {
      id: "msg-3",
      senderAlias: peerAlias,
      isSelf: false,
      text: "Totally. What helped me personally was setting up a cozy heating pad station near my desk and keeping a gentle symptom journal.",
      timestamp: "Just now",
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [moderationWarning, setModerationWarning] = useState<ModerationResult | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("Unsolicited medical advice");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    // Server-side moderation simulation
    const modResult = moderateChatMessage(inputText);
    if (modResult.flagged) {
      setModerationWarning(modResult);
      return;
    }

    setModerationWarning(null);

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderAlias: userAlias,
      isSelf: true,
      text: inputText.trim(),
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");

    // Gentle automated peer response simulation after 1.5 seconds
    setTimeout(() => {
      const peerReplies = [
        "Thank you for sharing that with me. It really helps knowing I'm not the only one feeling this way.",
        "I hear you so deeply. Giving yourself grace on the tough days is everything.",
        "That makes so much sense. Having this safe space to talk without judgment means the world.",
      ];
      const randomReply = peerReplies[Math.floor(Math.random() * peerReplies.length)];

      const peerMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        senderAlias: peerAlias,
        isSelf: false,
        text: randomReply,
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, peerMsg]);
    }, 1400);
  };

  // Demo buttons for testers/evaluators
  const testSampleInput = (type: "safe" | "med_advice" | "crisis") => {
    if (type === "safe") {
      setInputText("What helped me was drinking warm chamomile tea and resting when my body asked for it.");
      setModerationWarning(null);
    } else if (type === "med_advice") {
      setInputText("You need to take 800mg of ibuprofen every 4 hours and stop taking your prescribed birth control.");
      setModerationWarning(null);
    } else if (type === "crisis") {
      setInputText("I have unbearable sudden stabbing pain and soaked through a pad in 30 minutes, I feel like fainting.");
      setModerationWarning(null);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[780px] bg-white rounded-3xl border border-[#EFE6DC] shadow-xs overflow-hidden">
      {/* Chat Header */}
      <div className="bg-[#FAF6F0] px-4 py-3 border-b border-[#EFE6DC] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF0EE] border border-[#FAD4D2] flex items-center justify-center text-lg shadow-2xs">
            🌸
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-sm sm:text-base text-[#2C2220]">
                {peerAlias}
              </h2>
              <span className="w-2 h-2 rounded-full bg-[#4D7C59]" title="Connected" />
            </div>
            <p className="text-[11px] text-[#7C6C68]">
              You are chatting anonymously as <span className="font-semibold text-[#D9534F]">{userAlias}</span>
            </p>
          </div>
        </div>

        {/* Safety Tools: Block & Report */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="p-2 text-[#998884] hover:text-[#C85A32] hover:bg-[#F3ECE2] rounded-xl transition-colors cursor-pointer"
            title="Report chat"
          >
            <Flag className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowBlockModal(true)}
            className="p-2 text-[#998884] hover:text-[#D9534F] hover:bg-[#FDE8E7] rounded-xl transition-colors cursor-pointer"
            title="Block user"
          >
            <Ban className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Persistent Disclaimer Bar in Every Chat */}
      <div className="px-4 py-2 bg-[#FFF7ED] border-b border-[#FAD8C3]">
        <DisclaimerBanner compact />
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FAF6F0]/40 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.isSelf ? "items-end" : "items-start"}`}
          >
            <span className="text-[10px] text-[#998884] mb-1 px-1">
              {msg.senderAlias} • {msg.timestamp}
            </span>
            <div
              className={`max-w-[85%] sm:max-w-[75%] p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                msg.isSelf
                  ? "bg-[#D9534F] text-white rounded-tr-xs"
                  : "bg-white text-[#2C2220] border border-[#EFE6DC] rounded-tl-xs"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Moderation Intercept Alert (Gently explains medical advice restriction) */}
      {moderationWarning && (
        <div className="p-3.5 bg-[#FFF0EE] border-t border-b border-[#FCA5A5] text-[#991B1B] text-xs space-y-1.5 animate-in fade-in">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#991B1B]">
                  {moderationWarning.reason}
                </p>
                <p className="text-[11px] text-[#7F1D1D] mt-0.5 leading-relaxed">
                  {moderationWarning.adviceSuggestion}
                </p>
              </div>
            </div>
            <button
              onClick={() => setModerationWarning(null)}
              className="text-[#991B1B] hover:text-[#7F1D1D]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Evaluator Quick-Test Bar */}
      <div className="bg-[#FAF6F0] px-3 py-1.5 border-t border-[#EFE6DC] flex items-center justify-between gap-1 overflow-x-auto text-[11px]">
        <span className="text-[#7C6C68] font-medium shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#D9534F]" /> Demo tests:
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => testSampleInput("safe")}
            className="px-2 py-0.5 bg-white border border-[#E5DCD2] hover:bg-[#F3ECE2] text-[#6B5C58] rounded-md transition-colors cursor-pointer"
          >
            Lived Experience
          </button>
          <button
            type="button"
            onClick={() => testSampleInput("med_advice")}
            className="px-2 py-0.5 bg-[#FFF0EE] border border-[#FAD4D2] hover:bg-[#FDE8E7] text-[#C54541] rounded-md transition-colors cursor-pointer font-semibold"
          >
            Medical Advice Trigger
          </button>
          <button
            type="button"
            onClick={() => testSampleInput("crisis")}
            className="px-2 py-0.5 bg-[#FEE2E2] border border-[#FCA5A5] hover:bg-[#FCA5A5] text-[#991B1B] rounded-md transition-colors cursor-pointer font-semibold"
          >
            Emergency Trigger
          </button>
        </div>
      </div>

      {/* Input Bar */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 bg-white border-t border-[#EFE6DC] flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Share your experience (no medical advice)..."
          className="flex-1 min-h-[46px] px-4 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E5DCD2] text-sm text-[#2C2220] placeholder-[#998884] focus:outline-none focus:ring-2 focus:ring-[#D9534F] focus:bg-white transition-all"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="min-h-[46px] min-w-[46px] p-2.5 bg-[#D9534F] hover:bg-[#C54541] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl shadow-xs flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Block Confirmation Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-[#EFE6DC] text-center">
            <div className="w-12 h-12 rounded-full bg-[#FDE8E7] text-[#D9534F] flex items-center justify-center mx-auto">
              <Ban className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#2C2220]">
              Block {peerAlias}?
            </h3>
            <p className="text-xs text-[#6B5C58] leading-relaxed">
              Blocking will immediately close this chat. Neither of you will ever be matched again, and your privacy is fully protected.
            </p>
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowBlockModal(false);
                  onBlockUser(peerAlias);
                }}
                className="w-full py-3 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer"
              >
                Yes, Block and End Chat
              </button>
              <button
                type="button"
                onClick={() => setShowBlockModal(false)}
                className="w-full py-2.5 text-[#6B5C58] hover:text-[#2C2220] text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-[#EFE6DC]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFF0EE] text-[#C54541] flex items-center justify-center shrink-0">
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#2C2220]">
                  Report Conversation
                </h3>
                <p className="text-xs text-[#7C6C68]">Safe & confidential review</p>
              </div>
            </div>

            <p className="text-xs text-[#6B5C58]">
              Why are you reporting this chat? The chat will end immediately to protect your well-being.
            </p>

            <div className="space-y-1.5">
              {[
                "Unsolicited medical advice",
                "Harassment or unkind remarks",
                "Sharing identifiable details",
                "Spam or inappropriate content",
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setReportReason(reason)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer flex items-center justify-between ${
                    reportReason === reason
                      ? "bg-[#FFF0EE] border-[#FAD4D2] text-[#C54541]"
                      : "bg-[#FAF6F0] border-[#E5DCD2] text-[#6B5C58]"
                  }`}
                >
                  <span>{reason}</span>
                  {reportReason === reason && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowReportModal(false);
                  onReportUser(peerAlias, reportReason);
                }}
                className="w-full py-3 bg-[#D9534F] hover:bg-[#C54541] text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer"
              >
                Submit Report & End Chat
              </button>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="w-full py-2 text-center text-xs text-[#6B5C58] hover:text-[#2C2220] font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
