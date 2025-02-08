import { useState } from "react";

const AdminView = ({ memoizedClasses,selectedClass,students }) => {
      const [loading, setLoading] = useState(false);
    
    return (
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
          ) : students.length > 0 ? (
            students.map((student) => (
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
    );
  };
  
  export default AdminView;
  