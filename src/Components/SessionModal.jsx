"use client";
import React, { useState } from "react";
import Image from "next/image";
import { createSession } from "@/lib/actions";
import Cards from "./Cards";

export default function SessionModal({ sessionName }) {
  const [showModal, setShowModal] = useState(false);
  const [newSession, setNewSession] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateSession = async () => {
    if (!newSession.trim()) {
      setError("Session name cannot be empty.");
      return;
    }

    setLoading(true);
    setError("");

    const response = await createSession(newSession);

    if (response.success) {
      window.location.reload(); // Refresh to reflect changes
    } else {
      setError(response.message || "Failed to create session.");
    }

    setLoading(false);
  };

  return (
    <>
      <div className="relative flex items-center justify-center">
        <button className="absolute top-2 right-2" onClick={() => setShowModal(true)}>
          <Image src={"/more.png"} alt="More" width={24} height={24} />
        </button>
        <Cards
          color="#E6C5AD"
          type="Admin"
          data="N/A" // No need for data in this modal
          session={sessionName}
        />
      </div>

      {/* SESSION MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] md:w-[50%] lg:w-[40%]">
            <h2 className="text-lg font-semibold mb-4">Create New Session</h2>
            <input
              type="text"
              placeholder="Enter Session Name (e.g., 2025/2026)"
              value={newSession}
              onChange={(e) => setNewSession(e.target.value)}
              className="w-full border p-2 rounded-md"
            />
            {error && <p className="text-red-500 mt-2">{error}</p>}
            <div className="flex justify-end mt-4">
              <button className="bg-gray-300 px-4 py-2 rounded-md mr-2" onClick={() => setShowModal(false)}>
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
    </>
  );
}
