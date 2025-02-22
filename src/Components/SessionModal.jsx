"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { createSession, updateTermStatus } from "@/lib/actions";
import { useRouter } from "next/navigation"; // Change from next/router to next/navigation

export default function SessionModal({ sessionName, terms, sessionId, currentTerm, role }) {
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showTermModal, setShowTermModal] = useState(false);
  const [newSession, setNewSession] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTerm, setSelectedTerm] = useState(currentTerm || null);
  const [updatingTerm, setUpdatingTerm] = useState(false);
  const router = useRouter();

  // Set default selected term to current term
  useEffect(() => {
    if (currentTerm) {
      setSelectedTerm(currentTerm);
    }
  }, [currentTerm, router]);

  const handleCreateSession = async () => {
    if (!newSession.trim()) {
      setError("Session name cannot be empty.");
      return;
    }
    setLoading(true);
    setError("");

    const response = await createSession(newSession);

    if (!response.success) {
      setError(response.message || "Failed to create session.");
      setLoading(false);
      return;
    }

    setLoading(false);
    setShowSessionModal(false); 

router.refresh()  };

  const handleTermChange = async (e) => {
    let termId = e.target.value;
    if (!termId) return;

    if (!isNaN(termId)) {
      termId = Number(termId);}

    

    setUpdatingTerm(true);
    const response = await updateTermStatus(termId, sessionId);
    console.log(sessionId, termId);

    if (response.success) {
      const updatedTerm = terms.find((t) => t.id === termId);
      setSelectedTerm(updatedTerm);
      setShowTermModal(false);
    } else {
      alert(response.message);
    }
    setUpdatingTerm(false);
router.refresh();
    
  };

  return (
    <>
      <div className="bg-[#D598CF]  p-4">
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
          <button className="bg-white text-green-600 text-sm p-1 font-bold rounded-lg shadow-md">
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
