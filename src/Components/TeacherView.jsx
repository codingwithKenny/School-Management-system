import { useState, useEffect } from "react";
import { fetchTerms } from "@/lib/actions"; // ✅ Fetch terms dynamically based on session

const TeacherView = ({ students, memoizedClasses, selectedClass, selectedSession }) => {
  const [terms, setTerms] = useState([]); // ✅ Store terms for the selected session
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [remarks, setRemarks] = useState({});
  const [positions, setPositions] = useState({});
  const [promotions, setPromotions] = useState({});

  // ✅ Fetch terms dynamically when a session is selected
  useEffect(() => {
    if (!selectedSession) return;

    const loadTerms = async () => {
      const sessionTerms = await fetchTerms(selectedSession);
      setTerms(sessionTerms);
    };

    loadTerms();
  }, [selectedSession]);

  const handleInputChange = (e, studentId, field) => {
    const value = e.target.value;
    if (!selectedTerm) {
      alert("Please select a term first.");
      return;
    }

    if (field === "remark") {
      setRemarks((prev) => ({
        ...prev,
        [`${studentId}-${selectedTerm}`]: value,
      }));
    } else if (field === "position") {
      setPositions((prev) => ({
        ...prev,
        [`${studentId}-${selectedTerm}`]: value,
      }));
    } else if (field === "promotion") {
      setPromotions((prev) => ({
        ...prev,
        [`${studentId}`]: value,
      }));
    }
  };

  const handleSaveRemarks = async () => {
    if (!selectedTerm) {
      alert("Please select a term before saving.");
      return;
    }

    try {
      const updatedData = students.map((student) => ({
        studentId: student.id,
        termId: selectedTerm,
        remark: remarks[`${student.id}-${selectedTerm}`] || "",
        position: positions[`${student.id}-${selectedTerm}`] || "",
      }));

      console.log("Saving remarks and positions:", updatedData);
      alert(`Remarks and positions saved successfully for Term ${selectedTerm}!`);
    } catch (error) {
      console.error("Error saving remarks and positions:", error);
      alert("Failed to save data.");
    }
  };

  const handleSavePromotion = async () => {
    if (selectedTerm !== 3) {
      alert("Promotion is only available in the Third Term.");
      return;
    }

    try {
      const updatedPromotionData = students.map((student) => ({
        studentId: student.id,
        promotion: promotions[student.id] || "NOT_SET",
      }));

      console.log("Saving promotion data:", updatedPromotionData);
      alert("Promotions saved successfully!");
    } catch (error) {
      console.error("Error saving promotions:", error);
      alert("Failed to save promotions.");
    }
  };

  return (
    <div className="overflow-x-auto bg-white p-4 rounded-lg shadow-md">
      {/* Term Selection Dropdown (Fetched Dynamically) */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700">👨‍🎓 Students</h2>
        <div className="mb-4">
          <label className="text-xs text-gray-500 mr-4">Select Term</label>
          <select
            className="border text-sm text-gray-500 mt-2 ring-1 ring-gray-300 rounded-md p-2 cursor-pointer"
            value={selectedTerm || ""}
            onChange={(e) => setSelectedTerm(parseInt(e.target.value, 10))}
          >
            <option value="">-- Select Term --</option>
            {terms.map((term) => (
              <option key={term.id} value={term.id}>
                {term.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-2 p-2 bg-indigo-100 rounded-md text-center">
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
      <table className="w-full bg-white rounded-lg shadow-md">
        <thead className="bg-purple-500 text-white">
          <tr>
            <th className="p-3 text-left">Student</th>
            <th className="p-3 text-left">Remark</th>
            <th className="p-3 text-left w-20">Position</th>
            {selectedTerm === 3 ? <th className="p-3 text-left">Promotion</th> : null}
          </tr>
        </thead>
        <tbody>
          {students.length > 0 ? (
            students.map((student) => (
              <tr key={student.id} className="border-b border-gray-300">
                <td className="p-3">{`${student.surname} ${student.name}`}</td>

                <td className="p-3">
                  <input
                    type="text"
                    placeholder="Enter remark..."
                    className="border p-2 w-full rounded-md focus:ring-2 focus:ring-indigo-500"
                    value={remarks[`${student.id}-${selectedTerm}`] || ""}
                    onChange={(e) => handleInputChange(e, student.id, "remark")}
                  />
                </td>

                <td className="p-3">
                  <input
                    type="number"
                    min="1"
                    placeholder="Pos"
                    className="border p-2 w-20 text-center rounded-md focus:ring-2 focus:ring-indigo-500"
                    value={positions[`${student.id}-${selectedTerm}`] || ""}
                    onChange={(e) => handleInputChange(e, student.id, "position")}
                  />
                </td>

                {selectedTerm === 3 ? (
                  <td className="p-3">
                    <select
                      className="border p-2 w-full rounded-md focus:ring-2 focus:ring-indigo-500"
                      value={promotions[student.id] || ""}
                      onChange={(e) => handleInputChange(e, student.id, "promotion")}
                    >
                      <option value="">--</option>
                      <option value="Promote">Promote</option>
                      <option value="Repeat">Repeat</option>
                    </select>
                  </td>
                ) : null}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={selectedTerm === 3 ? "4" : "3"}
                className="text-gray-500 text-center p-4"
              >
                No students found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Save Buttons */}
      <button
        className="bg-blue-600 mt-6 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        onClick={handleSaveRemarks}
      >
        Save Remarks & Positions
      </button>

      {selectedTerm === 3 && (
        <button
          className="bg-green-600 mt-6 ml-4 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          onClick={handleSavePromotion}
        >
          Save Promotions
        </button>
      )}
    </div>
  );
};

export default TeacherView;
