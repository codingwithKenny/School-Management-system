"use client";
import { useState, useEffect, useMemo } from "react";
import { fetchGrades, fetchClasses, fetchStudents } from "@/lib/actions";
import FormModal from "./FormModal";
import { useDatabase } from "@/app/context/DatabaseProvider";

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

    const delayFetch = setTimeout(async () => {
      if (selectedSession) {
        const sessionGrades = await fetchGrades(selectedSession);
        setGrades(sessionGrades);
        setLoading(false);
        setSelectedGrade(null);
        setClasses([]);
        setSelectedClass(null);
        setStudents([]);
      }
    }, 300);

    return () => clearTimeout(delayFetch);
  }, [selectedSession]);

  const memoizedGrades = useMemo(() => grades, [grades]);

  // ✅ Fetch classes when a grade is selected
  const handleGradeClick = async (gradeId) => {
    setSelectedGrade(gradeId);
    setSelectedClass(null);
    setStudents([]);

    const gradeClasses = await fetchClasses(selectedSession, gradeId);

    // ✅ Filter classes for teachers: Only show assigned classes
    const filteredClasses = role === "teacher"
      ? gradeClasses.filter(cls => cls.supervisor?.id === currentUser)
      : gradeClasses;

    setClasses(filteredClasses);
  };
  // console.log(filteredClasses,'wertyuiop')
  console.log(classes)

  const memoizedClasses = useMemo(() => classes, [classes]);

  // ✅ Fetch students when a class is selected
  const handleStudentShow = async (classId) => {
    setSelectedClass(classId);
    const classStudents = await fetchStudents(selectedSession, selectedGrade, classId);
    setStudents(classStudents);
  };

  const memoizedStudents = useMemo(() => students, [students]);
     const query = {}
   switch (role) {
      case "admin":// ADMIN CAN VIEW ALL 
        break;
  
      case "teacher":
        query.class = {
          teacherId: currentUser, // TEACHER CAN ONLY VIEW THIER CLASS IN A GRADE
        }; 
        break;
      default:
        throw new Error("Unauthorized access");
    }

  return (
    <div className="p-4 bg-purple-100 h-screen">
      <h1 className="text-sm text-center text-gray-500 font-bold">
        School Grade-level and Classes
      </h1>
      <div>
        <label className="text-xs text-gray-500 mr-4">Session</label>
        <select
          className="border text-sm text-gray-500 mt-2 ring-[1.5px] ring-gray-300 rounded-md p-2 cursor-pointer"
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

      {selectedSession && (
        <div className="flex flex-wrap justify-around mt-5">
          <div className="flex flex-wrap justify-around">
            {/* GRADES */}
            <div className="mb-6 bg-purple-200 rounded-md p-4 mr-10">
              <div className="flex flex-wrap items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-700 mb-3">
                  📚 Grade Level
                </h2>
                {role === "admin" && <FormModal type="create" table="classTeacher" className="bg-white" />}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {loading ? (
                  <p className="text-gray-500">Loading grades...</p>
                ) : memoizedGrades.length > 0 ? (
                  memoizedGrades.map((grade) => (
                    <button
                      key={grade.id}
                      className={`p-4 md:p-5 ${
                        selectedGrade === grade.id ? "bg-indigo-600 text-white" : "bg-gray-100"
                      } rounded-lg shadow-md transition-all duration-300 border border-gray-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-700 font-medium text-gray-800 hover:shadow-lg active:scale-95`}
                      onClick={() => handleGradeClick(grade.id)}
                    >
                      {grade.name}
                    </button>
                  ))
                ) : (
                  <p className="text-gray-500">No grades found for this session.</p>
                )}
              </div>
            </div>

            {/* CLASSES */}
            {selectedGrade && (
              <div className="mb-6 bg-purple-200 rounded-md p-4">
               <div className="flex flex-wrap justify-around items-center">
               <h2 className="text-xl font-semibold text-gray-700 mb-3">
                  🏫 Select a Class
                </h2>
                <FormModal memoizedClasses={memoizedClasses.length > 0 ? memoizedClasses : null} table="classTeacher" type="create" />
               </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {memoizedClasses.length > 0 ? (
                    memoizedClasses.map((cls) => (
                      <button
                        key={cls.id}
                        className={`p-4 md:p-5 ${
                          selectedClass === cls.id ? "bg-green-600 text-white" : "bg-gray-100"
                        } rounded-lg shadow-md transition-all duration-300 border border-gray-300 hover:bg-green-600 hover:text-white hover:border-green-700 font-medium text-gray-800 hover:shadow-lg active:scale-95`}
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

            {/* STUDENTS & TEACHER INFO */}
            {selectedClass && (
              <div className="mb-6 bg-purple-200 rounded-md p-4">
                <div className="flex flex-wrap justify-around items-center">
                  <h2 className="text-xl font-semibold text-gray-700 mb-3">
                    👨‍🎓 Students
                  </h2>

                  {/* ✅ Display Assigned Teacher */}
                  <div className="mt-2 p-2 bg-indigo-100 rounded-md text-center">
                    <h4 className="text-sm font-semibold">👨‍🏫 Class Teacher</h4>
                    {memoizedClasses.find(cls => cls.id === selectedClass)?.supervisor ? (
                      <p className="text-sm">
                        {memoizedClasses.find(cls => cls.id === selectedClass).supervisor.name} 
                        (@{memoizedClasses.find(cls => cls.id === selectedClass).supervisor.username})
                      </p>
                    ) : (
                      <p className="text-gray-500 text-sm">No teacher assigned</p>
                    )}
                  </div>
                </div>

                {/* Students List */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {loading ? (
                    <p className="text-gray-500">Loading students...</p>
                  ) : memoizedStudents.length > 0 ? (
                    memoizedStudents.map((student) => (
                      <div
                        key={student.id}
                        className="p-4 bg-gray-100 rounded-lg shadow-md border border-gray-300"
                      >
                        <h3 className="font-semibold">{student.name}</h3>
                        <p className="text-sm text-gray-600">@{student.username}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No students found in this class.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeComponent;
