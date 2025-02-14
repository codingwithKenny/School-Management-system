"use client";
import React, { useState } from "react";
import ResultDisplay from "./ResultDisplay";

const StudentResultView = ({ sessions, results, studentInfo }) => {
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);

  console.log("Sessions Data:", sessions);
  console.log("Results Data:", results);

  // ✅ Retrieve session, grade, and class data
  const sessionData = sessions?.find((session) => session.id === selectedSession) || null;
  const studentGradeData = sessionData?.grades?.find((grade) => grade.id === studentInfo?.grade?.id) || null;
  const studentClassData = studentGradeData?.classes?.find((cls) => cls.id === studentInfo?.class?.id) || null;
  const terms = sessionData?.terms || [];

  // ✅ Extract names for display
  const sessionName = sessionData?.name || "Session Not Found";
  const gradeName = studentGradeData?.name || "Grade Not Found";
  const className = studentClassData?.name || "Class Not Found";

  console.log(`Selected: Session: ${sessionName}, Grade: ${gradeName}, Class: ${className}`);

  // ✅ Filter results dynamically
  const filteredResults = results.filter(
    (result) =>
      result.sessionId === selectedSession &&
      result.gradeId === studentGradeData?.id &&
      result.classId === studentClassData?.id &&
      result.termId === selectedTerm
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-xl font-bold text-center mb-6 text-gray-800">📄 Student Result Viewer</h2>

      {/* FILTER SELECTION CONTAINER */}
      <div className="bg-white shadow-md rounded-lg p-6 flex flex-wrap gap-6 justify-between items-center">
        
        {/* SESSION SELECTION */}
        <div className="w-full sm:w-auto">
          <label className="block text-sm font-semibold text-gray-700">Select Session</label>
          <select
            className="block w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={selectedSession || ""}
            onChange={(e) => {
              const sessionId = parseInt(e.target.value, 10);
              setSelectedSession(sessionId);
              setSelectedTerm(null);
            }}
          >
            <option value="">-- Select Session --</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.name}
              </option>
            ))}
          </select>
        </div>

        {/* DISPLAY STUDENT'S GRADE */}
        {studentGradeData && (
          <div className="w-full sm:w-auto">
            <p className="text-sm font-semibold text-gray-700">Grade:</p>
            <p className="text-lg font-bold bg-gray-50 shadow-sm rounded p-2 border">{gradeName}</p>
          </div>
        )}

        {/* DISPLAY STUDENT'S CLASS */}
        {studentClassData && (
          <div className="w-full sm:w-auto">
            <p className="text-sm font-semibold text-gray-700">Class:</p>
            <p className="text-lg font-bold bg-gray-50 shadow-sm rounded p-2 border">{className}</p>
          </div>
        )}

        {/* TERM SELECTION */}
        {selectedSession && terms.length > 0 && (
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-semibold text-gray-700">Select Term</label>
            <select
              className="block w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={selectedTerm || ""}
              onChange={(e) => setSelectedTerm(parseInt(e.target.value, 10))}
            >
              <option value="">-- Select Term --</option>
              {terms.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* DISPLAY RESULTS */}
      {selectedTerm && filteredResults.length > 0 ? (
        <div className="mt-6">
          <ResultDisplay 
            filteredResults={filteredResults} 
            terms={terms} 
            selectedTerm={selectedTerm} 
            studentInfo={studentInfo} 
            selectedSession={sessionName} 
            selectedClass={className} 
            selectedGrade={gradeName} 
            sessions={sessions} 
          />
        </div>
      ) : (
        selectedTerm && (
          <p className="mt-6 text-red-600 font-semibold text-center">
            ⚠️ No results found for the selected term.
          </p>
        )
      )}
    </div>
  );
};

export default StudentResultView;
