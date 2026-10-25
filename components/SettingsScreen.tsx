"use client";

import React, { useState } from "react";
import { ShieldCheck, Trash2, AlertTriangle, Lock, EyeOff, RefreshCw, CheckCircle2, LogOut } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseClient";

interface SettingsScreenProps {
  onDeleteAllData: () => void;
  onResetAgeGate: () => void;
  anonymousId?: string;
  hasStory: boolean;
  zipCode: string;
  onZipChange: (zip: string) => void;
}

export function SettingsScreen({
  onDeleteAllData,
  onResetAgeGate,
  anonymousId = "anon_petal_839a",
  hasStory,
  zipCode,
  onZipChange,
}: SettingsScreenProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmedTyped, setConfirmedTyped] = useState("");
  const [deletedNotice] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleDeleteConfirmed = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      const { data } = await supabaseBrowser.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("You're not logged in.");

      const res = await fetch("/api/delete-account", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Couldn't delete your account. Please try again.");

      onDeleteAllData(); // clears story, matches, etc. in page.tsx
      await supabaseBrowser.auth.signOut();
      window.location.reload(); // back to the login screen
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Something went wrong.");
      setDeleting(false);
    }
  };

  const handleLogOut = async () => {
    await supabaseBrowser.auth.signOut();
    window.location.reload(); // clears the story and matches held in page.tsx state
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#EFE6DC] shadow-xs space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FDE8E7] text-[#C54541] rounded-full text-xs font-semibold">
          <Lock className="w-3.5 h-3.5" />
          Privacy & Data Control
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2220] tracking-tight">
          Your Privacy Guarantees
        </h1>
        <p className="text-sm text-[#6B5C58] leading-relaxed">
          Petal is designed from the ground up as a zero-surveillance peer sanctuary. Here is exactly what we store and how you can permanently erase it.
        </p>
      </div>

      {/* Deleted Confirmation Banner */}
      {deletedNotice && (
        <div className="bg-[#EBF3ED] border border-[#A7D7B0] rounded-2xl p-4 text-[#2D663B] text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#34A853] shrink-0" />
          <p className="font-semibold">
            All your data has been completely and permanently erased.
          </p>
        </div>
      )}

      <section className="bg-white rounded-2xl p-5 border border-[#EFE6DC] space-y-2">
        <label htmlFor="settings-zip" className="block text-sm font-bold text-[#2C2220]">Clinic search ZIP code</label>
        <p className="text-xs leading-relaxed text-[#6B5C58]">This ZIP is saved on this device. Clinic searches send only your ZIP and a specialty, never your story.</p>
        <input
          id="settings-zip"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={10}
          value={zipCode}
          onChange={(event) => onZipChange(event.target.value)}
          placeholder="e.g. 78701"
          className="w-full min-h-11 px-3 rounded-xl bg-[#FAF6F0] border border-[#E5DCD2] text-sm focus:outline-none focus:ring-2 focus:ring-[#D9534F]"
        />
      </section>

      {/* Plain Words Privacy Breakdown */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#EFE6DC] shadow-xs space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-[#2C2220] flex items-center gap-2">
          <EyeOff className="w-5 h-5 text-[#D9534F]" />
          What Petal Stores
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
          {/* Stored */}
          <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-[#EFE6DC] space-y-2">
            <p className="font-bold text-[#2C2220] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4D7C59]" /> Stored securely:
            </p>
            <ul className="space-y-1 text-[#6B5C58] list-disc list-inside text-xs leading-relaxed">
              <li>Cleaned story (names, emails, phones stripped).</li>
              <li>Tappable tags (condition, age band, goals).</li>
              <li>ZIP code for nearby clinic searches.</li>
              <li>Mathematical embedding for finding matches.</li>
              <li>Active chat messages between mutual peers.</li>
            </ul>
          </div>

          {/* Never Stored */}
          <div className="p-4 bg-[#FFF5F5] rounded-2xl border border-[#FAD4D2] space-y-2">
            <p className="font-bold text-[#991B1B] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#DC2626]" /> Never stored or tracked:
            </p>
            <ul className="space-y-1 text-[#7F1D1D] list-disc list-inside text-xs leading-relaxed">
              <li>No real names, emails, or phone numbers.</li>
              <li>No IP addresses or background location tracking.</li>
              <li>No third-party analytics or ad trackers.</li>
              <li>No remote fonts contacting outside servers.</li>
            </ul>
          </div>
        </div>

        {/* Current Session Info */}
        <div className="pt-2 border-t border-[#F3ECE2] flex flex-wrap items-center justify-between text-xs text-[#7C6C68] gap-2">
          <span>
            Current Anonymous Session: <code className="bg-[#FAF6F0] px-2 py-0.5 rounded border border-[#E5DCD2] text-[#2C2220]">{anonymousId}</code>
          </span>
          <span className="flex items-center gap-1 text-[#4D7C59] font-medium">
            <ShieldCheck className="w-4 h-4" /> End-to-End Anonymity
          </span>
        </div>
      </div>

      {/* Log out */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#EFE6DC] shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#2C2220]">Log out</h2>
          <p className="text-xs text-[#6B5C58]">Sign out of Petal on this device.</p>
        </div>
        <button
          type="button"
          onClick={handleLogOut}
          className="min-h-[48px] px-5 py-3 bg-[#FAF6F0] hover:bg-[#F3ECE2] border border-[#E5DCD2] text-[#2C2220] font-semibold rounded-2xl text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </button>
      </div>

      {/* Delete My Data Action Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#FCA5A5] shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#991B1B]">
              Permanently Delete My Data
            </h2>
            <p className="text-xs text-[#7F1D1D]">
              Hard-delete your story, embeddings, matches, messages, and anonymous account.
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#6B5C58] leading-relaxed">
          If you ever want to leave Petal, you have full control. Clicking below immediately purges everything associated with your anonymous session from the database. This action is irreversible.
        </p>

        <button
          type="button"
          onClick={() => setShowConfirmModal(true)}
          className="min-h-[48px] px-5 py-3 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold rounded-2xl text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete My Data Permanently</span>
        </button>
      </div>

      {/* Demo helper: Re-test Age Gate */}
      <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-[#EFE6DC] flex items-center justify-between flex-wrap gap-2 text-xs text-[#7C6C68]">
        <span>Hackathon Evaluator Tool: Want to re-test the 18+ Age Gate?</span>
        <button
          type="button"
          onClick={onResetAgeGate}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-[#E5DCD2] hover:bg-[#F3ECE2] text-[#2C2220] rounded-xl font-medium transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          Reset Age Gate
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-4 shadow-xl border border-[#FCA5A5]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#991B1B]">
                  Are you absolutely sure?
                </h3>
                <p className="text-xs text-[#7F1D1D]">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#6B5C58] leading-relaxed">
              We will immediately delete your story, tags, vector embeddings, active chats, block lists, and anonymous account from our servers.
            </p>

            <div className="space-y-1.5">
              <label htmlFor="confirmInput" className="block text-xs font-semibold text-[#2C2220]">
                To confirm, type <span className="font-bold text-[#DC2626]">DELETE</span> below:
              </label>
              <input
                id="confirmInput"
                type="text"
                value={confirmedTyped}
                onChange={(e) => setConfirmedTyped(e.target.value)}
                placeholder="DELETE"
                className="w-full p-3 rounded-xl bg-[#FAF6F0] border border-[#E5DCD2] text-sm text-[#2C2220] focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
              />
            </div>

            {deleteError && (
              <p role="alert" className="text-xs text-[#991B1B] bg-[#FEE2E2] rounded-xl px-3 py-2">
                {deleteError}
              </p>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                disabled={confirmedTyped.trim().toUpperCase() !== "DELETE" || deleting}
                onClick={handleDeleteConfirmed}
                className="w-full py-3 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
              >
                {deleting ? "Deleting..." : "Yes, Permanently Delete All Data"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmedTyped("");
                  setDeleteError("");
                }}
                className="w-full sm:w-auto py-3 px-4 text-xs font-medium text-[#6B5C58] hover:text-[#2C2220] text-center cursor-pointer"
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
