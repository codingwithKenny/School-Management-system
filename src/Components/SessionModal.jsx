"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { createSession, updateTermStatus } from "@/lib/actions";

export default function SessionModal({ sessionName, terms, sessionId }) {
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showTermModal, setShowTermModal] = useState(false);
  const [newSession, setNewSession] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [updatingTerm, setUpdatingTerm] = useState(false);

  useEffect(() => {
    // Set the default selected term to the first term marked as isCurrent
    if (terms?.length > 0) {
      const currentTerm = terms.find(term => term.isCurrent) || terms[0];
      setSelectedTerm(currentTerm);
    }
  }, [terms]);

  const handleCreateSession = async () => {
    if (!newSession.trim()) {
      setError("Session name cannot be empty.");
      return;
    }

    setLoading(true);
    setError("");

    // Step 1: Create session
    const response = await createSession(newSession);

    if (!response.success) {
      setError(response.message || "Failed to create session.");
      setLoading(false);
      return;
    }

    // Step 2: Reload page to reflect new session
    setLoading(false);
    window.location.reload();
  };

  const handleTermChange = async (e) => {
    const termId = e.target.value;
    if (!termId) return;

    setUpdatingTerm(true);
    const response = await updateTermStatus(termId, sessionId);

    if (response.success) {
      setSelectedTerm(terms.find(t => t.id === termId));
      setShowTermModal(false);
    } else {
      alert(response.message);
    }

    setUpdatingTerm(false);
  };

  return (
    <>
      <div className="bg-[#E6C5AD] rounded-2xl p-4">
        {/* Session Info */}
        <div className="flex items-center justify-between">
          <button className="bg-white text-green-600 text-sm p-2 font-bold rounded-lg shadow-md">
            {sessionName}
          </button>
          <button onClick={() => setShowSessionModal(true)} className="p-2 rounded-md">
            <Image src="/more.png" alt="More" width={24} height={24} />
          </button>
        </div>

        {/* Selected Term */}
        <div className="flex items-center justify-between mt-2">
          <button className="bg-white text-green-600 text-sm p-2 font-bold rounded-lg shadow-md">
            {selectedTerm ? selectedTerm.name : "Select Term"}
          </button>
          <button onClick={() => setShowTermModal(true)} className="p-2 rounded-md">
            <Image src="/more.png" alt="More" width={24} height={24} />
          </button>
        </div>
      </div>

      {/* Create Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] sm:w-[50%] lg:w-[40%]">
            <h2 className="text-lg font-semibold mb-4">Create New Session</h2>
            <input
              type="text"
              placeholder="Enter Session Name (e.g., 2025/2026)"
              value={newSession}
              onChange={(e) => setNewSession(e.target.value)}
              className="w-full border p-2 rounded-md mb-4"
            />
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="flex justify-end gap-2">
              <button className="bg-gray-300 px-4 py-2 rounded-md" onClick={() => setShowSessionModal(false)}>
                Cancel
              </button>
              <button
                className={`bg-blue-600 text-white px-4 py-2 rounded-md ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={handleCreateSession}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Term Selection Modal */}
      {showTermModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] sm:w-[50%] lg:w-[40%]">
            <h2 className="text-lg font-semibold mb-4">Select Term</h2>
            <select
              className="w-full border p-2 rounded-md mb-4"
              value={selectedTerm?.id || ""}
              onChange={handleTermChange}
              disabled={updatingTerm}
            >
              <option value="" disabled>
                Select a term
              </option>
              {terms?.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button className="bg-gray-300 px-4 py-2 rounded-md" onClick={() => setShowTermModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
