"use client";

import React, { useState } from "react";
import {
  Heart,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Check,
  Clock,
  Star,
  X,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { MatchedStory } from "@/lib/sampleData";
import { ClinicSymptom } from "@/lib/clinics";

export interface MatchConnectionState {
  [storyId: string]: "idle" | "requested" | "connected" | "declined";
}

interface MatchesScreenProps {
  matches: MatchedStory[];
  isLoading?: boolean;
  connectionStates: MatchConnectionState;
  clinicQuestion?: { name: string; address?: string } | null;
  sharedClinicExperience?: { rating: number; experience: string } | null;
  onShareClinicExperience?: (submission: {
    rating: number;
    experience: string;
  }) => void;
  onBackToClinics?: () => void;
  onConnectRequest: (storyId: string) => void;
  onSimulatePeerAccept: (storyId: string) => void;
  onDeclineMatch: (storyId: string) => void;
  onOpenChatWithMatch: (match: MatchedStory) => void;
  clinicMatchSymptoms?: ClinicSymptom[];
}

export function MatchesScreen({
  matches,
  isLoading = false,
  connectionStates,
  clinicQuestion,
  sharedClinicExperience,
  onShareClinicExperience,
  onBackToClinics,
  onConnectRequest,
  onSimulatePeerAccept,
  onDeclineMatch,
  onOpenChatWithMatch,
  clinicMatchSymptoms = [],
}: MatchesScreenProps) {
  const [activeInfoNotice, setActiveInfoNotice] = useState(true);
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [experienceRating, setExperienceRating] = useState(0);
  const [experienceText, setExperienceText] = useState("");

  const symptomPatterns: Record<ClinicSymptom, RegExp> = {
    heavy_bleeding: /heavy bleeding|heavy flow|fibroid|anemia/,
    severe_cramps: /cramp|dysmenorrhea|period pain/,
    irregular_cycles: /irregular cycle|irregular period|pcos|polycystic/,
    pelvic_pain: /pelvic pain|endometriosis|adenomyosis/,
    pain_with_sex: /pain with sex|painful intercourse|pelvic pain|endometriosis/,
    fatigue: /fatigue|exhaustion|low energy/,
    mood_changes_premenstrual: /pmdd|mood changes|mood drop|premenstrual/,
    hot_flashes: /hot flash|night sweat|menopause/,
    spotting_between_periods: /spotting|bleeding between/,
    long_periods: /long period|prolonged period|heavy bleeding/,
    clots: /blood clot|clots|fibroid/,
  };

  const conditionMatches = clinicMatchSymptoms.length
    ? matches.filter((match) => {
        const searchText = `${match.condition} ${match.tags.join(" ")} ${match.summary}`.toLowerCase();
        return clinicMatchSymptoms.some((symptom) => symptomPatterns[symptom].test(searchText));
      })
    : matches;

  const visibleMatches = conditionMatches.filter(
    (match) => connectionStates[match.id] !== "declined"
  );

  const clinicMatches = clinicQuestion
    ? visibleMatches.filter((match) =>
        match.visitedClinicNames?.some(
          (clinicName) =>
            clinicName.trim().toLowerCase() ===
            clinicQuestion.name.trim().toLowerCase()
        )
      )
    : visibleMatches;

  const displayedMatches = clinicMatches.slice(0, 3);

  const handleSubmitExperience = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!experienceRating || !experienceText.trim()) return;

    onShareClinicExperience?.({
      rating: experienceRating,
      experience: experienceText.trim(),
    });

    setShowExperienceForm(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {clinicQuestion && onBackToClinics && (
        <button
          type="button"
          onClick={onBackToClinics}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#E5DCD2] bg-white px-3 text-xs font-semibold text-[#6B5C58] transition-colors hover:bg-[#FAF6F0]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to clinics
        </button>
      )}

      {/* Header */}
      <div className="space-y-2 rounded-3xl border border-[#EFE6DC] bg-white p-5 shadow-xs sm:p-7">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#EBF3ED] px-3 py-1 text-xs font-semibold text-[#4D7C59]">
          <Sparkles className="h-3.5 w-3.5" />
          {clinicQuestion
            ? "Clinic visit experiences"
            : "Step 2 of 3: Recommended Matches"}
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-[#2C2220] sm:text-3xl">
          {clinicQuestion
            ? `Women who have visited ${clinicQuestion.name}.`
            : "Peers who walk a similar road."}
        </h1>

        <p className="text-sm leading-relaxed text-[#6B5C58]">
          {clinicQuestion
            ? "Only profiles that have shared a visit to this clinic will appear here. You can request to connect and ask about their experience."
            : "Here are the top 3 people whose shared journeys, symptoms, and coping goals closely mirror yours. Exact ages and personal details are strictly private."}
        </p>
      </div>

      {/* Mutual opt-in notice */}
      {activeInfoNotice && (
        <div className="flex items-start justify-between gap-3 rounded-2xl border border-[#FADCC7] bg-[#FFF5ED] p-4 text-xs text-[#7A3E26] shadow-2xs sm:text-sm">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#C85A32]" />
            <div>
              <p className="font-bold text-[#8C3E1F]">
                Mutual Opt-In Protection
              </p>
              <p className="mt-0.5 leading-relaxed">
                A live chat will <strong>only open</strong> if both people
                choose to connect. You can decline any match quietly at any
                time.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveInfoNotice(false)}
            className="p-1 text-[#998884] hover:text-[#2C2220]"
            title="Dismiss notice"
            aria-label="Dismiss notice"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Match content */}
      {isLoading ? (
        <div className="rounded-3xl border border-[#EFE6DC] bg-white p-8 text-center text-sm text-[#6B5C58]">
          Finding people with similar experiences...
        </div>
      ) : (
        <>
          {clinicQuestion && clinicMatches.length > 0 && (
            <div className="rounded-xl border border-[#D5E6D8] bg-[#EBF3ED] p-3 text-xs text-[#3D6647]">
              Showing profiles that have shared a visit to{" "}
              {clinicQuestion.name}.
            </div>
          )}

          <div className="space-y-4">
            {/* No clinic visitors: offer a way to share an experience */}
            {clinicQuestion && clinicMatches.length === 0 ? (
              <div className="space-y-3 rounded-2xl border border-[#EFE6DC] bg-white p-6 text-center sm:p-8">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF0EE] text-[#C54541]">
                  <Heart className="h-5 w-5" />
                </div>

                <p className="text-base font-semibold text-[#2C2220]">
                  No one has shared a visit to {clinicQuestion.name} yet.
                </p>

                {clinicQuestion.address && (
                  <p className="text-xs text-[#7C6C68]">
                    {clinicQuestion.address}
                  </p>
                )}

                {sharedClinicExperience ? (
                  <div className="space-y-3 rounded-xl bg-[#EBF3ED] p-4 text-left">
                    <div
                      className="flex items-center gap-1"
                      aria-label={`Your rating: ${sharedClinicExperience.rating} out of 5`}
                    >
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star
                          key={index}
                          className={`h-4 w-4 ${
                            index < sharedClinicExperience.rating
                              ? "fill-[#D6A83E] text-[#D6A83E]"
                              : "text-[#CFC1B3]"
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-xs font-semibold text-[#3D6647]">
                        {sharedClinicExperience.rating}/5
                      </span>
                    </div>

                    <p className="text-sm leading-relaxed text-[#2C2220]">
                      {sharedClinicExperience.experience}
                    </p>

                    <p className="text-[11px] leading-relaxed text-[#6B5C58]">
                      Your experience is only saved in this demo session and
                      is not visible to other users.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs leading-relaxed text-[#6B5C58]">
                      No matching visitor profile is available yet. If
                      you’ve been here, you can be the first to share your
                      rating and experience.
                    </p>

                    {!showExperienceForm ? (
                      <button
                        type="button"
                        onClick={() => setShowExperienceForm(true)}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#D5E6D8] bg-[#EBF3ED] px-4 text-xs font-semibold text-[#3D6647] transition-colors hover:bg-[#DDEBDD]"
                      >
                        <Heart className="h-4 w-4" />
                        Be the first to share
                      </button>
                    ) : (
                      <form
                        onSubmit={handleSubmitExperience}
                        className="space-y-4 text-left"
                      >
                        <fieldset className="space-y-2">
                          <legend className="text-xs font-semibold text-[#2C2220]">
                            Rate your visit
                          </legend>

                          <div
                            className="flex items-center gap-1"
                            role="group"
                            aria-label="Choose a rating from 1 to 5 stars"
                          >
                            {Array.from({ length: 5 }, (_, index) => {
                              const rating = index + 1;

                              return (
                                <button
                                  key={rating}
                                  type="button"
                                  onClick={() => setExperienceRating(rating)}
                                  aria-label={`${rating} out of 5 stars`}
                                  aria-pressed={experienceRating === rating}
                                  className="rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D7C59]"
                                >
                                  <Star
                                    className={`h-6 w-6 ${
                                      rating <= experienceRating
                                        ? "fill-[#D6A83E] text-[#D6A83E]"
                                        : "text-[#CFC1B3]"
                                    }`}
                                  />
                                </button>
                              );
                            })}

                            <span className="ml-2 text-xs text-[#6B5C58]">
                              {experienceRating
                                ? `${experienceRating}/5`
                                : "Select a rating"}
                            </span>
                          </div>
                        </fieldset>

                        <label className="block space-y-1.5">
                          <span className="text-xs font-semibold text-[#2C2220]">
                            Share your visit experience
                          </span>

                          <textarea
                            value={experienceText}
                            onChange={(event) =>
                              setExperienceText(event.target.value)
                            }
                            required
                            maxLength={600}
                            rows={4}
                            placeholder="What would you want another woman to know about your visit?"
                            className="w-full resize-y rounded-xl border border-[#E5DCD2] bg-white p-3 text-sm text-[#2C2220] placeholder:text-[#998884] focus:outline-none focus:ring-2 focus:ring-[#4D7C59]"
                          />

                          <span className="block text-[11px] text-[#7C6C68]">
                            Keep it to your personal experience, not medical
                            advice. 600 characters max.
                          </span>
                        </label>

                        <p className="text-[11px] leading-relaxed text-[#7C6C68]">
                          This demo stores your rating and text only for this
                          session; it won’t create a public profile or be
                          visible to other users.
                        </p>

                        <button
                          type="submit"
                          disabled={
                            !experienceRating || !experienceText.trim()
                          }
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#4D7C59] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#3D6647] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Check className="h-4 w-4" />
                          Save visit experience
                        </button>
                      </form>
                    )}
                  </>
                )}
              </div>
            ) : !clinicQuestion && visibleMatches.length === 0 ? (
              <div className="space-y-3 rounded-3xl border border-[#EFE6DC] bg-white p-8 text-center">
                <p className="text-base font-semibold text-[#2C2220]">
                  No active matches remaining.
                </p>
                <p className="text-xs text-[#6B5C58]">
                  You can update your story or preferences at any time to
                  discover new peer connections.
                </p>
              </div>
            ) : displayedMatches.length > 0 ? (
              displayedMatches.map((match, index) => {
                const state = connectionStates[match.id] || "idle";
                const matchScore = match.score ?? 96 - index * 4;

                return (
                  <div
                    key={match.id}
                    className="space-y-4 rounded-3xl border border-[#EFE6DC] bg-white p-5 shadow-xs transition-colors hover:border-[#FAD4D2] sm:p-6"
                  >
                    {/* Match header */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#FAD4D2] bg-[#FFF0EE] text-xl shadow-2xs">
                          🌱
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-base font-bold text-[#2C2220] sm:text-lg">
                              {match.alias}
                            </h2>

                            <span className="rounded-full border border-[#E5DCD2] bg-[#FAF6F0] px-2 py-0.5 text-[11px] text-[#6B5C58]">
                              {match.duration}
                            </span>

                            {clinicQuestion && (
                              <span className="rounded-full border border-[#D5E6D8] bg-[#EBF3ED] px-2 py-0.5 text-[10px] text-[#3D6647]">
                                Visited this clinic
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-[#7C6C68]">
                            {match.condition}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-full border border-[#D5E6D8] bg-[#EBF3ED] px-3 py-1 text-xs font-bold text-[#4D7C59]">
                        {matchScore}% match
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="rounded-2xl border border-[#EFE6DC] bg-[#FAF6F0] p-4 text-xs italic leading-relaxed text-[#2C2220] sm:text-sm">
                      &ldquo;{match.summary}&rdquo;
                    </div>

                    {/* Why this match */}
                    {match.why && (
                      <p className="text-xs text-[#6B5C58]">{match.why}</p>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {match.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[#F3ECE2] px-2.5 py-1 text-[11px] font-medium text-[#6B5C58]"
                        >
                          #{tag}
                        </span>
                      ))}

                      <span className="rounded-full bg-[#FFF0EE] px-2.5 py-1 text-[11px] font-medium text-[#C54541]">
                        Goal: {match.supportGoal}
                      </span>
                    </div>

                    {/* Connection and chat actions */}
                    <div className="flex flex-col items-stretch justify-between gap-3 border-t border-[#F3ECE2] pt-3 sm:flex-row sm:items-center">
                      <button
                        type="button"
                        onClick={() => onDeclineMatch(match.id)}
                        className="cursor-pointer rounded-xl px-3 py-2 text-center text-xs text-[#998884] transition-colors hover:text-[#D9534F]"
                      >
                        Decline quietly
                      </button>

                      <div className="flex items-center gap-2">
                        {state === "idle" && (
                          <button
                            type="button"
                            onClick={() => onConnectRequest(match.id)}
                            className="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#D9534F] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#C54541] active:scale-95 sm:w-auto sm:text-sm"
                          >
                            <Heart className="h-4 w-4 fill-white" />
                            <span>Request to Connect</span>
                          </button>
                        )}

                        {state === "requested" && (
                          <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
                            <div className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#FDE3B7] bg-[#FFF9ED] px-3 py-2 text-xs font-semibold text-[#8A5812]">
                              <Clock className="h-3.5 w-3.5 animate-spin" />
                              <span>Waiting for {match.alias}...</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => onSimulatePeerAccept(match.id)}
                              className="flex min-h-[40px] cursor-pointer items-center justify-center gap-1 rounded-xl border border-[#D5E6D8] bg-[#FAF6F0] px-3 py-2 text-xs font-bold text-[#4D7C59] transition-colors hover:bg-[#EBF3ED]"
                              title="Simulate peer accepting the match"
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>Simulate Mutual Accept</span>
                            </button>
                          </div>
                        )}

                        {state === "connected" && (
                          <button
                            type="button"
                            onClick={() => onOpenChatWithMatch(match)}
                            className="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#4D7C59] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#3D6647] active:scale-95 sm:w-auto sm:text-sm"
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span>Connected! Open Chat</span>
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-[#EFE6DC] bg-white p-6 text-center text-sm text-[#6B5C58]">
                No active matches remaining.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
