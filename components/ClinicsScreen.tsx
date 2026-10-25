"use client";

import React, { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Clock3, Copy, ExternalLink, MapPin, Phone, Star, Stethoscope, X } from "lucide-react";
import { ClinicProfile, ClinicResult, ClinicSymptom, SeveritySignal } from "@/lib/clinics";

interface ClinicsScreenProps {
  hasStory: boolean;
  profile: ClinicProfile | null;
  clinics: ClinicResult[];
  loading: boolean;
  error: string | null;
  zip: string;
  onZipChange: (zip: string) => void;
  onRetry: () => void;
  onGoToStory: () => void;
  onOpenMatches: (symptoms: ClinicSymptom[]) => void;
}

function todayHours(hours: ClinicResult["hours"]): string {
  if (!hours) return "Today's hours unavailable";
  return hours[new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date())]
    || "Today's hours unavailable";
}

function isOpen(clinic: ClinicResult): boolean {
  return /^open\b/i.test(clinic.openState);
}

function formatDirections(clinic: ClinicResult): string {
  const query = clinic.placeId ? `place_id:${clinic.placeId}` : clinic.address;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function ClinicsScreen({
  hasStory,
  profile,
  clinics,
  loading,
  error,
  zip,
  onZipChange,
  onRetry,
  onGoToStory,
  onOpenMatches,
}: ClinicsScreenProps) {
  const [openOnly, setOpenOnly] = useState(false);
  const [listeningFirst, setListeningFirst] = useState(false);
  const [womanOnly, setWomanOnly] = useState(false);
  const [lowCostOnly, setLowCostOnly] = useState(false);
  const [showVisitPrep, setShowVisitPrep] = useState(false);
  const [visitPrepCopied, setVisitPrepCopied] = useState(false);

  const visibleClinics = useMemo(() => {
    const filtered = clinics.filter((clinic) =>
      (!openOnly || isOpen(clinic))
      && (!womanOnly || /woman clinician|female physician|women's health provider/i.test(clinic.name))
      && (!lowCostOnly || clinic.lowCostOption),
    );
    return listeningFirst
      ? [...filtered].sort((first, second) => second.listeningScore - first.listeningScore)
      : filtered;
  }, [clinics, listeningFirst, lowCostOnly, openOnly, womanOnly]);

  if (!hasStory) {
    return (
      <div className="space-y-5 pb-12">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EFE6DC] text-center space-y-4">
          <Stethoscope className="w-8 h-8 text-[#4D7C59] mx-auto" />
          <h1 className="text-xl font-bold text-[#2C2220]">Clinicians who listen</h1>
          <p className="text-sm text-[#6B5C58]">Share your story and we&apos;ll find clinicians near you.</p>
          <button type="button" onClick={onGoToStory} className="min-h-11 px-5 py-2.5 bg-[#D9534F] text-white rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2">
            Share your story <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <FooterNote />
      </div>
    );
  }

  if (!zip || !/^\d{5}(?:-\d{4})?$/.test(zip)) {
    return (
      <div className="space-y-5 pb-12">
        {profile && hasUrgentSignals(profile) && <EmergencyBanner />}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#EFE6DC] space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EBF3ED] text-[#4D7C59] rounded-full text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5" /> Find nearby clinics
          </div>
          <h1 className="text-xl font-bold text-[#2C2220]">Where should we search?</h1>
          <p className="text-sm text-[#6B5C58]">Add your ZIP code in Settings to find clinicians near you. Your story stays on this device; only the specialty and ZIP are sent for search.</p>
          <label htmlFor="clinic-zip" className="block text-xs font-semibold text-[#2C2220]">ZIP code</label>
          <input
            id="clinic-zip"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={10}
            value={zip}
            onChange={(event) => onZipChange(event.target.value)}
            placeholder="e.g. 78701"
            className="w-full min-h-12 px-3 rounded-xl bg-[#FAF6F0] border border-[#E5DCD2] text-sm focus:outline-none focus:ring-2 focus:ring-[#D9534F]"
          />
          <p className="text-xs text-[#998884]">You can update this any time in Settings.</p>
        </div>
        <FooterNote />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-12">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EBF3ED] text-[#4D7C59] rounded-full text-xs font-semibold">
          <Stethoscope className="w-3.5 h-3.5" /> Nearby clinicians
        </div>
        <h1 className="text-2xl font-extrabold text-[#2C2220]">Your clinic matches</h1>
        <p className="text-sm text-[#6B5C58]">{profile?.symptomLabels.join(", ") || "Women's health"} near {zip}</p>
      </div>

      {profile && hasUrgentSignals(profile) && <EmergencyBanner />}

      {profile?.hintCondition === null && !profile.hasPriorDiagnosis && (
        <div className="bg-[#EBF3ED] border border-[#D5E6D8] rounded-xl p-3 text-sm text-[#356044]">
          You don&apos;t need a diagnosis to book. A primary care or community clinic can start the process.
        </div>
      )}

      {profile?.supportNeed === "Doctor visit prep" && (
        <button type="button" onClick={() => setShowVisitPrep(true)} className="w-full min-h-11 px-4 py-2.5 bg-white border border-[#D5E6D8] rounded-xl text-sm font-semibold text-[#356044] text-left">
          Prepare for a doctor visit <ArrowRight className="w-4 h-4 inline ml-1" />
        </button>
      )}

      <div className="flex flex-wrap gap-2" aria-label="Clinic filters">
        <FilterChip active={openOnly} onClick={() => setOpenOnly((value) => !value)}>Open now</FilterChip>
        <FilterChip active={listeningFirst} onClick={() => setListeningFirst((value) => !value)}>Highest listening score</FilterChip>
        <FilterChip active={womanOnly} onClick={() => setWomanOnly((value) => !value)}>Woman clinician</FilterChip>
        <FilterChip active={lowCostOnly} onClick={() => setLowCostOnly((value) => !value)}>Low cost</FilterChip>
      </div>

      {loading && <ClinicSkeletons />}

      {!loading && error && (
        <div role="alert" className="bg-white rounded-2xl p-5 border border-[#FAD4D2] space-y-3">
          <p className="font-semibold text-[#8C3E1F]">We couldn&apos;t load clinics right now.</p>
          <p className="text-sm text-[#6B5C58]">{error}</p>
          <button type="button" onClick={onRetry} className="min-h-10 px-4 py-2 bg-[#D9534F] text-white rounded-xl text-sm font-semibold">Try again</button>
        </div>
      )}

      {!loading && !error && clinics.length === 0 && (
        <div className="bg-white rounded-2xl p-5 border border-[#EFE6DC] space-y-2">
          <h2 className="font-bold text-[#2C2220]">No clinics found nearby</h2>
          <p className="text-sm text-[#6B5C58]">Try a ZIP code in a nearby area to widen your search radius.</p>
        </div>
      )}

      {!loading && !error && clinics.length > 0 && visibleClinics.length === 0 && (
        <div className="bg-white rounded-2xl p-5 border border-[#EFE6DC] text-sm text-[#6B5C58]">
          No clinics match these filters. Turn off a filter to see more results.
        </div>
      )}

      {!loading && !error && visibleClinics.map((clinic) => (
        <article key={clinic.placeId || clinic.name} className="bg-white rounded-2xl border border-[#EFE6DC] shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <h2 className="text-base font-bold text-[#2C2220] leading-snug">{clinic.name}</h2>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#6B5C58]">
                  <span className="inline-flex items-center gap-1 font-semibold text-[#8A5812]"><Star className="w-3.5 h-3.5 fill-current" />{clinic.rating == null ? "No rating" : clinic.rating.toFixed(1)}</span>
                  <span>{clinic.reviews.toLocaleString()} reviews</span>
                </div>
              </div>
              <span className="shrink-0 px-2.5 py-1 rounded-lg bg-[#EBF3ED] text-[#356044] text-xs font-bold">{clinic.fitScore} fit</span>
            </div>

            <div className="space-y-1 text-xs text-[#6B5C58]">
              <p className="flex items-start gap-1.5"><MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />{clinic.address || "Address unavailable"}</p>
              <p className="flex items-center gap-1.5"><Clock3 className="w-3.5 h-3.5 shrink-0" /><span className={isOpen(clinic) ? "text-[#356044] font-semibold" : "font-semibold text-[#8C3E1F]"}>{clinic.openState}</span><span>· {todayHours(clinic.hours)}</span></p>
            </div>

            <p className="text-xs leading-relaxed text-[#4D7C59] bg-[#EBF3ED] px-3 py-2 rounded-lg">{clinic.whyMatched}</p>

            <div className="grid grid-cols-3 gap-2">
              <a href={clinic.phone ? `tel:${clinic.phone}` : undefined} aria-disabled={!clinic.phone} className={`min-h-10 px-2 py-2 rounded-lg border border-[#E5DCD2] text-xs font-semibold flex items-center justify-center gap-1 ${clinic.phone ? "text-[#2C2220] hover:bg-[#FAF6F0]" : "text-[#998884] opacity-60"}`}><Phone className="w-3.5 h-3.5" />Call</a>
              <a href={clinic.website || undefined} target="_blank" rel="noreferrer" aria-disabled={!clinic.website} className={`min-h-10 px-2 py-2 rounded-lg border border-[#E5DCD2] text-xs font-semibold flex items-center justify-center gap-1 ${clinic.website ? "text-[#2C2220] hover:bg-[#FAF6F0]" : "text-[#998884] opacity-60"}`}><ExternalLink className="w-3.5 h-3.5" />Website</a>
              <a href={formatDirections(clinic)} target="_blank" rel="noreferrer" className="min-h-10 px-2 py-2 rounded-lg border border-[#E5DCD2] text-xs font-semibold text-[#2C2220] hover:bg-[#FAF6F0] flex items-center justify-center gap-1"><MapPin className="w-3.5 h-3.5" />Directions</a>
            </div>

            {clinic.lowCostOption && (
              <div className="rounded-lg bg-[#EBF3ED] border border-[#D5E6D8] p-3 space-y-1">
                <p className="text-xs font-semibold text-[#356044]">May offer sliding-scale or low-cost care</p>
                <p className="text-xs text-[#4D7C59]">Call to confirm cost and insurance.</p>
              </div>
            )}

            <button type="button" onClick={() => onOpenMatches(profile?.symptoms || [])} className="w-full min-h-11 px-3 py-2 bg-[#FFF0EE] hover:bg-[#FDE8E7] text-[#8C3E1F] rounded-lg text-xs font-semibold flex items-center justify-center gap-2">
              Talk to a woman who&apos;s been here <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </article>
      ))}

      <FooterNote />

      {showVisitPrep && profile && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="visit-prep-title" className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="visit-prep-title" className="text-lg font-bold text-[#2C2220]">Prepare for your visit</h2>
                <p className="text-xs text-[#6B5C58] mt-1">A few questions you can bring to a clinician.</p>
              </div>
              <button type="button" aria-label="Close visit preparation" onClick={() => setShowVisitPrep(false)} className="p-1 text-[#6B5C58]"><X className="w-5 h-5" /></button>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-sm text-[#4D4542]">
              <li>What could be causing these symptoms, and what should we consider ruling out?</li>
              <li>Are there exams or tests that may help us understand what is happening?</li>
              <li>What options are available, and when should I seek urgent care?</li>
            </ul>
            {profile.symptomLabels.length > 0 && <p className="rounded-lg bg-[#FAF6F0] p-3 text-xs text-[#6B5C58]">Symptoms to mention: {profile.symptomLabels.join(", ")}</p>}
            <button type="button" onClick={() => {
              const questions = [
                "What could be causing these symptoms, and what should we consider ruling out?",
                "Are there exams or tests that may help us understand what is happening?",
                "What options are available, and when should I seek urgent care?",
                ...(profile.symptomLabels.length ? [`Symptoms to mention: ${profile.symptomLabels.join(", ")}`] : []),
              ].join("\n");
              void navigator.clipboard?.writeText(questions).then(() => setVisitPrepCopied(true));
            }} className="min-h-10 px-4 py-2 border border-[#E5DCD2] rounded-lg text-sm font-semibold inline-flex items-center gap-2">
              <Copy className="w-4 h-4" /> {visitPrepCopied ? "Copied" : "Copy questions"}
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

function hasUrgentSignals(profile: ClinicProfile): boolean {
  const signals = new Set<SeveritySignal>(profile.severitySignals);
  return signals.has("soaking_pads_hourly")
    || signals.has("fainting")
    || signals.has("severe_pain_with_pregnancy")
    || (signals.has("dizziness_with_heavy_bleeding") && profile.symptoms.includes("heavy_bleeding"));
}

function EmergencyBanner() {
  return (
    <div role="alert" aria-live="assertive" className="bg-[#FFF0EE] border-2 border-[#D9534F] rounded-xl p-4 space-y-2">
      <p className="font-bold text-[#8C2521] flex items-center gap-2"><AlertTriangle className="w-5 h-5" />Urgent symptoms need immediate care</p>
      <p className="text-sm text-[#6B2F2B]">Please seek urgent medical care now. Go to an emergency room or urgent care. Call 911 if symptoms are severe or you may faint; do not drive yourself if dizzy.</p>
      <a href="tel:911" className="inline-flex min-h-10 items-center px-4 py-2 bg-[#D9534F] text-white rounded-lg text-sm font-bold">Call 911</a>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={`min-h-9 px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors ${active ? "bg-[#4D7C59] border-[#4D7C59] text-white" : "bg-white border-[#E5DCD2] text-[#6B5C58] hover:bg-[#EBF3ED]"}`}>
      {children}
    </button>
  );
}

function ClinicSkeletons() {
  return (
    <div className="space-y-3" aria-label="Loading clinics" aria-busy="true">
      {[0, 1, 2].map((item) => (
        <div key={item} className="bg-white rounded-2xl p-5 border border-[#EFE6DC] space-y-3 animate-pulse">
          <div className="h-4 w-2/3 bg-[#F3ECE2] rounded" />
          <div className="h-3 w-1/3 bg-[#F3ECE2] rounded" />
          <div className="h-3 w-full bg-[#F3ECE2] rounded" />
          <div className="h-10 w-full bg-[#F3ECE2] rounded-lg" />
        </div>
      ))}
    </div>
  );
}

function FooterNote() {
  return <p className="text-[11px] leading-relaxed text-[#7C6C68]">Hours and ratings come from Google. Confirm availability and appointments directly with the clinic. Scores are a rough signal based on public reviews, not a guarantee.</p>;
}
