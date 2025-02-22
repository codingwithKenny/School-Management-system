
"use client";
import { useState, useEffect, useMemo } from "react";
import { fetchGrades, fetchClasses, fetchStudents } from "@/lib/actions";
import { useDatabase } from "@/app/context/DatabaseProvider";
import AdminView from "./AdminView";
import TeacherView from "./TeacherView";
import FormModal from "./FormModal";

const EditpayMent = ({ role, currentUser }) => {
  const { databaseData } = useDatabase();
  const sessions = databaseData.sessions || [];
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);

  //GET GRADE IN SELECTED SESSION
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

    // FILTER CLASS AND DISPLAY ONLY CLASS ASSIGNED TO THE LOGGED IN TEACHER(USER)
    const gradeClasses = await fetchClasses(selectedSession, gradeId);
    const filteredClasses =
      role === "teacher"
        ? gradeClasses.filter((cls) => cls.supervisor?.id === currentUser)
        : gradeClasses;

    setClasses(filteredClasses);
  };
  //  GET STUDENT TO DISPALY
  const handleStudentShow = async (classId) => {
    setSelectedClass(classId);
    const classStudents = await fetchStudents(
      selectedSession,
      selectedGrade,
      classId
    );
    setStudents(classStudents);
  };

  const memoizedGrades = useMemo(() => grades, [grades]);
  const memoizedClasses = useMemo(() => classes, [classes]);
  const memoizedStudents = useMemo(() => students, [students]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        📚 Grade & Class Management
      </h1>

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
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap justify-between gap-6">
        {/* GRADE SELECTION */}
        {selectedSession && (
          <div className="w-full md:w-5/12 bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">
              📌 Select Grade Level
            </h2>
            {loading ? (
              <p className="text-gray-500">Loading grades...</p>
            ) : memoizedGrades.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {memoizedGrades.map((grade) => (
                  <button
                    key={grade.id}
                    className={`p-4 md:p-5 ${
                      selectedGrade === grade.id
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100"
                    } rounded-lg shadow-md transition-all duration-300 border border-gray-300 hover:bg-indigo-600 hover:text-white`}
                    onClick={() => handleGradeClick(grade.id)}
                  >
                    {grade.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No grades found.</p>
            )}
          </div>
        )}

        {/* CLASS SELECTION */}
        {selectedGrade && (
          <div className="w-full md:w-5/12 bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold text-gray-700">
                🏫 Select Class
              </h2>
              {role === "admin" && (
                <FormModal
                  memoizedClasses={
                    memoizedClasses.length > 0 ? memoizedClasses : null
                  }
                  table="classTeacher"
                  type="create"
                />
              )}
            </div>
            {memoizedClasses.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {memoizedClasses.map((cls) => (
                  <button
                    key={cls.id}
                    className={`p-4 md:p-5 ${
                      selectedClass === cls.id
                        ? "bg-green-600 text-white"
                        : "bg-gray-100"
                    } rounded-lg shadow-md transition-all duration-300 border border-gray-300 hover:bg-green-600 hover:text-white`}
                    onClick={() => handleStudentShow(cls.id)}
                  >
                    {cls.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">
                {role === "teacher"
                  ? "No assigned classes."
                  : "No classes found."}
              </p>
            )}
          </div>
        )}
      </div>

      {/* STUDENT TABLE */}
      {selectedClass && (
        <div className="mt-6">
          {role === "admin" ? (
            <AdminView
              students={students}
              memoizedClasses={memoizedClasses}
              selectedClass={selectedClass}
              selectedSession={selectedSession}
            />
          ) : (
           <p>null</p>
          )}
        </div>
      )}
    </div>
  );
};

export default EditpayMent;
