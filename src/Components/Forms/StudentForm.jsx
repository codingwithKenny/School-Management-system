"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../InputField";
import SelectField from "../SelectField";
import Image from "next/image";
import { studentSchema } from "@/lib/formValidation";
import { useDatabase } from "@/app/context/DatabaseProvider";
import { createStudent } from "@/lib/actions";

const StudentForm = ({ type, data }) => {
  const { databaseData } = useDatabase();
  console.log(databaseData.parents) // ✅ Use global database data
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      ...data,
      subjects: data?.subjects?.map((s) => s.subjectId) || [],
    },
  });

  // ✅ Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setValue("img", file.name);
    }
  };

  // ✅ Handle form submission
  const onSubmit = handleSubmit(async (formData) => {
    console.log("🟡 Form submission triggered!"); // ✅ Check if submission is happening
  
    if (!formData) {
      console.error("❌ No formData received!");
      return;
    }
  
    console.log("🔵 Form Data Before Processing:", formData); // ✅ Check raw form data
  
    setLoading(true);
    setMessage(null);
  
    try {
      console.log("🔍 Checking if parent exists in databaseData:", formData.parentName);
  
      const parentName = formData.parentName?.trim() || "";
  
      if (!parentName) {
        console.log("⚠ No parent name provided, student is self-sponsored.");
      }
  
      let parent = databaseData.parents.find((p) => p.name.toLowerCase() === parentName.toLowerCase());
  
      if (!parent && parentName) {
        console.log("🟢 Parent not found in databaseData, creating new parent...");
        const newParent = await createParent({ name: parentName });
  
        if (!newParent || !newParent.id) {
          throw new Error("Failed to create new parent.");
        }
  
        parent = newParent;
      }
  
      console.log("✅ Parent ID to use:", parent ? parent.id : null);
  
      const cleanedData = {
        ...formData,
        sessionId: Number(formData.sessionId),
        gradeId: Number(formData.gradeId),
        classId: Number(formData.classId),
        parentId: parent ? parent.id : null,
        subjects: formData.subjects.map(Number),
        img: formData.img || null,
      };
  
      console.log("🚀 Submitting cleaned data:", cleanedData);
  
      const result = await createStudent(cleanedData);
  
      if (result.success) {
        console.log("✅ Student Created Successfully:", result);
        setMessage({ type: "success", text: result.message });
      } else {
        console.log("❌ Error Creating Student:", result.error);
        setMessage({ type: "error", text: result.error });
      }
    } catch (error) {
      console.error("❌ Error submitting form:", error);
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  });
  
  
  
  

  return (
    <div className="w-full max-w-4xl mx-auto md:p-6 md:h-auto h-screen overflow-y-auto md:overflow-visible">
      <form className="flex flex-col gap-2" onSubmit={onSubmit}>
        <h1 className="text-xl font-semibold">
          {type === "create" ? "Add New Student" : "Update Student"}
        </h1>

        {/* ✅ Display Form Error Messages */}
        {message && <p className={`text-sm ${message.type === "error" ? "text-red-500" : "text-green-500"}`}>{message.text}</p>}

        {/* ✅ Input Fields */}
        <div className="flex flex-wrap justify-between gap-2 text-xs text-gray-500">
          <InputField label="Surname" name="surname" register={register} error={errors.surname} />
          <InputField label="Name" name="name" register={register} error={errors.name} />
          <InputField label="Username" name="username" register={register} error={errors.username} />
          <InputField label="Email" name="email" register={register} error={errors.email} />
          <InputField label="Address" name="address" register={register} error={errors.address} />
          <InputField label="Parent ID" name="parentId" register={register} error={errors.parentId} />
        </div>

        {/* ✅ Dropdown Selections */}
        <div className="flex flex-wrap justify-between items-center">
          {/* ✅ Gender Selection */}
          <SelectField
            name="sex"
            label="Sex"
            control={control}
            options={[
              { id: "MALE", name: "Male" },
              { id: "FEMALE", name: "Female" },
            ]}
            placeholder="-- Select Gender --"
            error={errors.sex} // ✅ Display errors
          />

          {/* ✅ Payment Status */}
          <SelectField
            name="paymentStatus"
            label="Payment Status"
            control={control}
            options={[
              { id: "PAID", name: "Paid" },
              { id: "NOT_PAID", name: "Not Paid" },
              { id: "PARTIALLY_PAID", name: "Partially Paid" },
            ]}
            placeholder="-- Select Payment --"
            error={errors.paymentStatus} // ✅ Display errors
          />

          {/* ✅ Subject Selection (Many-to-Many) */}
          <SelectField
            name="subjects"
            label="Subjects"
            control={control}
            options={databaseData.subjects}
            multiple={true}
            placeholder="-- Select Subjects --"
            error={errors.subjects} // ✅ Display errors
          />
        </div>

        <div className="flex flex-wrap justify-between items-center">
          {/* ✅ Session Selection */}
          <SelectField
  name="sessionId"
  label="Session"
  control={control}
  options={databaseData.sessions.map((s) => ({ id: String(s.id), name: s.name }))} // ✅ Ensure `id` is a string
  placeholder="-- Select Session --"
  error={errors.sessionId}
/>

<SelectField
  name="gradeId"
  label="Grade Level"
  control={control}
  options={databaseData.grades.map((g) => ({ id: String(g.id), name: g.name }))} // ✅ Ensure `id` is a string
  placeholder="-- Select Grade Level --"
  error={errors.gradeId}
/>

<SelectField
  name="classId"
  label="Class"
  control={control}
  options={databaseData.classes.map((c) => ({ id: String(c.id), name: c.name }))} // ✅ Ensure `id` is a string
  placeholder="-- Select Class --"
  error={errors.classId}
/>

        </div>

        {/* ✅ File Upload */}
        <div className="flex flex-col justify-center">
          <label className="text-xs text-gray-500 flex items-center cursor-pointer gap-2" htmlFor="img">
            <Image src="/upload.png" alt="Upload" width={28} height={28} />
            <span>Upload Image</span>
          </label>
          <input type="file" id="img" accept="image/*" className="hidden" onChange={handleFileChange} />
          {errors.img && <p className="text-red-400 text-xs">{errors.img.message}</p>}
        </div>

        {/* ✅ Submit Button */}
        <button type="submit" className="bg-purple-400 rounded-md text-white p-2" disabled={loading}>
          {loading ? "Submitting..." : type === "create" ? "Add Student" : "Update"}
        </button>
      </form>
    </div>
  );
};

export default StudentForm;
