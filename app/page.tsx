"use client";

import React, { useState } from "react";
import { AgeGate } from "@/components/AgeGate";
import { Navbar, NavTab } from "@/components/Navbar";
import { StoryScreen } from "@/components/StoryScreen";
import { MatchesScreen, MatchConnectionState } from "@/components/MatchesScreen";
import { ChatScreen } from "@/components/ChatScreen";
import { SettingsScreen } from "@/components/SettingsScreen";
import { DoctorsScreen } from "@/components/DoctorsScreen";
import { EmergencyModal } from "@/components/EmergencyModal";
import { SAMPLE_STORIES, SampleStory, MatchedStory } from "@/lib/sampleData";
import { extractSearchSymptoms } from "@/lib/symptomSearch";

export default function PetalApp() {
  const [activeTab, setActiveTab] = useState<NavTab>("story");
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  // User Anonymous State
  const [userAlias] = useState("Quiet Willow");
  const [anonymousId, setAnonymousId] = useState("anon_usr_7f9a2b");

  // Story & Matches State
  const [savedStory, setSavedStory] = useState<{
    storyText: string;
    cleanedStory: string;
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

  // Handle Story Submission
  const handleStorySubmitted = async (storyData: {
    storyText: string;
    cleanedStory: string;
    ageRange: string;
    duration: string;
    condition: string;
    supportGoal: string;
    tags: string[];
  }) => {
    setSavedStory({
      ...storyData,
      searchSymptoms: extractSearchSymptoms(storyData.cleanedStory),
    });
    setActiveTab("matches");
    setMatchesLoading(true);
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
      <div className="min-h-screen bg-[#FAF6F0] flex flex-col selection:bg-[#FDE8E7] selection:text-[#9F1239]">
        <Navbar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          matchesCount={availableMatches.slice(0, 3).length}
          unreadChatCount={Object.values(connectionStates).filter((s) => s === "connected").length}
          onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
        />

        <main className="flex-1 max-w-2xl w-full mx-auto px-4 pt-5">
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
              connectionStates={connectionStates}
              onConnectRequest={handleConnectRequest}
              onSimulatePeerAccept={handleSimulatePeerAccept}
              onDeclineMatch={handleDeclineMatch}
              onOpenChatWithMatch={handleOpenChatWithMatch}
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
            />
          )}
        </main>

        <EmergencyModal
          isOpen={isEmergencyModalOpen}
          onClose={() => setIsEmergencyModalOpen(false)}
        />
      </div>
    </AgeGate>
  );
}
