"use client";

import React, { useState } from "react";
import { AgeGate } from "@/components/AgeGate";
import { Navbar, NavTab } from "@/components/Navbar";
import { StoryScreen } from "@/components/StoryScreen";
import { MatchesScreen, MatchConnectionState } from "@/components/MatchesScreen";
import { ChatScreen } from "@/components/ChatScreen";
import { SettingsScreen } from "@/components/SettingsScreen";
import { EmergencyModal } from "@/components/EmergencyModal";
import { SAMPLE_STORIES, SampleStory } from "@/lib/sampleData";

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
  } | null>(null);

  // Block list state
  const [blockedAliases, setBlockedAliases] = useState<string[]>([]);

  // Connection states for each match
  const [connectionStates, setConnectionStates] = useState<MatchConnectionState>({
    "sample-1": "connected", // Pre-connected for immediate demo testing if desired!
    "sample-2": "idle",
    "sample-3": "idle",
  });

  // Active chat peer
  const [activeChatPeer, setActiveChatPeer] = useState<SampleStory>(SAMPLE_STORIES[0]);

  // Handle Story Submission
  const handleStorySubmitted = (storyData: {
    storyText: string;
    cleanedStory: string;
    ageRange: string;
    duration: string;
    condition: string;
    supportGoal: string;
    tags: string[];
  }) => {
    setSavedStory(storyData);
    setActiveTab("matches");
  };

  // Connection flow
  const handleConnectRequest = (storyId: string) => {
    setConnectionStates((prev) => ({
      ...prev,
      [storyId]: "requested",
    }));
  };

  const handleSimulatePeerAccept = (storyId: string) => {
    setConnectionStates((prev) => ({
      ...prev,
      [storyId]: "connected",
    }));
  };

  const handleDeclineMatch = (storyId: string) => {
    setConnectionStates((prev) => ({
      ...prev,
      [storyId]: "declined",
    }));
  };

  const handleOpenChatWithMatch = (match: SampleStory) => {
    setActiveChatPeer(match);
    setActiveTab("chat");
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
    setConnectionStates({
      "sample-1": "idle",
      "sample-2": "idle",
      "sample-3": "idle",
    });
    setBlockedAliases([]);
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

  // Filter out blocked peers
  const availableMatches = SAMPLE_STORIES.filter(
    (story) => !blockedAliases.includes(story.alias)
  );

  return (
    <AgeGate>
      <div className="min-h-screen bg-[#e6abb2] flex flex-col selection:bg-[#FDE8E7] selection:text-[#9F1239]">
        {/* Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          matchesCount={availableMatches.slice(0, 3).length}
          unreadChatCount={connectionStates["sample-1"] === "connected" ? 1 : 0}
          onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
        />

        {/* Main Content Area */}
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
              onBlockUser={handleBlockUser}
              onReportUser={handleReportUser}
              onBackToMatches={() => setActiveTab("matches")}
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

        {/* Global Emergency 988 Modal */}
        <EmergencyModal
          isOpen={isEmergencyModalOpen}
          onClose={() => setIsEmergencyModalOpen(false)}
        />
      </div>
    </AgeGate>
  );
}
