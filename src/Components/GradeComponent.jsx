"use client";
import { useState, useEffect, useMemo } from "react";
import { fetchGrades, fetchClasses, fetchStudents } from "@/lib/actions";
import { useDatabase } from "@/app/context/DatabaseProvider";

import AdminView from "./AdminView";
import TeacherView from "./TeacherView";

const GradeComponent = ({ role, currentUser }) => {
  const { databaseData } = useDatabase();
  const sessions = databaseData.sessions || [];
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);

  // ✅ Fetch grades when session is selected
  useEffect(() => {
    if (!selectedSession || isNaN(selectedSession)) return;
    setLoading(true);

    const fetchData = async () => {
      const sessionGrades = await fetchGrades(selectedSession);
      setGrades(sessionGrades);
      setLoading(false);
    };

    fetchData();
  }, [selectedSession]);

  const handleGradeClick = async (gradeId) => {
    setSelectedGrade(gradeId);
    setSelectedClass(null);
    setStudents([]);

    const gradeClasses = await fetchClasses(selectedSession, gradeId);

    // ✅ Filter classes for teachers: Only show assigned classes
    const filteredClasses =
      role === "teacher"
        ? gradeClasses.filter((cls) => cls.supervisor?.id === currentUser)
        : gradeClasses;

    setClasses(filteredClasses);
  };

  // ✅ Fix: Ensure `classId` is correctly passed
  const handleStudentShow = async (classId) => {
    console.log("Selected Class ID:", classId); // Debugging log
    setSelectedClass(classId);
    const classStudents = await fetchStudents(selectedSession, selectedGrade, classId);
    setStudents(classStudents);
  };

  const memoizedGrades = useMemo(() => grades, [grades]);
  const memoizedClasses = useMemo(() => classes, [classes]);
  const memoizedStudents = useMemo(() => students, [students]);

  return (
    <div className="p-4 bg-purple-100">
      <h1 className="text-sm text-center text-gray-500 font-bold">
        School Grade-level and Classes
      </h1>

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

      {/* GRADE SELECTION */}
      <div className="flex flex-wrap justify-around items-center">
      {selectedSession && (
        <div className="flex flex-wrap justify-around mt-5">
          <div className="mb-6 bg-purple-200 rounded-md p-4 mr-10">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">
              📚 Grade Level
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {loading ? (
                <p className="text-gray-500">Loading grades...</p>
              ) : memoizedGrades.length > 0 ? (
                memoizedGrades.map((grade) => (
                  <button
                    key={grade.id}
                    className={`p-4 md:p-5 ${
                      selectedGrade === grade.id
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100"
                    } rounded-lg shadow-md transition-all duration-300 border border-gray-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-700`}
                    onClick={() => handleGradeClick(grade.id)}
                  >
                    {grade.name}
                  </button>
                ))
              ) : (
                <p className="text-gray-500">No grades found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CLASS SELECTION */}
      {selectedGrade && (
        <div className="mb-6 bg-purple-200 rounded-md p-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">🏫 Select a Class</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {classes.length > 0 ? (
              classes.map((cls) => (
                <button
                  key={cls.id}
                  className={`p-4 md:p-5 ${
                    selectedClass === cls.id ? "bg-green-600 text-white" : "bg-gray-100"
                  } rounded-lg shadow-md transition-all duration-300 border border-gray-300 hover:bg-green-600 hover:text-white hover:border-green-700`}
                  onClick={() => handleStudentShow(cls.id)}
                >
                  {cls.name}
                </button>
              ))
            ) : (
              <p className="text-gray-500">
                {role === "teacher" ? "No assigned classes." : "No classes found."}
              </p>
            )}
          </div>
        </div>
      )}

      </div>

      {/* STUDENT TABLE (Admin vs. Teacher) */}
      {selectedClass &&
        (role === "admin" ? (
          <AdminView students={students} memoizedClasses={memoizedClasses} selectedClass={selectedClass} selectedSession={selectedSession}/>
        ) : (
          <TeacherView students={students} memoizedClasses={memoizedClasses} selectedClass={selectedClass} />
        ))}
    </div>
  );
};

export default GradeComponent;
