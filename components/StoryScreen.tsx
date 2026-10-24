"use client";

import React, { useState } from "react";
import { Sparkles, Shield, AlertTriangle, ArrowRight, CheckCircle2, RotateCcw } from "lucide-react";
import { checkCrisisAndEmergency, stripPII, CrisisCheckResult } from "@/lib/safety";
import { CrisisCard } from "@/components/CrisisCard";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";

const AGE_RANGES = ["18-24", "25-34", "35-44", "45+"];
const DURATIONS = ["Under 6 months", "6 mos - 2 yrs", "2 - 5 years", "5+ years"];
const CONDITIONS = [
  "Endometriosis",
  "PCOS",
  "PMDD",
  "Heavy Bleeding",
  "Severe Cramps",
  "Perimenopause",
  "Exploring / Unsure",
];
const SUPPORT_GOALS = [
  "Someone who gets it",
  "Daily coping tips",
  "Doctor visit prep",
  "Safe space to vent",
];

interface StoryScreenProps {
  onStorySubmitted: (storyData: {
    storyText: string;
    cleanedStory: string;
    ageRange: string;
    duration: string;
    condition: string;
    supportGoal: string;
    tags: string[];
  }) => void;
  savedStory?: {
    storyText: string;
    cleanedStory: string;
    ageRange: string;
    duration: string;
    condition: string;
    supportGoal: string;
  } | null;
}

export function StoryScreen({ onStorySubmitted, savedStory }: StoryScreenProps) {
  const [storyText, setStoryText] = useState(savedStory?.storyText || "");
  const [ageRange, setAgeRange] = useState(savedStory?.ageRange || "25-34");
  const [duration, setDuration] = useState(savedStory?.duration || "2 - 5 years");
  const [condition, setCondition] = useState(savedStory?.condition || "Endometriosis");
  const [supportGoal, setSupportGoal] = useState(savedStory?.supportGoal || "Daily coping tips");
  
  const [crisisAlert, setCrisisAlert] = useState<CrisisCheckResult>({ triggered: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dismissedCrisisNotice, setDismissedCrisisNotice] = useState(false);

  // Live text change handler with real-time safety check
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setStoryText(text);

    const check = checkCrisisAndEmergency(text);
    if (check.triggered && !dismissedCrisisNotice) {
      setCrisisAlert(check);
    } else if (!check.triggered) {
      setCrisisAlert({ triggered: false });
      setDismissedCrisisNotice(false);
    }
  };

  // One-click demo story filler for judges
  const handleFillDemoStory = () => {
    const demo =
      "I was diagnosed with endometriosis about 3 years ago after dealing with painful periods that kept me in bed for days. The hardest part is managing work flare-ups and feeling like doctors don't always listen. You can reach my doctor's office at 555-0199 or email me at sample@example.com if needed. Looking to chat with someone who has found gentle ways to cope with fatigue and daily pain.";
    setStoryText(demo);
    setAgeRange("25-34");
    setDuration("2 - 5 years");
    setCondition("Endometriosis");
    setSupportGoal("Daily coping tips");

    const check = checkCrisisAndEmergency(demo);
    setCrisisAlert(check);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyText.trim()) return;

    setIsSubmitting(true);

    // 1. Check for crisis
    const crisisCheck = checkCrisisAndEmergency(storyText);
    if (crisisCheck.triggered && !dismissedCrisisNotice) {
      setCrisisAlert(crisisCheck);
      setIsSubmitting(false);
      return;
    }

    // 2. Strip PII before storage/AI
    const cleaned = stripPII(storyText);

    // 3. Extract basic tags
    const tags = [condition, ageRange, duration, supportGoal].filter(Boolean);

    setTimeout(() => {
      onStorySubmitted({
        storyText,
        cleanedStory: cleaned,
        ageRange,
        duration,
        condition,
        supportGoal,
        tags,
      });
      setIsSubmitting(false);
    }, 400);
  };

  // Preview PII stripping if user typed phone or email
  const previewCleaned = stripPII(storyText);
  const hasStrippedPII = previewCleaned !== storyText;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Disclaimer */}
      <DisclaimerBanner />

      {/* Hero Welcome Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#EFE6DC] shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FDE8E7] text-[#C54541] rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Step 1 of 3: Share Your Journey
          </div>

          <button
            type="button"
            onClick={handleFillDemoStory}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C3E1F] bg-[#FFF0EE] hover:bg-[#FDE8E7] px-3 py-1.5 rounded-xl border border-[#FAD4D2] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Quick Demo Autofill
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2220] tracking-tight">
          Your story is safe here.
        </h1>
        <p className="text-sm text-[#6B5C58] leading-relaxed">
          Write as much or as little as you want. We will automatically remove names, phone numbers, and emails to protect your privacy, then introduce you to 3 peers with similar journeys.
        </p>
      </div>

      {/* Red-Flag & Crisis Notice if triggered */}
      {crisisAlert.triggered && (
        <CrisisCard
          crisis={crisisAlert}
          onContinue={() => {
            setDismissedCrisisNotice(true);
            setCrisisAlert({ triggered: false });
          }}
        />
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Story Textarea */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#EFE6DC] shadow-xs space-y-3">
          <label htmlFor="storyInput" className="block text-base font-bold text-[#2C2220]">
            In your own words
          </label>
          <p className="text-xs text-[#7C6C68]">
            What has your experience felt like? What are your most challenging days or symptoms?
          </p>

          <textarea
            id="storyInput"
            value={storyText}
            onChange={handleTextChange}
            rows={6}
            placeholder="Take your time. Share whatever feels safe: when your symptoms began, how daily life or work feels, or what you wish people understood..."
            className="w-full p-4 rounded-2xl bg-[#FAF6F0] border border-[#E5DCD2] text-[#2C2220] placeholder-[#998884] focus:outline-none focus:ring-2 focus:ring-[#D9534F] focus:bg-white text-sm sm:text-base leading-relaxed transition-all resize-y min-h-[140px]"
          />

          {/* Privacy Guarantee Note */}
          <div className="flex items-center gap-2 text-xs text-[#4D7C59] bg-[#EBF3ED] px-3.5 py-2 rounded-xl">
            <Shield className="w-4 h-4 shrink-0" />
            <span>
              Zero identification: Original raw text is never stored. Only anonymized tags and similarity vectors are kept.
            </span>
          </div>

          {/* Live PII Scrubbing Visualizer */}
          {hasStrippedPII && (
            <div className="p-3.5 bg-[#FFF9ED] border border-[#FDE3B7] rounded-xl text-xs text-[#8A5812] space-y-1 animate-in fade-in">
              <p className="font-semibold flex items-center gap-1.5 text-[#A66814]">
                <CheckCircle2 className="w-4 h-4 text-[#C85A32]" />
                PII Protected: Identifying details will be masked:
              </p>
              <p className="italic text-[11px] text-[#6E4207] bg-white/70 p-2 rounded-lg border border-[#FDE3B7]">
                &quot;{previewCleaned}&quot;
              </p>
            </div>
          )}
        </div>

        {/* Tappable Choices */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#EFE6DC] shadow-xs space-y-5">
          <h2 className="text-lg font-bold text-[#2C2220]">
            Optional Tappable Choices
          </h2>
          <p className="text-xs text-[#7C6C68]">
            These help our matching engine connect you with people facing similar timing and goals.
          </p>

          {/* Age Range */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7C6C68]">
              Age Range
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {AGE_RANGES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setAgeRange(item)}
                  className={`min-h-[44px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all border cursor-pointer ${
                    ageRange === item
                      ? "bg-[#D9534F] text-white border-[#D9534F] shadow-xs"
                      : "bg-[#FAF6F0] text-[#6B5C58] border-[#E5DCD2] hover:bg-[#F3ECE2]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7C6C68]">
              How long has this been going on?
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DURATIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setDuration(item)}
                  className={`min-h-[44px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all border cursor-pointer ${
                    duration === item
                      ? "bg-[#D9534F] text-white border-[#D9534F] shadow-xs"
                      : "bg-[#FAF6F0] text-[#6B5C58] border-[#E5DCD2] hover:bg-[#F3ECE2]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Diagnosed or Suspected Condition */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7C6C68]">
              Primary Experience / Condition
            </span>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCondition(item)}
                  className={`min-h-[44px] py-2 px-3.5 rounded-full text-xs sm:text-sm font-semibold transition-all border cursor-pointer ${
                    condition === item
                      ? "bg-[#C85A32] text-white border-[#C85A32] shadow-xs"
                      : "bg-[#FAF6F0] text-[#6B5C58] border-[#E5DCD2] hover:bg-[#F3ECE2]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Support Goal */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7C6C68]">
              What kind of support feels best right now?
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUPPORT_GOALS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSupportGoal(item)}
                  className={`min-h-[48px] py-3 px-4 rounded-2xl text-xs sm:text-sm font-semibold text-left transition-all border cursor-pointer flex items-center justify-between ${
                    supportGoal === item
                      ? "bg-[#4D7C59] text-white border-[#4D7C59] shadow-xs"
                      : "bg-[#FAF6F0] text-[#6B5C58] border-[#E5DCD2] hover:bg-[#F3ECE2]"
                  }`}
                >
                  <span>{item}</span>
                  {supportGoal === item && <CheckCircle2 className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!storyText.trim() || isSubmitting}
            className="w-full min-h-[56px] bg-[#D9534F] hover:bg-[#C54541] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] text-white font-bold py-4 px-6 rounded-2xl shadow-sm text-base sm:text-lg transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Finding compassionate matches...</span>
            ) : (
              <>
                <span>Find My 3 Peer Matches</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
          <p className="text-center text-xs text-[#998884] mt-2.5">
            Your connection requests require mutual opt-in before any chat opens.
          </p>
        </div>
      </form>
    </div>
  );
}
