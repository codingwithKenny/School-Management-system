"use client";
import { useDatabase } from "@/app/context/DatabaseProvider";
import Image from "next/image";
import React, { useMemo, useRef } from "react";
import StudentPerformanceChart from "./StudentPerfomance";

const ResultDisplay = ({
  filteredResults,
  terms,
  selectedTerm,
  studentInfo,
  selectedSession,
  selectedClass,
  selectedGrade,
}) => {
  const { databaseData } = useDatabase();
  const printRef = useRef();

  // POSITION SUFFIX
  const getOrdinalSuffix = (num) => {
    if (!num) return "__";
    const j = num % 10,
      k = num % 100;
    if (j === 1 && k !== 11) return `${num}st`;
    if (j === 2 && k !== 12) return `${num}nd`;
    if (j === 3 && k !== 13) return `${num}rd`;
    return `${num}th`;
  };
  // PRINT RESULT/DOWNLOAD PDF
  const handlePrint = () => {
    const printable = document.getElementById("printable-area");
    if (printable) {
      printable.style.transform = "scale(0.85)";
      printable.style.transformOrigin = "top left";

      setTimeout(() => {
        window.print();
        printable.style.transform = "scale(1)";
      }, 300);
    }
  };

  const sessionId = databaseData.sessions?.find(
    (s) => s.name === selectedSession
  )?.id;
  const selectedTermName = databaseData.terms?.find(
    (t) => t.id === selectedTerm
  )?.name;

  // GET CLASSRECORD FOR POSITION,REMARK AND PROMOTION
  const studentClassRecord = useMemo(() => {
    return (
      databaseData.classRecord?.filter(
        (record) =>
          record.studentId === studentInfo.id &&
          record.termId === selectedTerm &&
          record.sessionId === sessionId
      ) || []
    );
  }, [databaseData.classRecord, studentInfo.id, selectedTerm, sessionId]);

  const calculatePerformance = (ca1, ca2, exam) => {
    const total =
      (parseFloat(ca1) || 0) + (parseFloat(ca2) || 0) + (parseFloat(exam) || 0);
    if (total >= 75) return "Excellent";
    if (total >= 70) return "Very Good";
    if (total >= 60) return "Good";
    if (total >= 50) return "Pass";
    return "Fail";
  };

  // GET TOTAL NUMBER IN CLASS PER TERM
  const totalStudentsInClass = useMemo(() => {
    return (
      databaseData.classRecord?.filter(
        (record) =>
          record.class.name === selectedClass &&
          record.sessionId === sessionId &&
          record.termId === selectedTerm
      ).length || 0
    );
  }, [databaseData.classRecord, selectedClass, sessionId, selectedTerm]);

  const studentTotalScore = useMemo(() => {
    return filteredResults.reduce((sum, result) => sum + result.totalScore, 0);
  }, [filteredResults]);

  const maxTotalScore = useMemo(() => {
    return filteredResults.length * 100;
  }, [filteredResults]);

  const studentPercentage =
    maxTotalScore > 0
      ? ((studentTotalScore / maxTotalScore) * 100).toFixed(2)
      : 0;

  // CONFIRM PAYMENT HAS BEEN MADE  BEFORE DISPLAYING RESULT
  const isPaymentComplete = useMemo(() => {
    return databaseData.paymentHistory?.some(
      (payment) =>
        payment.studentId === studentInfo.id &&
        payment.sessionId === sessionId &&
        payment.termId === selectedTerm &&
        payment.status === "PAID" &&
        (payment.amount !== null || payment.amount === null)
    );
  }, [databaseData.paymentHistory, studentInfo.id, sessionId, selectedTerm]);

  return (
    <div className="p-3 bg-gray-100 relative">
      {!isPaymentComplete ? (
        <div className="p-4 bg-red-100 text-center text-red-600 font-semibold">
          Payment for {selectedTermName} Term is not complete. Please complete
          the payment to access the result.
        </div>
      ) : (
        <div>
          <div
            ref={printRef}
            id="printable-area"
            className="bg-white p-4 shadow-lg border border-gray-300 print:w-full bg-opacity-10"
            style={{
              backgroundImage: "url('/logo.png')",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "30%",
              backgroundColor: "rgba(255, 255, 255, 0.96)",
              backgroundBlendMode: "lighten",
            }}
          >
            {/* SCHOOL HEADER */}
            <div className="flex flex-wrap justify-between items-center border-b pb-2">
              <Image src="/logo.png" width={60} height={60} alt="School Logo" />
              <div className="text-center flex-1">
                <h1 className="text-2xl font-bold uppercase">
                  MUSLIM GROUP OF SCHOOLS
                </h1>
                <p className="text-sm italic font-semibold">"ALLAH IS GREAT"</p>
                <p className="text-xs">
                  Behind Premier Tobacco, Ileko Alafin, Odo Eran, Owode, Oyo
                </p>
                <p className="text-xs font-semibold">
                  Call: 09036391952 | Website: www.muslimgroupofschool.com
                </p>
              </div>
              <Image
                src={studentInfo?.img || "/default-avatar.png"}
                width={60}
                height={60}
                alt="Student Photo"
                className="border p-1"
              />
            </div>

            <p className="border border-black w-full mt-2 text-center text-sm font-bold uppercase">
              {selectedTermName} Academic Report
            </p>

            {/* STUDENT INFORMATION */}
            <div className="flex flex-wrap justify-between border border-black text-xs bg-white p-2">
              <div>
                <p>
                  <strong>Name:</strong> {studentInfo?.surname}{" "}
                  {studentInfo?.name}
                </p>
                <p>
                  <strong>Class:</strong> {selectedClass}
                </p>
                <p>
                  <strong>Admission No:</strong> {studentInfo?.username}
                </p>
              </div>
              <div>
                <p>
                  <strong>Grade:</strong> {selectedGrade}
                </p>
                <p>
                  <strong>Session:</strong> {selectedSession}
                </p>
                <p>
                  <strong>Times Present:</strong> ____
                </p>
              </div>
            </div>

            {/* RESULT TABLE */}
            <div className="flex ">
              <div className=" w-[70%]">
                <table className="w-full border-collapse border border-gray-300 text-xs mt-3">
                  <thead>
                    <tr className="bg-gray-200 text-center">
                      <th className="border p-1">Subject</th>
                      <th className="border p-1">CA1</th>
                      <th className="border p-1">CA2</th>
                      <th className="border p-1">Exam</th>
                      <th className="border p-1">Total</th>
                      <th className="border p-1">Avg</th>
                      <th className="border p-1">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults
                      .filter((result) => result.subject)
                      .map((result, index) => (
                        <tr key={index} className="text-center border-t">
                          <td className="border p-1 text-left">
                            {result.subject.name}
                          </td>
                          <td className="border p-1">
                            {result.firstAssessment}
                          </td>
                          <td className="border p-1">
                            {result.secondAssessment}
                          </td>
                          <td className="border p-1">{result.examScore}</td>
                          <td className="border p-1 font-bold">
                            {result.totalScore}
                          </td>
                          <td className="border p-1">
                            {(result.totalScore / 3).toFixed(2)}
                          </td>
                          <td className="border p-1 font-semibold">
                            {calculatePerformance(
                              result.firstAssessment,
                              result.secondAssessment,
                              result.examScore
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="w-[30%] ml-4">
                <table className="w-full border-collapse border border-gray-300 text-sm bg-white mt-2">
                  <thead>
                    <tr className="bg-gray-200 text-center">
                      <th className="border p-2">
                        {" "}
                        <h3 className="text-md font-semibold text-center">
                          Affective Skills
                        </h3>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-center border-t">
                      <td className="border p-2 text-left">Attentiveness</td>
                    </tr>
                    <tr className="text-center border-t">
                      <td className="border p-2 text-left">Neatness</td>
                    </tr>
                    <tr className="text-center border-t">
                      <td className="border p-2 text-left">Punctuality</td>
                    </tr>
                    <tr className="text-center border-t">
                      <td className="border p-2 text-left">Honesty</td>
                    </tr>
                    <tr className="text-center border-t">
                      <td className="border p-2 text-left">Tolerance</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap justify-around items-center border p-2 text-xs">
                {/* Position & Promotion Section */}
                <div className="border w-[50%] text-center">
                  {studentClassRecord?.map((record) => (
                    <p
                      key={record.id}
                      className="italic border border-gray-300 p-1"
                    >
                      <strong>Position:</strong>{" "}
                      {getOrdinalSuffix(record.position)}
                    </p>
                  ))}
                  {selectedTermName === "Third Term" &&
                    studentClassRecord?.map((record) => (
                      <p
                        key={record.id}
                        className="italic border border-gray-300 p-1"
                      >
                        <strong>Promotion:</strong> {record.promotion}
                      </p>
                    ))}

                  <p className="italic border border-gray-300 p-1">
                    <strong>Total Number in Class:</strong>{" "}
                    {totalStudentsInClass}
                  </p>
                </div>

                {/* Co-Curricular Table */}
                <div className="w-[20%] ml-20">
                  <table className="w-full border-collapse border border-gray-300 text-xs bg-white">
                    <thead>
                      <tr className="bg-gray-200 text-center">
                        <th className="border p-1">CO-CURRICULAR</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="border p-1 text-left">Sports</td>
                      </tr>
                      <tr className="border-t">
                        <td className="border p-1 text-left">Music</td>
                      </tr>
                      <tr className="border-t">
                        <td className="border p-1 text-left">Debate</td>
                      </tr>
                      <tr className="border-t">
                        <td className="border p-1 text-left">Honesty</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {/* PERFORMANCE CHART
            <div className="mt-2"></div> */}

            {/* PERFORMANCE & REMARK */}
            <div className="flex flex-wrap justify-around items-center border p-2 mt-2 text-xs">
              <div className="border p-2 text-xs mt-2">
                {studentClassRecord?.map((record) => (
                  <div key={record.id}>
                    <strong>Teacher's Remark:</strong>
                    <p className="px-5 pb-10">{record.remark}</p>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <strong>Student Percentage:</strong>
                <p> {studentPercentage}%</p>
              </div>
              <div className="w-70">
                <h3 className="text-sm font-semibold">
                  {studentInfo?.name} percentage (%) Chart
                </h3>

                <StudentPerformanceChart
                  studentPercentage={studentPercentage}
                />
              </div>
            </div>

            {/* REMARK & SIGNATURE */}

            {/* SCHOOL FOOTER */}
            <div className="mt-3 border-t pt-2 text-center text-xs font-semibold">
              <p>"We Offer Excellence in Education"</p>
              <p>Signed: ________________ (Principal)</p>
            </div>
          </div>
          {/* PRINT BUTTON */}
          <div className="text-center mt-3">
            <button
              onClick={handlePrint}
              className="bg-blue-600 text-white px-4 py-1 rounded text-xs hover:bg-blue-700"
            >
              Print Result
            </button>
          </div>{" "}
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;
