import { useState } from "react";
import FormModal from "./FormModal";

const AdminView = ({ memoizedClasses, selectedClass, students }) => {
  const [loading, setLoading] = useState(false);
  
  // 🔍 Debugging Output: Check if student IDs exist
  console.log("Checking Student IDs:", students.map(s => ({ name: s.name, id: s.id })));
  console.log("Checking Subject IDs:", students.map(s => s.subjects?.map(sub => sub.subject?.id)));

  return (
    <div className="mb-6 bg-purple-200 rounded-md p-4">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700">👨‍🎓 Students</h2>

        {/* ✅ Display Assigned Teacher */}
        <div className="p-2 bg-indigo-100 rounded-md text-center">
          <h4 className="text-sm font-semibold">👨‍🏫 Class Teacher</h4>
          {memoizedClasses.find((cls) => cls.id === selectedClass)?.supervisor ? (
            <p className="text-sm">
              {memoizedClasses.find((cls) => cls.id === selectedClass).supervisor.name}
              (@{memoizedClasses.find((cls) => cls.id === selectedClass).supervisor.username})
            </p>
          ) : (
            <p className="text-gray-500 text-sm">No teacher assigned</p>
          )}
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto bg-white p-4 rounded-lg shadow-md">
        {loading ? (
          <p className="text-gray-500">Loading students...</p>
        ) : students.length > 0 ? (
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2">Image</th>
                <th className="border border-gray-300 p-2">Name</th>
                <th className="border border-gray-300 p-2">Payment Status</th>
                <th className="border border-gray-300 p-2">Subjects</th>
                <th className="border border-gray-300 p-2">Term/Session</th>
                <th className="border border-gray-300 p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, studentIndex) => (
                <tr key={student?.id ?? `student-${studentIndex}`} className="text-center">
                  <td className="border border-gray-300 p-2">
                    <img
                      src={student.image || "/avatar.png"}
                      alt={student.name}
                      className="w-10 h-10 rounded-full mx-auto"
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    {student.surname} {student.name}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {student.paymentStatus ? (
                      <span className="text-green-600 font-semibold">Paid</span>
                    ) : (
                      <span className="text-red-600 font-semibold">Not Paid</span>
                    )}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {student?.subjects?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {student.subjects.map((sub, subIndex) => (
                          <span
                            key={sub?.subject?.id ?? `subject-${student.id}-${subIndex}`}
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
                          >
                            {sub?.subject?.name || "Unnamed Subject"}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">No subjects</span>
                    )}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {student?.term?.name || "N/A"} / {student?.session?.name || "N/A"}
                  </td>
                  <td className="border border-gray-300 flex justify-center items-center p-3">
                    <FormModal type="update" table="student" data={student} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-center">No students found in this class.</p>
        )}
      </div>
    </div>
  );
};

export default AdminView;
