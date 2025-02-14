"use client"; // Indicating it's a client-side component

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { createSession } from "@/lib/actions";

export default function SessionModal({ sessionName, terms }) {
  const [showModal, setShowModal] = useState(false);
  const [newSession, setNewSession] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");

  // Load the selected term from localStorage on component mount
  useEffect(() => {
    const savedTerm = localStorage.getItem("selectedTerm");
    if (savedTerm) {
      setSelectedTerm(savedTerm);
    }
  }, []);

  const handleCreateSession = async () => {
    if (!newSession.trim()) {
      setError("Session name cannot be empty.");
      return;
    }

    if (!selectedTerm) {
      setError("Please select a term.");
      return;
    }

    setLoading(true);
    setError("");

    const response = await createSession(newSession, selectedTerm);

    if (response.success) {
      // Refresh the terms to reflect the new session's terms
      // You can update the `terms` or trigger a re-fetch here based on your app flow
      window.location.reload(); // Refresh to reflect changes
    } else {
      setError(response.message || "Failed to create session.");
    }

    setLoading(false);
  };

  const handleTermChange = (e) => {
    const termId = e.target.value;
    setSelectedTerm(termId);
    localStorage.setItem("selectedTerm", termId); // Save selected term in localStorage
  };

  return (
    <>
      <div className="bg-[#E6C5AD] rounded-2xl p-4">
        <div className="flex items-center justify-around">
          <button className="bg-white text-green-600 text-sm p-2 font-bold rounded-lg shadow-md">
            {sessionName}
          </button>
          <button onClick={() => setShowModal(true)} className="p-2 rounded-md">
            <Image src="/more.png" alt="More" width={24} height={24} />
          </button>
        </div>

        {/* Term selection */}
        <div className="mt-4 flex w-20">
          <select
            id="termSelect"
            className="text-sm p-2 border rounded-md w-full sm:w-auto border-[#E6C5AD]"
            value={selectedTerm}
            onChange={handleTermChange} // Handle term selection change
            aria-label="Select term"
          >
            <option value="" disabled>
              Select a term
            </option>
            {terms?.map((term, index) => (
              <option key={index} value={term.id}>
                {term.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Session Modal */}
      {showModal && (
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
              <button
                className="bg-gray-300 px-4 py-2 rounded-md"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className={`bg-blue-600 text-white px-4 py-2 rounded-md ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={handleCreateSession}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
