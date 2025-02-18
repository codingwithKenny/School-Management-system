"use client";
import React, { useState } from "react";
import { useDatabase } from "@/app/context/DatabaseProvider";

const AdminResultAction = ({ allResult, sessions, subject }) => {
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const { databaseData } = useDatabase();

  const grades = databaseData.grades || [];
  const history = databaseData.studentHistory.map((item) => item.results);

  const selectedSessionData = sessions.find(
    (session) => session.id === Number(selectedSession)
  );
  const terms = selectedSessionData ? selectedSessionData.terms : [];

  const handleLoadResult = () => {
    if (selectedSession && selectedTerm && selectedSubject) {
      // CONFIRM RESULT MATCH THE SELECTED SESSION,TERM AND SUBJECT
      const results = allResult.data.filter((result) => {
        return (
          result.sessionId === Number(selectedSession) &&
          result.termId === Number(selectedTerm) &&
          result.subjectId === Number(selectedSubject)
        );
      });
      // IF NO RESULT FOUND IN RESULT,CHECK STUDENT HISTORY
      const historyResults =
        results.length === 0
          ? history.find((hist) =>
              hist.some(
                (result) =>
                  result.sessionId === Number(selectedSession) &&
                  result.termId === Number(selectedTerm) &&
                  result.subjectId === Number(selectedSubject)
              )
            )
          : results;

      setFilteredResults(historyResults || []);
    }
  };

  const handleSessionChange = (e) => {
    setSelectedSession(e.target.value);
    handleLoadResult();
  };

  const handleTermChange = (e) => {
    setSelectedTerm(e.target.value);
    handleLoadResult();
  };

  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
    handleLoadResult();
  };

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <div className="flex justify-between gap-8">
        <div className="w-full sm:w-1/3 text-center">
          <label
            htmlFor="session"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select Session
          </label>
          <select
            id="session"
            className="block w-full p-2.5 border rounded-lg mt-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
            value={selectedSession}
            onChange={handleSessionChange}
          >
            <option value="">-- Select Session --</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.name}
              </option>
            ))}
          </select>
        </div>
        {selectedSession && terms.length > 0 && (
          <div className="w-full sm:w-1/3 text-center">
            <label
              htmlFor="term"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Select Term
            </label>
            <select
              id="term"
              className="block w-full p-2.5 border rounded-lg mt-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              value={selectedTerm}
              onChange={handleTermChange}
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
        <div className="w-full sm:w-1/3 text-center">
          <label
            htmlFor="subject"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select Subject
          </label>
          <select
            id="subject"
            className="block w-full p-2.5 border rounded-lg mt-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
            value={selectedSubject}
            onChange={handleSubjectChange}
          >
            <option value="">-- Select Subject --</option>
            {subject.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-4">
        <button
          onClick={handleLoadResult}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none"
        >
          Load Results
        </button>
      </div>
      {/* DISPLAY RESULT PER GRADE */}
      <div className="mt-6">
        {grades.map((grade) => {
          const gradeResults = filteredResults.filter(
            (result) => result.gradeId === grade.id
          );

          return gradeResults.length > 0 ? (
            <div key={grade.id} className="mt-6">
              <h3 className="text-xl font-medium text-gray-900 mb-4">
                {grade.name}
              </h3>
              <table className="min-w-full table-auto border-collapse shadow-md rounded-lg">
                <thead>
                  <tr className="bg-gray-200 text-sm font-semibold text-gray-700">
                    <th className="px-4 py-2 border-b">Student Name</th>
                    <th className="px-4 py-2 border-b">First CA</th>
                    <th className="px-4 py-2 border-b">Second CA</th>
                    <th className="px-4 py-2 border-b">Exam</th>
                    <th className="px-4 py-2 border-b">Grade</th>
                    <th className="px-4 py-2 border-b">Session</th>
                    <th className="px-4 py-2 border-b">Term</th>
                    <th className="px-4 py-2 border-b">Subject</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-600">
                  {gradeResults.map((result, index) => (
                    <tr
                      key={result.id}
                      className={`hover:bg-gray-100 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-3 border-b">
                        {result.student.name}
                      </td>
                      <td className="px-4 py-3 border-b">
                        {result.firstAssessment}
                      </td>
                      <td className="px-4 py-3 border-b">
                        {result.secondAssessment}
                      </td>
                      <td className="px-4 py-3 border-b">{result.examScore}</td>
                      <td className="px-4 py-3 border-b">{grade.name}</td>
                      <td className="px-4 py-3 border-b">
                        {selectedSessionData?.name}
                      </td>
                      <td className="px-4 py-3 border-b">{result.term.name}</td>
                      <td className="px-4 py-3 border-b">
                        {
                          subject.find((sub) => sub.id === result.subjectId)
                            ?.name
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
};

export default AdminResultAction;
