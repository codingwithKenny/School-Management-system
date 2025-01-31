'use client';
import { useState } from 'react';
import Link from 'next/link';
import Modal from '@/components/Modal';

const TeacherResultActions = ({ students, grades, subjects, terms, sessions, teacherId }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [results, setResults] = useState({}); // Store input scores

  // ✅ Ensure unique terms using Set
  const uniqueTerms = [...new Map(terms.map(term => [term.name, term])).values()];
  const sortedGrades = grades.map(g => g.name).sort((a, b) => a.localeCompare(b));

  // ✅ Load students based on selected grade
  const handleLoadStudents = () => {
    if (!selectedGrade) {
      alert('Please select a grade to load students.');
      return;
    }

    const studentsInGrade = students
      .filter(student => student.grade?.name === selectedGrade)
      .map(student => ({
        id: student.id,
        name: `${student.surname} ${student.name}`,
        grade: student.grade.name
      }));

    setFilteredStudents(studentsInGrade);
  };

  // ✅ Handle Score Input Changes
  const handleInputChange = (studentId, field, value) => {
    setResults(prevResults => ({
      ...prevResults,
      [studentId]: {
        ...prevResults[studentId],
        [field]: value
      }
    }));
  };

  // ✅ Submit Results to Backend
  const handleSubmitResults = async () => {
    const createResult = (await import("@/lib/actions")).createResult; // ✅ Dynamic Import

    if (!selectedSession || !selectedTerm || !selectedSubject) {
      alert('Please select a session, term, and subject.');
      return;
    }

    const termId = terms.find(term => term.name === selectedTerm)?.id;
    const subjectId = subjects.find(subject => subject.name === selectedSubject)?.id;

    if (!termId || !subjectId) {
      alert('Invalid term or subject selection.');
      return;
    }

    const formattedResults = Object.entries(results).map(([studentId, scores]) => ({
      studentId,
      teacherId,
      termId,
      subjectId,
      firstAssessment: parseFloat(scores.ca1) || 0,
      secondAssessment: parseFloat(scores.ca2) || 0,
      examScore: parseFloat(scores.exam) || 0,
      totalScore:
        (parseFloat(scores.ca1) || 0) +
        (parseFloat(scores.ca2) || 0) +
        (parseFloat(scores.exam) || 0),
    }));
  
    console.log("Sending Results:", formattedResults);
  
    try {
      for (const result of formattedResults) {
        const response = await createResult(result);
  
        if (!response.success) {
          alert(response.error);
          return;
        }
      }
  
      alert('Results uploaded successfully!');
      setModalOpen(false);
    } catch (error) {
      console.error('Upload Error:', error);
      alert('An error occurred while uploading results.');
    }
  }    

  return (
    <div className="flex flex-col items-center mt-6 w-full">
      {/* Dropdown Section */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Session Dropdown */}
        <select
          value={selectedSession}
          onChange={(e) => setSelectedSession(e.target.value)}
          className="w-full p-2 md:p-3 border rounded-md"
        >
          <option value="">-- Select Session --</option>
          {sessions?.map(session => (
            <option key={session.id} value={session.name}>{session.name}</option>
          ))}
        </select>

        {/* Term Dropdown */}
        <select
          value={selectedTerm}
          onChange={(e) => setSelectedTerm(e.target.value)}
          className="w-full p-2 md:p-3 border rounded-md"
        >
          <option value="">-- Select Term --</option>
          {uniqueTerms.map(term => (
            <option key={term.id} value={term.name}>{term.name}</option>
          ))}
        </select>

        {/* Subject Dropdown */}
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full p-2 md:p-3 border rounded-md"
          disabled={!selectedTerm}
        >
          <option value="">-- Select Subject --</option>
          {subjects.map(subject => (
            <option key={subject.id} value={subject.name}>{subject.name}</option>
          ))}
        </select>

        {/* Grade Dropdown */}
        <select
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          className="w-full p-2 md:p-3 border rounded-md"
          disabled={!selectedSubject}
        >
          <option value="">-- Select Grade --</option>
          {sortedGrades.map((grade, index) => (
            <option key={index} value={grade}>{grade}</option>
          ))}
        </select>
      </div>

      {/* Load Students Button */}
      <button 
        onClick={handleLoadStudents} 
        className="mt-4 bg-purple-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-md hover:bg-purple-700 transition-all"
      >
        Load Students
      </button>

      {/* Display Students with Score Inputs */}
      {filteredStudents.length > 0 && (
        <div className="mt-6 w-full overflow-x-auto">
          <h3 className="text-md font-semibold text-center">Students in Selected Grade</h3>
          <table className="w-full mt-2 border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Student Name</th>
                <th className="border p-2">Grade</th>
                <th className="border p-2">CA 1</th>
                <th className="border p-2">CA 2</th>
                <th className="border p-2">Exam</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id} className="text-center border-t">
                  <td className="border p-2">{student.name}</td>
                  <td className="border p-2">{student.grade}</td>
                  <td className="border p-2">
                    <input 
                      type="number" 
                      min="0" max="20" 
                      className="w-16 border p-1"
                      onChange={(e) => handleInputChange(student.id, 'ca1', e.target.value)}
                    />
                  </td>
                  <td className="border p-2">
                    <input 
                      type="number" 
                      min="0" max="20" 
                      className="w-16 border p-1"
                      onChange={(e) => handleInputChange(student.id, 'ca2', e.target.value)}
                    />
                  </td>
                  <td className="border p-2">
                    <input 
                      type="number" 
                      min="0" max="60" 
                      className="w-16 border p-1"
                      onChange={(e) => handleInputChange(student.id, 'exam', e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Submit Results Button */}
      {filteredStudents.length > 0 && (
        <button 
          onClick={handleSubmitResults} 
          className="mt-6 bg-red-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-md hover:bg-red-700 transition-all"
        >
          Submit Results
        </button>
      )}
    </div>
  );
};

export default TeacherResultActions;
