"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useDatabase } from "@/app/context/DatabaseProvider";
import { assignClassTeacher, createClassTeacher } from "@/lib/actions";
import { useRouter } from "next/navigation";

const ClassTeacherForm = ({ type, data, memoizedClasses,setOpen }) => {
  const { databaseData, loading } = useDatabase(); // ✅ Use global loading state
  const DbTeachers = databaseData.teachers || [];
  const [isloading,setIsLoading] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  // ✅ State for selected class, grade, and session
  const [selectedClass, setSelectedClass] = useState(null);
 const router =useRouter()

  console.log(memoizedClasses, "class data available");

  // ✅ Update form values dynamically
  useEffect(() => {
    if (selectedClass) setValue("classId", selectedClass);
  }, [selectedClass, setValue]);

  // ✅ Form Submission State
  const [state, setState] = useState({
    success: false,
    error: false,
    errorMessage: "",
  });

  const onSubmit = handleSubmit(async (formData) => {
    console.log("📌 Form Submitted:", formData);
    setIsLoading(true);

    try {
      let response = await assignClassTeacher(formData);

      if (response?.success) {
        setState({ success: true, error: false, errorMessage: "" });
      } else {
        setState({ success: false, error: true, errorMessage: response?.error || "Error occurred" });
      }
    } catch (error) {
      setState({ success: false, error: true, errorMessage: "An unexpected error occurred." });
    }
  });

  useEffect(() => {
    if (state.success) {
      setTimeout(() => {
        setOpen(false);
        router.refresh();
            }, 500);
    }
  }, [state.success]);

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Assign Class Teacher" : "Update Assigned Class Teacher"}
      </h1>

      {/* ✅ Class Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Class</label>
        <select
          {...register("classId")}
          className="w-full p-2 border rounded-md bg-gray-100"
          onChange={(e) => setSelectedClass(parseInt(e.target.value, 10))}
        >
          <option value="">Select Class</option>
          {memoizedClasses?.length > 0 ? (
            memoizedClasses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))
          ) : (
            <option disabled>No classes available</option>
          )}
        </select>
      </div>

      {/* ✅ Assigned Teacher Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Assigned Teacher</label>
        <select {...register("teacherId")} className="w-full p-2 border rounded-md bg-gray-100">
          <option value="">Select Teacher</option>
          {loading ? (
            <option disabled>Loading...</option>
          ) : DbTeachers.length > 0 ? (
            DbTeachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} {t.surname}
              </option>
            ))
          ) : (
            <option disabled>No teachers available</option>
          )}
        </select>
      </div>

      {/* ✅ Success & Error Messages */}
      {state.success && <p className="text-green-500">Teacher {type === "create" ? "assigned" : "updated"} successfully!</p>}
      {state.error && <p className="text-red-500">{state.errorMessage || "Something went wrong."}</p>}

      {/* ✅ Submit Button */}
      <button
        type="submit"
        className="bg-purple-400 rounded-md text-white p-2 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isloading}
      >
        { isloading? "saving" :type === "create" ? "Assign" : "Update"}
      </button>
    </form>
  );
};

export default ClassTeacherForm;
