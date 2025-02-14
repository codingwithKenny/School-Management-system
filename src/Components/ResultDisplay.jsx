"use client";
import Image from "next/image";
import React, { useRef } from "react";

const ResultDisplay = ({ 
  filteredResults, 
  terms, 
  selectedTerm, 
  studentInfo, 
  selectedSession, 
  selectedClass, 
  selectedGrade, 
  sessions,
  classSize,
  studentPosition,
  affectiveSkills
}) => {
  console.log(studentInfo, 'DEBUG: studentInfo in ResultDisplay.jsx'); // Debugging Log

  const printRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 bg-gray-100 relative">
      {/* ✅ Background Image - Applied via CSS */}
      <div className="absolute inset-0 bg-no-repeat bg-center opacity-5 pointer-events-none z-[999] print:z-[9999] print:opacity-20"
        style={{
          backgroundImage: "url('/logo.png')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "20%",  // ⬅️ Reduced the size of the background image
        }}
      ></div>

      {/* PRINTABLE AREA */}
      <div ref={printRef}  id="printable-area" className="bg-white p-6 shadow-lg rounded-md border border-gray-300 print:w-full">
        {/* SCHOOL HEADER */}
        <div className="flex justify-between items-center border-b pb-2">
          <Image src="/logo.png" width={80} height={80} alt="School Logo" />
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold uppercase">MUSLIM GROUP OF SCHOOLS</h1>
            <p className="text-md italic font-semibold">"ALLAH IS GREAT"</p>
            <p className="text-sm">Behind Premier Tobacco, Ileko Alafin, Odo Eran, Owode, Oyo</p>
            <p className="text-sm font-semibold">Call: 09036391952 | Website: www.muslimgroupofschool.com</p>
          </div>
          <div className="border p-2">
            <Image src={studentInfo?.img ? `/uploads/${studentInfo.img}` : "/default-avatar.png"} width={80} height={80} alt="Student Photo" />
          </div>
        </div>

        <p className="border border-black w-full mt-2 text-center text-lg font-bold uppercase">
          {terms.find((t) => t.id === selectedTerm)?.name} Term Academic Report
        </p>

        {/* STUDENT INFORMATION */}
        <div className="flex justify-around items-center border border-black bg-white">
          <div className="border border-black p-3 w-[50%] ">
            <p><strong>Name:</strong> {studentInfo?.surname} {studentInfo?.name}</p>
            <p><strong>Class:</strong> {selectedClass}</p>
            <p><strong>Admission Number:</strong> {studentInfo?.username}</p>
            <p><strong>Times Present:</strong> ____</p>
          </div>
          <div className="border border-black p-3 w-[50%]">
            <p><strong>Grade:</strong> {selectedGrade}</p>
            <p><strong>Session:</strong> {selectedSession}</p>
            <p><strong>Term:</strong> {terms.find((t) => t.id === selectedTerm)?.name}</p>
            <p><strong>Times Absent:</strong> ____</p>
          </div>
        </div>

        {/* RESULT TABLE */}
        <div className="mt-4">
        {/* Result Table and Affective Skills Side-by-Side */}
        <div className="flex mt-4">
          {/* Result Table */}
          <div className="w-[70%]">
            <table className="w-full border-collapse border border-gray-300 text-sm bg-white">
              <thead>
                <tr className="bg-gray-200 uppercase text-center">
                  <th className="border p-2">Subject</th>
                  <th className="border p-2">CA 1</th>
                  <th className="border p-2">CA 2</th>
                  <th className="border p-2">Exam</th>
                  <th className="border p-2">Total</th>
                  <th className="border p-2">Average</th>
                  <th className="border p-2">Grade</th>
                  <th className="border p-2">Rank</th>
                  <th className="border p-2">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((result, index) => (
                  <tr key={index} className="text-center border-t">
                    <td className="border p-2 text-left">{result.subject.name}</td>
                    <td className="border p-2">{result.firstAssessment}</td>
                    <td className="border p-2">{result.secondAssessment}</td>
                    <td className="border p-2">{result.examScore}</td>
                    <td className="border p-2 font-bold">{result.totalScore}</td>
                    <td className="border p-2">{(result.totalScore / 3).toFixed(2)}</td>
                    <td className="border p-2">{result.grade}</td>
                    <td className="border p-2">{result.rank || "__"}</td>
                    <td className="border p-2 italic">{result.remark || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Affective Skills Table */}
          <div className="w-[30%] ml-4">
            <h3 className="text-md font-semibold text-center">Affective Skills</h3>
            <table className="w-full border-collapse border border-gray-300 text-sm bg-white mt-2">
              <thead>
                <tr className="bg-gray-200 text-center">
                  <th className="border p-2">Skill</th>
                  <th className="border p-2">Rating</th>
                </tr>
              </thead>
              <tbody>
                {affectiveSkills?.map((skill, index) => (
                  <tr key={index} className="text-center border-t">
                    <td className="border p-2 text-left">{skill.name}</td>
                    <td className="border p-2">{skill.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
          <div className="text-center mt-4">
            <p><strong>Position:</strong> {studentPosition || "__"}</p>
            <p><strong>Total Number in Class:</strong> {classSize || "__"} </p>
          </div>
        </div>

        {/* REMARK & SIGNATURE */}
        <div className="mt-4 border p-3 rounded-md">
          <h3 className="text-md font-semibold">Class Teacher's Remark</h3>
          <p className="italic">"A wonderful job! Keep up the good work."</p>
        </div>

        {/* SCHOOL FOOTER */}
        <div className="mt-4 border-t pt-2 text-center text-sm font-semibold">
          <p>"We Offer Excellence in Education"</p>
          <p>Signed: ________________ (Principal)</p>
        </div>
      </div>

      {/* PRINT BUTTON */}
      <div className="text-center mt-4">
        <button onClick={handlePrint} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
          Print Result
        </button>
      </div>
    </div>
  );
};

export default ResultDisplay;
