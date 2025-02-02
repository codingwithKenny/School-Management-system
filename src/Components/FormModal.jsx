"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { deleteTeacher, deleteStudent, deleteSubject, fetchSubjects } from "@/lib/actions"; 

// Lazy load forms dynamically
const TeachersForm = dynamic(() => import("./Forms/TeachersForm"), {
  loading: () => <h1>Loading...</h1>,
});
const StudentForm = dynamic(() => import("./Forms/StudentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const SubjectForm = dynamic(() => import("./Forms/SubjectForm"), {
  loading: () => <h1>Loading...</h1>,
});

// ✅ Map table names to form components
const forms = {
  teacher: (type, data, subjects) => <TeachersForm type={type} data={data} subjects={subjects} />,
  student: (type, data) => <StudentForm type={type} data={data} />,
  subject: (type, data) => <SubjectForm type={type} data={data} />,
};

// ✅ Map delete functions dynamically
const deleteFunctions = {
  teacher: deleteTeacher,
  student: deleteStudent,
  subject: deleteSubject,
};

const FormModal = ({ table, type, data, id }) => {
  const size = type === "create" ? "w-7 h-7" : "w-8 h-8";
  const bgColor = type === "create" ? "#FAE27C" : type === "update" ? "#C3EBFA" : "#CFCEFF";

  const [open, setOpen] = useState(false);
  const [state, setState] = useState({ success: false, error: false });
  const [subjects, setSubjects] = useState([]); 

  // ✅ Fetch Subjects only when dealing with teacher
  useEffect(() => {
    if (table === "teacher") {
      const getSubjects = async () => {
        try {
          const data = await fetchSubjects();
          setSubjects(data);
          console.log("Subjects fetched:", data);
        } catch (error) {
          console.error("Error fetching subjects:", error);
        }
      };
      getSubjects();
    }
  }, [table]); 

  // ✅ Handle dynamic entity deletion
  const handleDelete = async () => {
    if (!id) return console.error(`❌ No ID provided for ${table} deletion.`);

    try {
      console.log(`🟡 Deleting ${table} with ID:`, id);
      const deleteFunction = deleteFunctions[table]; 

      if (!deleteFunction) return console.error(`❌ No delete function for ${table}.`);

      const result = await deleteFunction(id);

      if (result.success) {
        console.log(`✅ ${table.charAt(0).toUpperCase() + table.slice(1)} successfully deleted.`);
        setState({ success: true, error: false });
        setOpen(false); 
        window.location.reload(); // ✅ Refresh UI after delete
      } else {
        console.error(`❌ Failed to delete ${table}.`);
        setState({ success: false, error: true });
      }
    } catch (error) {
      console.error(`❌ Error deleting ${table}:`, error);
      setState({ success: false, error: true });
    }
  };

  return (
    <>
      <button
        className={`${size} rounded-full flex items-center justify-center`}
        style={{ backgroundColor: bgColor }}
        onClick={() => setOpen(true)}
      >
        <Image src={`/${type}.png`} alt="" width={16} height={16} />
      </button>

      {open && (
        <div className="w-screen h-screen absolute top-0 left-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="rounded-md bg-white p-4 relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
            {type === "delete" && id ? (
              <div className="p-4 flex flex-col gap-4">
                <span className="text-center font-medium">
                  This {table} will be deactivated. Are you sure?
                </span>
                <button
                  className="bg-red-500 text-white py-2 px-4 rounded-md border-none self-center w-max"
                  onClick={handleDelete}
                >
                  Delete
                </button>
                {state.error && <p className="text-red-500 text-center">Failed to delete. Try again.</p>}
              </div>
            ) : (
              forms[table]?.(type, data, subjects) || <h1>Invalid Form</h1>
            )}

            <div className="absolute top-4 right-4 cursor-pointer" onClick={() => setOpen(false)}>
              <Image src="/close.png" alt="Close" width={14} height={14} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
