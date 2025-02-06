"use client";
import { useState, useEffect, useMemo } from "react";
import { fetchGrades, fetchClasses, fetchStudents } from "@/lib/actions";
import FormModal from "./FormModal";
import { useDatabase } from "@/app/context/DatabaseProvider";

const GradeComponent = ({ role }) => {
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
    setLoading(true); // ✅ Start loading
      const delayFetch = setTimeout(async () => {
      if (selectedSession) {
        const sessionGrades = await fetchGrades(selectedSession);
        console.log("Session:", selectedSession, "Grades:", sessionGrades);
        setGrades(sessionGrades);
        setLoading(false); // ✅ Stop loading after data arrives
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
    setClasses(gradeClasses);
  };

  const memoizedClasses = useMemo(() => classes, [classes]);

  // ✅ Fetch students when a class is selected
  const handleStudentShow = async (classId) => {
    setSelectedClass(classId);
    const classStudents = await fetchStudents(selectedSession, selectedGrade, classId);
    setStudents(classStudents);
  };

  const memoizedStudents = useMemo(() => students, [students]);

  return (
    <div className="p-4 bg-purple-100 h-screen">
      <h1 className="text-sm text-center text-gray-500 font-bold">
        School Grade-level and Classes
      </h1>
      <div className="">
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

      {role === "admin" && selectedSession && (
        <div className="flex flex-wrap justify-around mt-5">
          <div className="flex flex-wrap justify-around">
            {/* GRADES */}
            
            <div className="mb-6 bg-purple-200 rounded-md p-4 mr-10">
              <div className="flex flex-wrap items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-700 mb-3">
                  📚 Grade Level
                </h2>
                <FormModal type="create"  table="classTeacher" className="bg-white" />
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
             <div className={`mb-6 rounded-md p-4 transition-all duration-300 ${loading ? "bg-gray-300 animate-pulse" : "bg-purple-200"}`}>
             <div className="flex flex-wrap justify-between items-center">
               <h2 className="text-xl font-semibold text-gray-700 mb-3">
                 🏫 Select a Class
               </h2>
               <FormModal memoizedClasses={memoizedClasses.length > 0 ? memoizedClasses : null} table="classTeacher" type="create" />
               </div>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
               {loading ? (
                 <p className="text-gray-500">Loading classes...</p>
               ) : memoizedClasses.length > 0 ? (
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
                 <div>
                   <p className="text-gray-500">No classes found. Add new class</p>
                   <FormModal type="create" />
                 </div>
               )}
             </div>
           </div>
           
            )}

            {/* STUDENT LIST */}
            {selectedClass && (
             <div className={`mb-6 rounded-md p-4 transition-all duration-300 ${loading ? "bg-gray-300 animate-pulse" : "bg-purple-200"}`}>
             <h2 className="text-xl font-semibold text-gray-700 mb-3">
               👨‍🎓 Students
             </h2>
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
