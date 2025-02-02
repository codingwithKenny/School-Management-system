"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import { createStudent, updateStudent } from "@/lib/actions";
import Image from "next/image";

const studentSchema = z.object({
  surname: z.string().min(2, "Surname is required"),
  name: z.string().min(2, "Name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  sex: z.enum(["MALE", "FEMALE"], { message: "Select your gender" }),
  img: z.instanceof(File).optional(),
  address: z.string().optional(),
  sessionId: z.string().min(1, "Session ID is required"),
  gradeId: z.string().min(1, "Grade ID is required"),
  classId: z.string().min(1, "Class ID is required"),
  parentId: z.string().min(1, "Parent ID is required"),
});

const StudentForm = ({ type, data, availableSubjects }) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      ...data,
      subjects: data?.subjects?.map((s) => s.subjectId) || [],
    },
  });

  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [serverError, setServerError] = useState("");

  // ✅ Initialize selected subjects when editing
  useEffect(() => {
    if (data?.subjects) {
      setSelectedSubjects(data.subjects.map((s) => s.subjectId));
      setValue(
        "subjects",
        data.subjects.map((s) => s.subjectId)
      );
    }
  }, [data, setValue]);

  // ✅ Handle subject selection
  const handleSubjectChange = (e) => {
    const selectedId = parseInt(e.target.value);
    if (!selectedSubjects.includes(selectedId)) {
      const updatedSubjects = [...selectedSubjects, selectedId];
      setSelectedSubjects(updatedSubjects);
      setValue("subjects", updatedSubjects);
    }
  };

  // ✅ Handle subject removal
  const handleRemoveSubject = (subjectId) => {
    const updatedSubjects = selectedSubjects.filter((id) => id !== subjectId);
    setSelectedSubjects(updatedSubjects);
    setValue("subjects", updatedSubjects);
  };

  // ✅ Handle form submission
  const onSubmit = handleSubmit(async (formData) => {
    console.log("🟢 Form Submitted:", formData);

    try {
      let response;

      // Prepare data (Ensure subjects are sent correctly)
      const requestData = {
        ...formData,
        subjects: selectedSubjects,
      };

      if (type === "create") {
        response = await createStudent(requestData);
      } else if (type === "update" && data?.id) {
        response = await updateStudent(data.id, requestData);
      } else {
        console.error("❌ No student ID found for update.");
        return;
      }

      console.log("Response:", response);

      if (response.success) {
        alert(`✅ Student ${type === "create" ? "created" : "updated"} successfully!`);
        window.location.reload();
      } else {
        setServerError(response.error);
      }
    } catch (error) {
      console.error("❌ Error submitting form:", error);
      setServerError("An unexpected error occurred. Please try again.");
    }
  });

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Add New Student" : "Update Student"}
      </h1>

      {serverError && <p className="text-red-500 text-sm">{serverError}</p>}

      <div className="flex flex-wrap justify-between gap-2">
        <InputField label="Surname" name="surname" register={register} error={errors.surname} />
        <InputField label="Name" name="name" register={register} error={errors.name} />
        <InputField label="Username" name="username" register={register} error={errors.username} />
        <InputField label="Address" name="address" register={register} error={errors.address} />
      </div>

      {/* Sex Selection */}
      <label className="block">Sex</label>
      <select {...register("sex")} className="border rounded p-2 w-full" defaultValue={data?.sex || "MALE"}>
        <option value="MALE">Male</option>
        <option value="FEMALE">Female</option>
      </select>
      {errors.sex && <p className="text-red-500">{errors.sex.message}</p>}

      {/* Related IDs */}
      <InputField label="Session ID" name="sessionId" register={register} error={errors.sessionId} />
      <InputField label="Grade ID" name="gradeId" register={register} error={errors.gradeId} />
      <InputField label="Class ID" name="classId" register={register} error={errors.classId} />
      <InputField label="Parent ID" name="parentId" register={register} error={errors.parentId} />

      {/* Subjects Selection */}
      <label className="block">Subjects</label>
      <select className="border rounded p-2 w-full" onChange={handleSubjectChange}>
        <option value="">-- Select Subject --</option>
        {availableSubjects?.map((subject) => (
          <option key={subject.id} value={subject.id}>
            {subject.name}
          </option>
        ))}
      </select>

      {/* Display selected subjects */}
      <div className="flex flex-wrap gap-2 mt-2">
        {selectedSubjects?.map((subjectId) => {
          const subject = availableSubjects.find((s) => s.id === subjectId);
          return (
            <span key={subjectId} className="bg-gray-200 px-2 py-1 rounded-md text-sm flex items-center">
              {subject?.name}
              <button
                type="button"
                className="ml-2 text-red-500 font-bold"
                onClick={() => handleRemoveSubject(subjectId)}
              >
                ×
              </button>
            </span>
          );
        })}
      </div>

      {/* File Upload */}
      <div className="flex flex-col gap-2 w-full md:w-1/4 justify-center">
        <label className="text-xs text-gray-500 flex items-center cursor-pointer gap-2" htmlFor="img">
          <Image src="/upload.png" alt="" width={28} height={28} />
          <span>Upload Image</span>
        </label>
        <input
          type="file"
          id="img"
          {...register("img")}
          className="ring-[1.5px] ring-gray-300 rounded-md p-2 text-sm hidden"
        />
        {errors.img && <p className="text-red-400 text-xs">{errors.img.message}</p>}
      </div>

      {/* Submit Button */}
      <button type="submit" className="bg-purple-400 rounded-md text-white p-2">
        {type === "create" ? "Add Student" : "Update"}
      </button>
    </form>
  );
};

export default StudentForm;
