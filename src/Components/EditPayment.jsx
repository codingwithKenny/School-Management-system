"use client";
import { useDatabase } from "@/app/context/DatabaseProvider";
import { toast } from "@/hooks/use-toast";
import { updatePaymentHistory } from "@/lib/actions";
import React, { useState, useEffect } from "react";

const EditUnpaidStudent = () => {
  const { databaseData } = useDatabase();
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [students, setStudents] = useState([]);

  // Filter sessions where isCurrent is false
  const allSessions = databaseData.sessions;

  // Filter terms related to the selected session
  const relatedTerms = selectedSession
    ? databaseData.terms.filter((t) => Number(t.sessionId) === Number(selectedSession))
    : [];

  useEffect(() => {
    if (!databaseData.paymentHistory || databaseData.paymentHistory.length === 0) {
      console.log("Payment history is empty or not loaded yet.");
      return;
    }

    console.log("Fetching students for session:", selectedSession, "and term:", selectedTerm);

    const filteredStudents = databaseData.paymentHistory
      .filter(
        (p) =>
          Number(p.sessionId) === Number(selectedSession) &&
          Number(p.termId) === Number(selectedTerm)
      )
      .map((p) => {
        const student = databaseData.student.find((s) => s.id === p.studentId);
        return student ? { id: student.id, name: student.name, status: p.status } : null;
      })
      .filter(Boolean); // Remove null values

    console.log("Filtered students:", filteredStudents);
    setStudents(filteredStudents);
  }, [selectedSession, selectedTerm, databaseData.paymentHistory]);

  // Handle status update
  const handleStatusChange = (studentId, newStatus) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, status: newStatus } : student
      )
    );
  };

  // Update payment status
  const updatePaymentStatus = async (studentId, newStatus) => {
    console.log(
      "Updating payment status for:",
      studentId,
      "to",
      newStatus,
      "for session",
      selectedSession,
      "and term",
      selectedTerm
    );

    try {
      const response = await updatePaymentHistory({
        studentId,
        sessionId: selectedSession,
        termId: selectedTerm,
        newStatus,
      });
      console.log(response);
      if(response.success){
        toast({
          description: "Payment status updated successfully.",
          variant: "destructive",
        });


      }
    } catch (error) {
      toast({
        description: "Error updating result.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      {/* Session Dropdown */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Select Session
        </label>
        <select
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          value={selectedSession || ""}
          onChange={(e) => setSelectedSession(parseInt(e.target.value, 10))}
        >
          <option value="">-- Select Session --</option>
          {allSessions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Term Dropdown */}
      {selectedSession && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Term
          </label>
          <select
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            value={selectedTerm || ""}
            onChange={(e) => setSelectedTerm(parseInt(e.target.value, 10))}
        >
            <option value="">-- Select Term --</option>
            {relatedTerms.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Student Table */}
      {selectedTerm && students.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Student Payment Status</h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Student Name</th>
                <th className="border p-2">Payment Status</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="text-center">
                  <td className="border p-2">{student.name}</td>
                  <td className="border p-2">
                    <select
                      className="p-1 border rounded"
                      value={student.status}
                      onChange={(e) => handleStatusChange(student.id, e.target.value)}
                    >
                      <option value="PAID">PAID</option>
                      <option value="NOT_PAID">UNPAID</option>
                      <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
                    </select>
                  </td>
                  <td className="border p-2">
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      onClick={() => updatePaymentStatus(student.id, student.status)}
                    >
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedTerm && students.length === 0 && (
        <p className="text-gray-500 text-sm mt-4">No students found for this term.</p>
      )}
    </div>
  );
};

export default EditUnpaidStudent;
