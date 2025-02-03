"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../InputField";
import { teacherSchema } from "@/lib/formValidation";
import { createTeacher, updateTeacher } from "@/lib/actions";
import Image from "next/image";
import SelectField from "../SelectField";
import { useDatabase } from "@/app/context/DatabaseProvider";

const TeacherForm = ({ type, data }) => {
  const { databaseData } = useDatabase();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      ...data,
      subjects: data?.subjects?.map((s) => String(s.subjectId)) || [], // ✅ Ensure correct format
    },
  });

  // ✅ Update form when `data` changes (Fixes issues with re-rendering)
  useEffect(() => {
    if (data) {
      reset({
        ...data,
        sex: data?.sex || "MALE", // ✅ Pre-fill sex
        subjects: data?.subjects?.map((s) => String(s.subjectId)) || [], // ✅ Pre-fill subjects
      });
    }
  }, [data, reset]);
  

  // ✅ Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setValue("img", file.name);
    }
  };

  // ✅ Handle form submission
  const onSubmit = handleSubmit(async (formData) => {
    console.log("🟢 Form Submitted:", formData);

    try {
      let response;

      // Prepare data (Ensure subjects are sent correctly)
      const requestData = {
        ...formData,
        subjects: formData.subjects.map((s) => Number(s)), // ✅ Convert subjects to numbers
      };

      if (type === "create") {
        response = await createTeacher(requestData);
      } else if (type === "update" && data?.id) {
        response = await updateTeacher(data.id, requestData);
      } else {
        console.error("❌ No teacher ID found for update.");
        return;
      }

      console.log("Response:", response);

      if (response.success) {
        alert(`✅ Teacher ${type === "create" ? "created" : "updated"} successfully!`);
        window.location.reload(); // ✅ Refresh page after success
      } else {
        setServerError(response.error); // ✅ Display error message properly
      }
    } catch (error) {
      console.error("❌ Error submitting form:", error);
      setServerError("An unexpected error occurred. Please try again.");
    }
  });

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Add New Teacher" : "Update Teacher"}
      </h1>

      <div className="flex flex-wrap justify-between gap-2">
        <InputField label="Surname" name="surname" register={register} error={errors.surname} />
        <InputField label="Name" name="name" register={register} error={errors.name} />
        <InputField label="Username" name="username" register={register} error={errors.username} />
        <InputField label="Email" name="email" register={register} error={errors.email} />
        <InputField label="Password" name="password" type="password" register={register} error={errors.password} />
        <InputField label="Address" name="address" register={register} error={errors.address} />
      </div>

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
        error={errors.sex}
      />

      {/* ✅ Subjects Selection */}
      <SelectField
        name="subjects"
        label="Subjects"
        control={control}
        options={databaseData.subjects}
        multiple={true}
        placeholder="-- Select Subjects --"
        error={errors.subjects}
      />

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
      <button type="submit" className="bg-purple-400 rounded-md text-white p-2">
        {type === "create" ? "Add Teacher" : "Update"}
      </button>
    </form>
  );
};

export default TeacherForm;
