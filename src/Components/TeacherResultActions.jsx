"use client";
import { toast } from "@/hooks/use-toast";
import { useState, useMemo, useEffect } from "react";
import { z } from "zod";

const TeacherResultActions = ({ students, sessions, subjects, teacherId, Results }) => {
  const [uploadStarted, setUploadStarted] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // New state for confirmation modal and checkbox
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmationChecked, setConfirmationChecked] = useState(false);

  const scoreSchema = z.object({
    ca1: z.preprocess((val) => parseFloat(val), z.number().min(0, "Must be ≥ 0").max(40, "Must be ≤ 20")),
    ca2: z.preprocess((val) => parseFloat(val), z.number().min(0, "Must be ≥ 0").max(40, "Must be ≤ 20")),
    exam: z.preprocess((val) => parseFloat(val), z.number().min(0, "Must be ≥ 0").max(100, "Must be ≤ 60")),
  });

  // Filter terms from the selected session
  const filteredTerms = useMemo(() => {
    const currentSession = sessions.find((s) => s.id === Number(selectedSession));
    return currentSession ? currentSession.terms : [];
  }, [selectedSession, sessions]);
  console.log(filteredTerms);

  const filteredGrades = useMemo(() => {
    const currentSession = sessions.find((s) => s.id === Number(selectedSession));
    return currentSession ? currentSession.grades : [];
  }, [selectedSession, sessions]);
  
  const filteredClasses = useMemo(() => 
    filteredGrades.find((g) => g.id === selectedGrade)?.classes || [], 
    [selectedGrade, filteredGrades]
  );

  // LOAD STUDENT ACCORDING TO THE FILTERED
  const handleLoadStudents = () => {
    if (!selectedGrade || !selectedSubject || !selectedClass) {
      toast({
        description: "Please select a grade, subject, and class to load students.",
        variant: "destructive",
      });
      return;
    }
    const studentsInGradeAndSubject = students
      .filter(
        (student) =>
          student.grade?.id === selectedGrade &&
          student.class?.id === selectedClass &&
          student.subjects.some((sub) => sub.subject.id === selectedSubject)
      )
      .map((student) => ({
        id: student.id,
        name: `${student.surname} ${student.name}`,
        grade: student.grade.name,
      }));

    setFilteredStudents(studentsInGradeAndSubject);
    setResults({});
    setErrors({});
  };

  const handleInputChange = (studentId, field, value) => {
    setResults((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
    const studentData = { ...results[studentId], [field]: value };
    const validation = scoreSchema.safeParse(studentData);
    setErrors((prev) => ({
      ...prev,
      [studentId]: validation.success ? null : validation.error.format(),
    }));
  };

  const calculatePerformance = (ca1, ca2, exam) => {
    const total = (parseFloat(ca1) || 0) + (parseFloat(ca2) || 0) + (parseFloat(exam) || 0);
    if (total >= 75) return "Excellent";
    if (total >= 70) return "Very Good";
    if (total >= 65) return "Good";
    if (total >= 50) return "Pass";
    return "Fail";
  };

  const validateAllResults = () => {
    let hasErrors = false;
    let newErrors = {};
    filteredStudents.forEach((student) => {
      const studentData = results[student.id] || {};
      const validation = scoreSchema.safeParse(studentData);
      if (!validation.success) {
        newErrors[student.id] = validation.error.format();
        hasErrors = true;
      }
    });
    setErrors(newErrors);
    return !hasErrors;
  };

  // This function does the actual submission
  const doSubmitResults = async () => {
    setLoading(true);
    try {
      const createResult = (await import("@/lib/actions")).createResult;
      const formattedResults = Object.entries(results).map(([studentId, scores]) => ({
        studentId,
        teacherId,
        termId: selectedTerm,
        subjectId: selectedSubject,
        gradeId: selectedGrade,
        classId: selectedClass,
        sessionId: selectedSession,
        firstAssessment: parseFloat(scores.ca1),
        secondAssessment: parseFloat(scores.ca2),
        examScore: parseFloat(scores.exam),
        totalScore: parseFloat(scores.ca1) + parseFloat(scores.ca2) + parseFloat(scores.exam),
      }));
      const response = await createResult(formattedResults);
      if (!response.success) {
        toast({
          description: response.error,
          variant: "destructive",
        });
      } else {
        toast({
          description: "✅ Results uploaded successfully!",
          variant: "success",
        });
        setResults({});
        setFilteredStudents([]);
      }
    } catch (error) {
      console.error("Upload Error:", error);
      toast({
        description: "An error occurred while uploading results.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Modified handleSubmitResults: if confirmation is not checked, open modal
  const handleSubmitResults = async () => {
    if (!validateAllResults()) {
      toast({
        description: "Some students have invalid scores. Please correct them before submission.",
        variant: "destructive",
      });
      return;
    }
    if (!confirmationChecked) {
      setShowConfirmModal(true);
      return;
    }
    await doSubmitResults();
  };

  return (
    <div className="p-6 bg-purple-50 min-h-screen">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">📄 Teacher Result Management</h1>
      <div className="flex flex-wrap justify-center gap-6">
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-all"
          onClick={() => setUploadStarted(true)}
        >
          Upload Result
        </button>
        <button className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-all">
          Check Uploaded Results
        </button>
      </div>

      {uploadStarted && (
        <div className="mt-6 bg-white p-6 shadow-md rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* SESSION SELECTION */}
            <div className="mb-4">
              <label className="text-xs text-gray-500 mr-4">Session</label>
              <select
                className="border text-sm text-gray-500 mt-2 ring-1 ring-gray-300 rounded-md p-2 cursor-pointer"
                value={selectedSession || ""}
                onChange={(e) => setSelectedSession(parseInt(e.target.value, 10))}
              >
                <option value="">-- Select Session --</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* TERM SELECTION */}
            {selectedSession && (
              <div className="mb-4">
                <label className="text-xs text-gray-500 mr-4">Term</label>
                <select
                  className="border text-sm text-gray-500 mt-2 ring-1 ring-gray-300 rounded-md p-2 cursor-pointer"
                  value={selectedTerm || ""}
                  onChange={(e) => setSelectedTerm(parseInt(e.target.value, 10))}
                >
                  <option value="">-- Select Term --</option>
                  {filteredTerms.map((term) => (
                    <option key={term.id} value={term.id}>
                      {term.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* SUBJECT SELECTION */}
            {selectedTerm && (
              <div className="mb-4">
                <label className="text-xs text-gray-500 mr-4">Subject</label>
                <select
                  className="border text-sm text-gray-500 mt-2 ring-1 ring-gray-300 rounded-md p-2 cursor-pointer"
                  value={selectedSubject || ""}
                  onChange={(e) => setSelectedSubject(parseInt(e.target.value, 10))}
                >
                  <option value="">-- Select Subject --</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* GRADE SELECTION */}
            {selectedSubject && (
              <div className="mb-4">
                <label className="text-xs text-gray-500 mr-4">Grade</label>
                <select
                  className="border text-sm text-gray-500 mt-2 ring-1 ring-gray-300 rounded-md p-2 cursor-pointer"
                  value={selectedGrade || ""}
                  onChange={(e) => setSelectedGrade(parseInt(e.target.value, 10))}
                >
                  <option value="">-- Select Grade --</option>
                  {filteredGrades.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* CLASS SELECTION */}
            {selectedGrade && (
              <div className="mb-4">
                <label className="text-xs text-gray-500 mr-4">Class</label>
                <select
                  className="border text-sm text-gray-500 mt-2 ring-1 ring-gray-300 rounded-md p-2 cursor-pointer"
                  value={selectedClass || ""}
                  onChange={(e) => setSelectedClass(parseInt(e.target.value, 10))}
                >
                  <option value="">-- Select Class --</option>
                  {filteredClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {/* Confirmation Checkbox and Load Students Button */}
          <div className="flex flex-col items-center mt-4">
          
            {selectedClass && (
              <button
                onClick={handleLoadStudents}
                className="mb-4 bg-purple-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-md hover:bg-purple-700 transition-all"
              >
                Load Students
              </button>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md w-96">
            <h2 className="text-lg font-bold mb-4">Confirm Submission</h2>
            <p className="mb-4">
              Are you sure you want to submit this class result? I confirm that the student record was correctly input.
            </p>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="modalConfirm"
                checked={confirmationChecked}
                onChange={(e) => setConfirmationChecked(e.target.checked)}
                className="mr-2 h-4 w-4"
              />
              <label htmlFor="modalConfirm" className="text-sm text-gray-700">
                I agree
              </label>
            </div>
            <div className="flex justify-end gap-4">
              <button
                className="bg-gray-300 px-4 py-2 rounded-md"
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmationChecked(false);
                }}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded-md"
                onClick={async () => {
                  if (!confirmationChecked) {
                    toast({
                      description: "Please check the confirmation box.",
                      variant: "destructive",
                    });
                    return;
                  }
                  setShowConfirmModal(false);
                  await doSubmitResults();
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Display Students After Load */}
      {filteredStudents.length > 0 && (
        <div className="mt-6 w-full overflow-x-auto">
          <h3 className="text-md font-semibold text-center">Students in Selected Class</h3>
          <table className="w-full mt-2 border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Student Name</th>
                <th className="border p-2">Grade</th>
                <th className="border p-2">CA 1</th>
                <th className="border p-2">CA 2</th>
                <th className="border p-2">Exam</th>
                <th className="border p-2">Grade Performance</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-t">
                  <td className="border p-2">{student.name}</td>
                  <td className="border p-2">{student.grade}</td>
                  {["ca1", "ca2", "exam"].map((field) => (
                    <td key={field} className="border p-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="w-16 border p-1"
                        onChange={(e) => handleInputChange(student.id, field, e.target.value)}
                      />
                    </td>
                  ))}
                  <td className="border p-2">
                    {calculatePerformance(
                      results[student.id]?.ca1,
                      results[student.id]?.ca2,
                      results[student.id]?.exam
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="confirmSubmit"
                checked={confirmationChecked}
                onChange={(e) => setConfirmationChecked(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="confirmSubmit" className="text-xs text-gray-500">
                Are you sure you want to submit this class result? I agree that the student record was correctly input.
              </label>
            </div> */}
          {/* Submit Button */}
          <button onClick={handleSubmitResults} className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
            {loading ? "Submitting..." : "Submit Results"}
          </button>
        </div>
      )}
    </div>
  );
};

export default TeacherResultActions;
