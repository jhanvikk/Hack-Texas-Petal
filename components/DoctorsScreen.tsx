"use client";

import React, { FormEvent, useEffect, useRef, useState } from "react";
import { ExternalLink, LoaderCircle, MapPin, MessageCircle, Navigation, Phone, Search, Star, Stethoscope } from "lucide-react";
import { MatchesScreen, MatchConnectionState } from "@/components/MatchesScreen";
import { MatchedStory } from "@/lib/sampleData";

interface Provider {
  title: string;
  link: string;
  source?: string;
  address?: string;
  phone?: string;
  rating?: number;
  reviews?: number;
  snippet?: string;
}

interface DoctorsScreenProps {
  condition: string;
  symptoms: string[];
  hasStory: boolean;
  initialLocation: string;
  onLocationChange: (location: string) => void;
  onAskPeerAboutClinic: (clinicName: string, clinicAddress?: string) => void;
  onBackToClinics: () => void;
  matches: MatchedStory[];
  connectionStates: MatchConnectionState;
  clinicQuestion: { name: string; address?: string } | null;
  sharedClinicExperience: { rating: number; experience: string } | null;
  onShareClinicExperience: (submission: { rating: number; experience: string }) => void;
  onConnectRequest: (storyId: string) => void;
  onSimulatePeerAccept: (storyId: string) => void;
  onDeclineMatch: (storyId: string) => void;
  onOpenChatWithMatch: (match: MatchedStory) => void;
}

async function searchProviders(location: string, condition: string, symptoms: string[]) {
  const response = await fetch("/api/providers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ location, condition, symptoms }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Provider search could not be completed.");
  }
  return (data.providers ?? []) as Provider[];
}

export function DoctorsScreen({
  condition,
  symptoms,
  hasStory,
  initialLocation,
  onLocationChange,
  onAskPeerAboutClinic,
  onBackToClinics,
  matches,
  connectionStates,
  clinicQuestion,
  sharedClinicExperience,
  onShareClinicExperience,
  onConnectRequest,
  onSimulatePeerAccept,
  onDeclineMatch,
  onOpenChatWithMatch,
}: DoctorsScreenProps) {
  const [location, setLocation] = useState(initialLocation);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchRevision, setSearchRevision] = useState(0);
  const [showClinicPeers, setShowClinicPeers] = useState(false);
  const manualLocation = useRef<string | null>(null);
  const symptomKey = symptoms.join("|");
  const searchCategories = [
    ...(condition && condition !== "Exploring / Unsure" ? [condition] : []),
    ...symptoms,
  ];
  const hasSearchCategories = searchCategories.length > 0;

  useEffect(() => {
    const searchLocation = manualLocation.current ?? initialLocation;
    manualLocation.current = null;
    if (!searchLocation || (!hasStory && searchRevision === 0) || !hasSearchCategories) return;

    let isCurrent = true;
    const searchSymptoms = symptomKey ? symptomKey.split("|") : [];
    setIsLoading(true);
    setError("");
    setHasSearched(true);

    void searchProviders(searchLocation, condition, searchSymptoms)
      .then((results) => {
        if (isCurrent) setProviders(results);
      })
      .catch((searchError: unknown) => {
        if (!isCurrent) return;
        setProviders([]);
        setError(searchError instanceof Error ? searchError.message : "Provider search could not be completed.");
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [condition, hasSearchCategories, hasStory, initialLocation, searchRevision, symptomKey]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const searchLocation = location.trim();
    if (!hasSearchCategories) {
      setError("Add a recognized condition or symptom in My Story to search for matching care.");
      return;
    }
    if (!searchLocation) {
      setError("Enter a city, state, or ZIP code to search.");
      return;
    }

    manualLocation.current = searchLocation;
    onLocationChange(searchLocation);
    setSearchRevision((revision) => revision + 1);
  };

  if (showClinicPeers && clinicQuestion) {
    return (
      <MatchesScreen
        matches={matches}
        connectionStates={connectionStates}
        clinicQuestion={clinicQuestion}
        sharedClinicExperience={sharedClinicExperience}
        onShareClinicExperience={onShareClinicExperience}
        onConnectRequest={onConnectRequest}
        onSimulatePeerAccept={onSimulatePeerAccept}
        onDeclineMatch={onDeclineMatch}
        onOpenChatWithMatch={onOpenChatWithMatch}
        onBackToClinics={() => {
          setShowClinicPeers(false);
          onBackToClinics();
        }}
      />
    );
  }

  return (
    <div className="space-y-5 pb-12">
      <section className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C54541]">
          <Stethoscope className="h-4 w-4" />
          Local care directory
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2C2220]">
          Reproductive health care near you
        </h1>
        <p className="text-sm leading-relaxed text-[#6B5C58]">
          {hasStory
            ? "Searches use your selected condition and symptom matches from My Story. Enter your city or ZIP code to find nearby care."
            : "Search for women’s health doctors and clinics by city or ZIP code. Add a story to personalize results to your symptoms."}
        </p>
      </section>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
        <label className="relative flex-1">
          <span className="sr-only">City, state, or ZIP code</span>
          <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7C6C68]" />
          <input
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="City, state, or ZIP code"
            autoComplete="postal-code"
            maxLength={120}
            className="min-h-12 w-full rounded-xl border border-[#E5DCD2] bg-white pl-10 pr-3 text-sm text-[#2C2220] placeholder:text-[#998884] focus:outline-none focus:ring-2 focus:ring-[#4D7C59]"
          />
        </label>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#b8757e] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#c66974] disabled:cursor-wait disabled:opacity-60"
        >
          <Search className="h-4 w-4" />
          {isLoading ? "Searching..." : "Find care"}
        </button>
      </form>

      <section aria-live="polite" className="space-y-3 rounded-2xl border border-[#E5DCD2] bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-[#2C2220]">
              {isLoading ? "Searching clinics for" : hasSearched && !error ? "Search categories used" : "Search categories"}
            </h2>
            <p className="mt-0.5 text-xs text-[#6B5C58]">
              These symptom matches come from your My Story text; your selected condition is included when applicable.
            </p>
          </div>
          {isLoading && (
            <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-[#4D7C59]">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Searching
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {searchCategories.length > 0 ? searchCategories.map((category) => (
            <span
              key={category}
              className="inline-flex min-h-8 items-center rounded-full border border-[#BFD7C3] bg-[#EBF3ED] px-3 text-xs font-semibold text-[#3D6647]"
            >
              {category}
            </span>
          )) : (
            <p className="text-xs leading-relaxed text-[#6B5C58]">
              No specific condition or symptom was matched in your story. Update My Story with a condition or symptom to search for relevant providers.
            </p>
          )}
        </div>
      </section>

      <div className="flex items-start gap-2.5 rounded-xl border border-[#FAD4D2] bg-[#FDE8E7] p-3.5 text-xs leading-relaxed text-[#C54541]">
        <Stethoscope className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Only your location, selected condition, and matching symptom labels are sent to SerpAPI and Google; your story text is not sent. Listings do not confirm services, appointments, insurance, or credentials. Petal does not verify providers.
        </p>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-[#FAD4D2] bg-[#FFF5F5] p-4 text-sm text-[#991B1B]">
          {error}
        </div>
      )}

      {hasSearchCategories && hasSearched && !isLoading && !error && providers.length === 0 && (
        <div className="rounded-xl border border-[#EFE6DC] bg-white p-5 text-sm text-[#6B5C58]">
          No provider listings were found. Try a nearby city or ZIP code.
        </div>
      )}

      {hasSearchCategories && providers.length > 0 && (
        <section aria-label="Provider search results" className="space-y-3">
          <h2 className="text-sm font-bold text-[#2C2220]">
            Results near {location.trim()}
          </h2>
          {providers.map((provider, index) => (
            <article
              key={`${provider.title}-${index}`}
              className="rounded-2xl border border-[#EFE6DC] bg-white p-4 sm:p-5 shadow-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1.5">
                  <h3 className="font-bold text-[#2C2220]">{provider.title}</h3>
                  {provider.source && <p className="text-xs text-[#7C6C68]">{provider.source}</p>}
                </div>
                {provider.rating !== undefined && (
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#8A5812]">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {provider.rating.toFixed(1)}
                    {provider.reviews !== undefined && (
                      <span className="font-normal text-[#7C6C68]">({provider.reviews})</span>
                    )}
                  </span>
                )}
              </div>

              {provider.address && (
                <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-[#6B5C58]">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {provider.address}
                </p>
              )}
              {provider.snippet && (
                <p className="mt-3 text-sm leading-relaxed text-[#6B5C58]">{provider.snippet}</p>
              )}

              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#F3ECE2] pt-3 sm:grid-cols-3">
                {provider.phone ? (
                  <a
                    href={`tel:${provider.phone.replace(/[^\d+]/g, "")}`}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#D5E6D8] bg-[#EBF3ED] px-3 py-2 text-xs font-semibold text-[#3D6647] transition-colors hover:bg-[#DDEBDD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D7C59]"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Call
                  </a>
                ) : (
                  <span className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-[#E5DCD2] bg-[#FAF6F0] px-3 py-2 text-xs font-medium text-[#998884]">
                    <Phone className="h-3.5 w-3.5" />
                    Phone not listed
                  </span>
                )}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    [provider.title, provider.address, location.trim()].filter(Boolean).join(", ")
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#E5DCD2] bg-white px-3 py-2 text-xs font-semibold text-[#3D6647] transition-colors hover:bg-[#FAF6F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D7C59]"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  Directions
                </a>
                <a
                  href={provider.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#E5DCD2] bg-white px-3 py-2 text-xs font-semibold text-[#3D6647] transition-colors hover:bg-[#FAF6F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D7C59]"
                >
                  Website / listing
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    onAskPeerAboutClinic(provider.title, provider.address);
                    setShowClinicPeers(true);
                  }}
                  className="col-span-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#FAD4D2] bg-[#FFF5F5] px-3 py-2 text-xs font-semibold text-[#A83C39] transition-colors hover:bg-[#FDE8E7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9534F] sm:col-span-3"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Ask a woman who’s been here
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}