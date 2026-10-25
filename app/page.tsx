"use client";

import React, { useRef, useState } from "react";
import { AgeGate } from "@/components/AgeGate";
import { Navbar, NavTab } from "@/components/Navbar";
import { StoryScreen } from "@/components/StoryScreen";
import { MatchesScreen, MatchConnectionState } from "@/components/MatchesScreen";
import { ChatScreen } from "@/components/ChatScreen";
import { SettingsScreen } from "@/components/SettingsScreen";
import { DoctorsScreen } from "@/components/DoctorsScreen";
import { ClinicsScreen } from "@/components/ClinicsScreen";
import { EmergencyModal } from "@/components/EmergencyModal";
import { SAMPLE_STORIES, SampleStory, MatchedStory } from "@/lib/sampleData";
import { extractSearchSymptoms } from "@/lib/symptomSearch";
import { ClinicProfile, ClinicResult, ClinicSymptom, deriveClinicProfile, scoreClinics } from "@/lib/clinics";
import { AuthGate } from "@/components/AuthGate";


export default function PetalApp() {
  const [activeTab, setActiveTab] = useState<NavTab>("story");
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [zipCode, setZipCode] = useState(() =>
    typeof window === "undefined" ? "" : window.localStorage.getItem("petal_clinic_zip") || "",
  );
  const [clinicProfile, setClinicProfile] = useState<ClinicProfile | null>(null);
  const [clinicSearch, setClinicSearch] = useState<{
    key: string;
    clinics: ClinicResult[];
    loading: boolean;
    error: string | null;
    loaded: boolean;
  }>({ key: "", clinics: [], loading: false, error: null, loaded: false });
  const clinicRequestId = useRef(0);
  const [clinicMatchSymptoms, setClinicMatchSymptoms] = useState<ClinicSymptom[]>([]);

  // User Anonymous State
  const [userAlias] = useState("Quiet Willow");
  const [anonymousId, setAnonymousId] = useState("anon_usr_7f9a2b");

  // Story & Matches State
  const [savedStory, setSavedStory] = useState<{
    ageRange: string;
    duration: string;
    condition: string;
    supportGoal: string;
    searchSymptoms: string[];
  } | null>(null);
  const [careLocation, setCareLocation] = useState("");

  const [matchResults, setMatchResults] = useState<{ id: string; score: number; why: string }[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);

  // Block list state
  const [blockedAliases, setBlockedAliases] = useState<string[]>([]);

  // Connection states for each match (missing keys count as "idle")
  const [connectionStates, setConnectionStates] = useState<MatchConnectionState>({});

  // Active chat peer
  const [activeChatPeer, setActiveChatPeer] = useState<SampleStory>(SAMPLE_STORIES[0]);
  const [clinicQuestion, setClinicQuestion] = useState<{ name: string; address?: string } | null>(null);
  const [chatInitialQuestion, setChatInitialQuestion] = useState("");
  const [isClinicInquiry, setIsClinicInquiry] = useState(false);
  const [sharedClinicExperiences, setSharedClinicExperiences] = useState<Record<string, { rating: number; experience: string }>>({});

  const runClinicSearch = async (profile: ClinicProfile, retry = false) => {
    if (!profile.zip) return;
    const key = JSON.stringify({ queries: profile.searchQueries, zip: profile.zip });
    if (!retry && clinicSearch.key === key) {
      if (clinicSearch.loading) return;
      if (!clinicSearch.error && clinicSearch.loaded) {
        setClinicSearch((previous) => ({ ...previous, clinics: scoreClinics(previous.clinics, profile) }));
        return;
      }
    }
    const requestId = ++clinicRequestId.current;

    setClinicSearch((previous) => ({
      key,
      clinics: previous.key === key ? previous.clinics : [],
      loading: true,
      error: null,
      loaded: false,
    }));
    try {
      const params = new URLSearchParams();
      profile.searchQueries.forEach((query) => params.append("specialty", query));
      params.set("zip", profile.zip);
      const response = await fetch(`/api/clinicians?${params.toString()}`);
      const data = await response.json() as { clinics?: ClinicResult[]; error?: string };
      if (!response.ok) throw new Error(data.error || "Clinic results could not be loaded.");
      if (requestId !== clinicRequestId.current) return;
      setClinicSearch({
        key,
        clinics: scoreClinics(data.clinics || [], profile),
        loading: false,
        error: null,
        loaded: true,
      });
    } catch (searchError) {
      if (requestId !== clinicRequestId.current) return;
      setClinicSearch({
        key,
        clinics: [],
        loading: false,
        error: searchError instanceof Error ? searchError.message : "Clinic results could not be loaded.",
        loaded: false,
      });
    }
  };

  const handleZipChange = (value: string) => {
    setZipCode(value);
    localStorage.setItem("petal_clinic_zip", value);
    if (!clinicProfile) return;
    const nextProfile = { ...clinicProfile, zip: value };
    setClinicProfile(nextProfile);
    if (/^\d{5}(?:-\d{4})?$/.test(value)) {
      void runClinicSearch(nextProfile);
    } else {
      clinicRequestId.current += 1;
      setClinicSearch((previous) => ({ ...previous, clinics: [], loading: false, error: null, loaded: false }));
    }
  };

  // Handle Story Submission
  const handleStorySubmitted = async (storyData: {
    cleanedStory: string;
    ageRange: string;
    duration: string;
    condition: string;
    supportGoal: string;
  }) => {
    setSavedStory({
      ...storyData,
      searchSymptoms: extractSearchSymptoms(storyData.cleanedStory),
    });
    setActiveTab("matches");
    setMatchesLoading(true);
    const profile = deriveClinicProfile(storyData.cleanedStory, zipCode, {
      duration: storyData.duration,
      ageRange: storyData.ageRange,
      supportNeed: storyData.supportGoal,
      hintCondition: storyData.condition,
    });
    setClinicProfile(profile);
    setClinicMatchSymptoms([]);
    if (/^\d{5}(?:-\d{4})?$/.test(zipCode)) void runClinicSearch(profile);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cleanedStory: storyData.cleanedStory, // never send the raw storyText
          condition: storyData.condition,
          duration: storyData.duration,
          ageRange: storyData.ageRange,
        }),
      });
      const data = await res.json();
      setMatchResults(res.ok ? data.matches : []);
    } catch {
      setMatchResults([]);
    } finally {
      setMatchesLoading(false);
    }
  };

  // Connection flow
  const handleConnectRequest = (storyId: string) => {
    setConnectionStates((prev) => ({ ...prev, [storyId]: "requested" }));
  };

  const handleSimulatePeerAccept = (storyId: string) => {
    setConnectionStates((prev) => ({ ...prev, [storyId]: "connected" }));
  };

  const handleDeclineMatch = (storyId: string) => {
    setConnectionStates((prev) => ({ ...prev, [storyId]: "declined" }));
  };

  const handleOpenChatWithMatch = (match: MatchedStory) => {
    setActiveChatPeer(match);
    setChatInitialQuestion(
      clinicQuestion
        ? `Have you visited ${clinicQuestion.name}? I'm looking for personal experiences with this clinic, if you feel comfortable sharing.`
        : ""
    );
    setActiveTab("chat");
  };

  const handleAskPeerAboutClinic = (name: string, address?: string) => {
    setClinicQuestion({ name, address });
    setIsClinicInquiry(true);
    setChatInitialQuestion(
      `Have you visited ${name}? I'm looking for personal experiences with this clinic, if you feel comfortable sharing.`
    );
  };

  const handleBackToClinics = () => {
    setClinicQuestion(null);
    setIsClinicInquiry(false);
    setChatInitialQuestion("");
  };

  const handleTabChange = (tab: NavTab) => {
    if (tab !== "care") handleBackToClinics();
    setActiveTab(tab);
  };

  const handleShareClinicExperience = (name: string, submission: { rating: number; experience: string }) => {
    setSharedClinicExperiences((previous) => ({ ...previous, [name]: submission }));
  };

  const handleOpenClinicMatches = (symptoms: ClinicSymptom[]) => {
    setClinicMatchSymptoms(symptoms);
    setActiveTab("matches");
  };

  // Block & Report actions
  const handleBlockUser = (peerAlias: string) => {
    setBlockedAliases((prev) => [...prev, peerAlias]);
    setActiveTab("matches");
  };

  const handleReportUser = (peerAlias: string, reason: string) => {
    setBlockedAliases((prev) => [...prev, peerAlias]);
    setActiveTab("matches");
  };

  // Delete all data (hard delete simulation)
  const handleDeleteAllData = () => {
    setSavedStory(null);
    setMatchResults([]);
    setClinicProfile(null);
    clinicRequestId.current += 1;
    setClinicSearch({ key: "", clinics: [], loading: false, error: null, loaded: false });
    setZipCode("");
    localStorage.removeItem("petal_clinic_zip");
    setClinicMatchSymptoms([]);
    setConnectionStates({});
    setBlockedAliases([]);
    setCareLocation("");
    setSharedClinicExperiences({});
    setAnonymousId(`anon_usr_${Math.random().toString(36).substring(2, 8)}`);
    setActiveTab("story");
  };

  // Reset Age Gate for evaluator testing
  const handleResetAgeGate = () => {
    try {
      localStorage.removeItem("petal_age_verified");
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  // Matches from the API, minus blocked peers
  const availableMatches: MatchedStory[] = matchResults
    .map((r) => {
      const s = SAMPLE_STORIES.find((x) => x.id === r.id);
      return s ? { ...s, score: r.score, why: r.why } : null;
    })
    .filter((m): m is MatchedStory => m !== null && !blockedAliases.includes(m.alias));

  return (
    <AgeGate>
      <AuthGate>
      <div className="min-h-screen bg-[#FAF6F0] flex flex-col selection:bg-[#FDE8E7] selection:text-[#9F1239]">
        {/* Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          matchesCount={availableMatches.slice(0, 3).length}
          unreadChatCount={Object.values(connectionStates).filter((s) => s === "connected").length}
          onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
        />

        <main className="flex-1 max-w-2xl w-full mx-auto px-4 pt-5">
          <div key={activeTab} className="tab-content-enter">
            {activeTab === "story" && (
              <StoryScreen
                onStorySubmitted={handleStorySubmitted}
                savedStory={savedStory}
              />
            )}

            {activeTab === "matches" && (
              <MatchesScreen
                matches={availableMatches}
                isLoading={matchesLoading}
                clinicMatchSymptoms={clinicMatchSymptoms}
                connectionStates={connectionStates}
                onConnectRequest={handleConnectRequest}
                onSimulatePeerAccept={handleSimulatePeerAccept}
                onDeclineMatch={handleDeclineMatch}
                onOpenChatWithMatch={handleOpenChatWithMatch}
              />
            )}

            {activeTab === "clinics" && (
              <ClinicsScreen
                hasStory={!!savedStory}
                profile={clinicProfile}
                clinics={clinicSearch.clinics}
                loading={clinicSearch.loading}
                error={clinicSearch.error}
                zip={zipCode}
                onZipChange={handleZipChange}
                onRetry={() => clinicProfile && void runClinicSearch(clinicProfile, true)}
                onGoToStory={() => setActiveTab("story")}
                onOpenMatches={handleOpenClinicMatches}
              />
            )}

            {activeTab === "chat" && (
              <ChatScreen
                peerAlias={activeChatPeer?.alias || "Gentle Fern"}
                userAlias={userAlias}
                initialQuestion={chatInitialQuestion}
                clinicInquiry={isClinicInquiry}
                onBlockUser={handleBlockUser}
                onReportUser={handleReportUser}
                onBackToMatches={() => setActiveTab("matches")}
              />
            )}
  

            {activeTab === "care" && (
              <DoctorsScreen
                condition={savedStory?.condition ?? ""}
                symptoms={savedStory?.searchSymptoms ?? []}
                hasStory={!!savedStory}
                initialLocation={careLocation}
                onLocationChange={setCareLocation}
                onAskPeerAboutClinic={handleAskPeerAboutClinic}
                onBackToClinics={handleBackToClinics}
                matches={availableMatches}
                connectionStates={connectionStates}
                clinicQuestion={clinicQuestion}
                sharedClinicExperience={clinicQuestion ? sharedClinicExperiences[clinicQuestion.name] ?? null : null}
                onShareClinicExperience={(submission) => clinicQuestion && handleShareClinicExperience(clinicQuestion.name, submission)}
                onConnectRequest={handleConnectRequest}
                onSimulatePeerAccept={handleSimulatePeerAccept}
                onDeclineMatch={handleDeclineMatch}
                onOpenChatWithMatch={handleOpenChatWithMatch}
              />
            )}

            {activeTab === "settings" && (
              <SettingsScreen
                onDeleteAllData={handleDeleteAllData}
                onResetAgeGate={handleResetAgeGate}
                anonymousId={anonymousId}
                hasStory={!!savedStory}
                zipCode={zipCode}
                onZipChange={handleZipChange}
              />
            )}
          </div>
        </main>

        <EmergencyModal
          isOpen={isEmergencyModalOpen}
          onClose={() => setIsEmergencyModalOpen(false)}
        />
      </div>
       </AuthGate>
    </AgeGate>
  );
}
