"use client";

import { updateSession } from "@/lib/actions";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const UpdateSessionCard = ({ session }) => {
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [newSession, setNewSession] = useState(""); // Fixed missing state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!newSession.trim()) {
      setError("Session name cannot be empty.");
      return;
    }
   const  sessionId= session.id


    setLoading(true);
    const response = await updateSession(sessionId,newSession);
    console.log(sessionId, newSession);
    
    if(response.success) {
        router.refresh()
    }
    console.log(response)
    if (!response.success) {
      setError(response.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setShowSessionModal(false);
    setNewSession("");
  };

  return (
    <div className="mt-10">
      <h2 className="text-lg font-semibold text-gray-800">Current Session</h2>

      <div className="flex flex-wrap gap-10 items-center justify-center bg-white p-4 rounded-2xl shadow-lg w-80 max-w-full">
        <div className="flex items-center justify-between w-full">
          <button className="bg-white text-green-600 text-sm p-2 font-bold rounded-lg shadow-md">
            {session?.name} 
          </button>

          <button
            onClick={() => setShowSessionModal(true)}
            className="p-2 rounded-md bg-blue-200 hover:bg-blue-300 transition"
          >
            <Image src="/update.png" alt="update" width={24} height={24} />
          </button>
        </div>
      </div>

      {/* Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] sm:w-[50%] lg:w-[40%] shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Update Session</h2>
            <input
              type="text"
              placeholder="Enter Session Name (e.g., 2025/2026)"
              defaultValue={session?.name}
              onChange={(e) => setNewSession(e.target.value)}
              className="w-full border p-2 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400 transition"
                onClick={() => setShowSessionModal(false)}
              >
                Cancel
              </button>
              <button
                className={`bg-blue-600 text-white px-4 py-2 rounded-md transition ${
                  loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
                }`}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateSessionCard;
