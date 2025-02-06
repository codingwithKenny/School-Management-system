"use client";
import { useState, useEffect } from "react";
import { fetchTeachers, updateSupervisor } from "@/lib/actions";

const ClassPage = ({ classId }) => {
  const [teachers, setTeachers] = useState([]);
  const [supervisor, setSupervisor] = useState(null);

  useEffect(() => {
    async function loadData() {
      setTeachers(await fetchTeachers());
    }
    loadData();
  }, []);

  const handleUpdateSupervisor = async () => {
    await updateSupervisor(classId, supervisor);
    alert("Supervisor updated!");
    window.location.reload();
  };

  return (
    <div>
      <h1 className="text-lg font-bold">Assign Supervisor</h1>
      <select
        value={supervisor}
        onChange={(e) => setSupervisor(e.target.value)}
        className="border p-2"
      >
        <option value="">Select Supervisor</option>
        {teachers.map((teacher) => (
          <option key={teacher.id} value={teacher.id}>
            {teacher.name} {teacher.surname}
          </option>
        ))}
      </select>
      <button onClick={handleUpdateSupervisor} className="bg-blue-500 text-white p-2 rounded-md mt-2">
        Update Supervisor
      </button>
    </div>
  );
};

export default ClassPage;
