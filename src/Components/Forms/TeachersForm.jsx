"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../InputField";
import { teacherSchema } from "@/lib/formValidation";
import { createTeacher, updateTeacher } from "@/lib/actions";
import Image from "next/image";

const TeacherForm = ({ type, data, subjects }) => {
  console.log(subjects),"subbbbbbbbbbbbbbbbbbbbbbbb"
  const {
    register,
    handleSubmit,
    setValue, // ✅ Ensures form values update dynamically
    getValues, // ✅ Helps retrieve form values
    formState: { errors },
  } = useForm({
    resolver: zodResolver(teacherSchema),
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
      ); // ✅ Ensure subjects are set in the form
    }
  }, [data, setValue]);

  // ✅ Handle subject selection
  const handleSubjectChange = (e) => {
    const selectedId = parseInt(e.target.value);

    if (!selectedSubjects.includes(selectedId)) {
      const updatedSubjects = [...selectedSubjects, selectedId];
      setSelectedSubjects(updatedSubjects);
      setValue("subjects", updatedSubjects); // ✅ Sync with react-hook-form
    }
  };

  // ✅ Handle subject removal
  const handleRemoveSubject = (subjectId) => {
    const updatedSubjects = selectedSubjects.filter((id) => id !== subjectId);
    setSelectedSubjects(updatedSubjects);
    setValue("subjects", updatedSubjects); // ✅ Keep the form updated
  };

  // ✅ Handle form submission
 // ✅ Handle form submission
const onSubmit = handleSubmit(async (formData) => {
  console.log("🟢 Form Submitted:", formData);

  try {
    let response;

    // Prepare data (Ensure subjects are sent correctly)
    const requestData = {
      ...formData,
      subjects: selectedSubjects, // ✅ Ensure correct format
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
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Add New Teacher" : "Update Teacher"}
      </h1>

      <div className="flex flex-wrap justify-between gap-2">
        <InputField
          label="Surname"
          name="surname"
          register={register}
          error={errors.surname}
        />
        <InputField
          label="Name"
          name="name"
          register={register}
          error={errors.name}
        />
        <InputField
          label="Username"
          name="username"
          register={register}
          error={errors.username}
        />
        {serverError && (
          <p className="text-red-500 text-sm">{serverError}</p> // ✅ Shows error message
        )}
        <InputField
          label="Email"
          name="email"
          register={register}
          error={errors.email}
        />
        {serverError && (
          <p className="text-red-500 text-sm">{serverError}</p> // ✅ Shows error message
        )}
        <InputField
          label="Password"
          name="password"
          type="password"
          register={register}
          error={errors.password}
        />
        <InputField
          label="Address"
          name="address"
          register={register}
          error={errors.address}
        />
      </div>

      {/* Sex Selection */}
      <label className="block">Sex</label>
      <select
        {...register("sex")}
        className="border rounded p-2 w-full"
        defaultValue={data?.sex || "Male"}
      >
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
      {errors.sex && <p className="text-red-500">{errors.sex.message}</p>}

      {/* Subjects Selection */}
      <label className="block">Subjects</label>
      <select
        className="border rounded p-2 w-full"
        onChange={handleSubjectChange}
      >
        <option value="">-- Select Subject --</option>
        {subjects.map((subject) => (
          <option key={subject.id} value={subject.id}>
            {subject.name}
          </option>
        ))}
      </select>

      {/* Display selected subjects as pills */}
      <div className="flex flex-wrap gap-2 mt-2">
        {selectedSubjects.map((subjectId) => {
          const subject = subjects.find((s) => s.id === subjectId);
          return (
            <span
              key={subjectId}
              className="bg-gray-200 px-2 py-1 rounded-md text-sm flex items-center"
            >
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

      {/* Hidden input to track selected subjects */}
      <input
        type="hidden"
        {...register("subjects")}
        value={JSON.stringify(selectedSubjects)}
      />
        <div className="flex flex-col gap-2 w-full md:w-1/4 justify-center">
             <label className="text-xs text-gray-500 flex items-center cursor-pointer gap-2" htmlFor='img'>
               <Image src ='/upload.png' alt='' width={28} height={28} />
               <span>Upload a Image</span>
               </label>
             <input
               type='file'
               id='img'
               {...register("img")}
               className="ring-[1.5px] ring-gray-300 rounded-md p-2 text-sm hidden"
               defaultValue={data?.img}/>
                 
               
             {errors?.message && (
               <p className="text-red-400 text-xs">{errors?.message.toString()}</p>
             )}
           </div>
      {/* Submit Button */}
      <button type="submit" className="bg-purple-400 rounded-md text-white p-2">
        {type === "create" ? "Add Teacher" : "Update"}
      </button>
    </form>
  );
};

export default TeacherForm;
