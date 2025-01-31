"use client";

import { useState } from "react";
import Table from "@/components/Table";
import TeacherResultActions from "@/components/TeacherResultActions";
import { getStudentsByGrade } from "@/lib/actions"; // Import the function

const TeacherDashboard = ({ grades, terms, userId }) => {
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState("");

  // Fetch students dynamically
  const fetchStudents = async (gradeId) => {
    setSelectedGrade(gradeId);
    setStudents([]); // Reset students while loading

    const students = await getStudentsByGrade(gradeId, userId);
    setStudents(students);
  };

  // Upload result action
  const uploadResult = (studentId) => {
    if (!selectedTerm) {
      alert("Please select a term.");
      return;
    }
    window.location.href = `/upload-result?studentId=${studentId}&termId=${selectedTerm}`;
  };

  return (
    <div className="p-4">
      <TeacherResultActions />

      {/* Grade Selection */}
      <h2 className="text-lg font-semibold">Select Grade</h2>
      <div className="flex flex-wrap gap-2">
        {grades.map((grade) => (
          <button
            key={grade.id}
            onClick={() => fetchStudents(grade.id)}
            className={`px-4 py-2 rounded-md border ${selectedGrade === grade.id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            {grade.name}
          </button>
        ))}
      </div>

      {/* Student List & Result Upload */}
      {selectedGrade && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Students in {grades.find(g => g.id === selectedGrade)?.name}</h2>
          
          {/* Select Term */}
          <select className="border p-2 rounded-md mb-2" value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}>
            <option value="">Select Term</option>
            {terms.map(term => <option key={term.id} value={term.id}>{term.name}</option>)}
          </select>

          {/* Student Table */}
          <Table
            data={students.map(student => ({
              id: student.id,
              student: `${student.surname} ${student.name}`,
              class: student.class?.name ?? "No Class",
            }))}
            column={[
              { header: "Student", accessor: "student" },
              { header: "Class", accessor: "class" },
              { header: "Actions", accessor: "actions" },
            ]}
            renderRow={(student) => (
              <tr key={student.id} className="border-b">
                <td>{student.student}</td>
                <td>{student.class}</td>
                <td>
                  <button 
                    className="px-3 py-1 bg-green-500 text-white rounded-md"
                    onClick={() => uploadResult(student.id)}
                  >
                    Upload Result
                  </button>
                </td>
              </tr>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
