"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../InputField";
import SelectField from "../SelectField";
import Image from "next/image";
import { studentSchema } from "@/lib/formValidation";
import { useDatabase } from "@/app/context/DatabaseProvider";
import { createStudent, updateStudent } from "@/lib/actions";

const StudentForm = ({ type, data }) => {
  const { databaseData } = useDatabase();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState("");

  const activeSession = databaseData.sessions.find((s) => s.isCurrent); // ✅ Get active session
  const filteredGrades = databaseData.grades.filter((g) => g.sessionId === activeSession?.id); // ✅ Filter grades by active session
  const filteredClasses = databaseData.classes.filter((c) => c.gradeId === Number(selectedGrade));
  // const activeSession = databaseData.sessions.find((s) => s.isCurrent);
const filteredTerms = databaseData.terms.filter((t) => t.sessionId === activeSession?.id);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      ...data,
      subjects: data?.subjects?.map((s) => String(s.subjectId)) || [],
    },
  });
   
  

  useEffect(() => {
    if (data && databaseData) {
      reset({
        ...data,
        surname: data?.surname || "",
        name: data?.name || "",
        username: data?.username || "",
        email: data?.email || "",
        phone: data?.phone ? String(data.phone) : "",
        address: data?.address || "",
        sex: data?.sex ||"",
        paymentStatus: data?.paymentStatus || "",
        termId: data?.termId ? String(data.termId) : "", // ✅ Set default term if editing
        sessionId: data?.sessionId ? String(data.sessionId) : "",
        gradeId: data?.gradeId ? String(data.gradeId) : "",
        classId: data?.classId ? String(data.classId) : "",
        subjects: data?.subjects?.map((s) => String(s.subjectId)) || [],
      });

      // ✅ Ensure subjects are explicitly set after reset()
      setTimeout(() => {
        setValue(
          "subjects",
          data?.subjects?.map((s) => String(s.subjectId)) || []
        );
      }, 200); // Small delay ensures it runs after reset()
    }
  }, [data, databaseData, reset, setValue]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setValue("img", file.name);
    }
  };

  const onSubmit = handleSubmit(async (formData) => {
    console.log("🟢 Form submission started!");


    try {
      let response;

      const cleanedData = {
        ...formData,
        sessionId: Number(activeSession.id),
        termId: Number(formData.termId), // ✅ Ensure termId is included
        gradeId: Number(formData.gradeId),
        classId: Number(formData.classId),
        subjects: formData.subjects.map(Number),
        phone: formData.phone ? Number(formData.phone) : null,
        img: formData.img || null,
      };

      console.log("Submitting cleaned data:", cleanedData);
      console.log("Filtered Terms:", filteredTerms);
      console.log("Term ID from Form:", data?.termId);
      console.log("Cleaned Data before submission:", cleanedData);
      if (type === "create") {
        response = await createStudent(cleanedData);
      } else if (type === "update" && data?.id) {
        response = await updateStudent(data.id, cleanedData);
      } else {
        throw new Error("No student ID found for update.");
      }

      if (response.success) {
        setMessage({
          type: "success",
          text:
            type === "create"
              ? "Student created successfully!"
              : "Student updated successfully!",
        });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error(response.error || "Unknown error occurred.");
      }
    } catch (error) {
      console.error("Error in onSubmit:", error);
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="w-full max-w-4xl mx-auto md:p-6 md:h-auto h-screen overflow-y-auto md:overflow-visible">
      {databaseData ? (
        <form className="flex flex-col gap-2" onSubmit={onSubmit}>
          <h1 className="text-xl font-semibold">
            {type === "create" ? "Add New Student" : "Update Student"}
          </h1>
          {message && (
            <div
              className={`p-3 rounded-md text-sm ${
                message.type === "success"
                  ? "bg-green-100 text-green-700 border border-green-400"
                  : "bg-red-100 text-red-700 border border-red-400"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex flex-wrap justify-between gap-2 text-xs text-gray-500">
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
            <InputField
              label="Email"
              name="email"
              register={register}
              error={errors.email}
            />
            <InputField
              label="Address"
              name="address"
              register={register}
              error={errors.address}
            />
            <InputField
              label="Phone Number"
              name="phone"
              register={register}
              error={errors.phone}
            />
          </div>
          <div className="flex justify-between items-center gap-5 ">
            <div className="flex flex-col w-full md:w-1/4">
              <label className="text-xs text-gray-500">Sex</label>
              <select
                {...register("sex")}
                defaultValue={data?.sex ||""}
                className="border text-sm text-gray-500 mt-2 ring-[1.5px] ring-gray-300 rounded-md p-2 cursor-pointer"
              >
                <option value="MALE">-- Select Gender --</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
              {errors.sex && (
                <p className="text-red-500 text-xs">{errors.sex.message}</p>
              )}
            </div>

            <div className="flex flex-col w-full md:w-1/4">
              <label className="text-xs text-gray-500">Payment Status</label>
              <select
                {...register("paymentStatus")}
                defaultValue={data?.paymentStatus || ""}
                className="border text-sm text-gray-500 mt-2 ring-[1.5px] ring-gray-300 rounded-md p-2 cursor-pointer"
              >
                <option value="PAID">-- Status --</option>
                <option value="PAID">Paid</option>
                <option value="NOT_PAID">Not Paid</option>
                <option value="PARTIALLY_PAID">Partially Paid</option>
              </select>
              {errors.paymentStatus && (
                <p className="text-red-500 text-xs">
                  {errors.paymentStatus.message}
                </p>
              )}
            </div>
            <div className="flex flex-col w-full md:w-1/4">
              <label className="text-xs text-gray-500">Session</label>
              <select
                {...register("sessionId")}
                className="border text-sm text-gray-500 mt-2 ring-[1.5px] ring-gray-300 rounded-md p-2 cursor-pointer"
              >
                <option value="">-- Select Session --</option>
               <option value={activeSession.id}>{activeSession.name}</option>
              </select>
            </div>
          </div>
          <div className="flex justify-between items-center gap-5">
            <div className="flex flex-col w-full md:w-1/4">
              <label className="text-xs text-gray-500">Grade Level</label>
              <select
                {...register("gradeId")}
                className="border text-sm text-gray-500 mt-2 ring-[1.5px] ring-gray-300 rounded-md p-2 cursor-pointer"
                onChange={(e) => setSelectedGrade(e.target.value)}
              >
                <option value="">-- Grade Level --</option>
                {filteredGrades.map((g) => (
                  <option key={g.id} value={String(g.id)}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col w-full md:w-1/4">
              <label className="text-xs text-gray-500">Class</label>
              <select
                {...register("classId")}
                className="border text-sm text-gray-500 mt-2 ring-[1.5px] ring-gray-300 rounded-md p-2 cursor-pointer"
              >
                <option value="">-- Class --</option>
                {filteredClasses.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <SelectField
              name="subjects"
              label="Subjects"
              control={control}
              options={databaseData?.subjects || []}
              multiple
              placeholder="-- Select Subjects --"
              error={errors.subjects}
            />
          </div>
          <div className="flex flex-col justify-center">
          <div className="flex flex-col w-full md:w-1/4">
  <label className="text-xs text-gray-500">Term</label>
  <select
    {...register("termId")}
    className="border text-sm text-gray-500 mt-2 ring-[1.5px] ring-gray-300 rounded-md p-2 cursor-pointer"
    onChange={(e) => console.log("Selected Term ID:", e.target.value)} // Debugging
    defaultValue={data?.termId || ""}


  >
    <option value="">-- Select Term --</option>
    {filteredTerms.map((t) => (
      <option key={t.id} value={String(t.id)}>
        {t.name}
      </option>
    ))}
  </select>
</div>

            <label
              className="text-xs text-gray-500 flex items-center cursor-pointer gap-2"
              htmlFor="img"
            >
              <Image src="/upload.png" alt="Upload" width={28} height={28} />
              <span>Upload Image</span>
            </label>
            <input
              type="file"
              id="img"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {errors.img && (
              <p className="text-red-400 text-xs">{errors.img.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="bg-purple-400 rounded-md text-white p-2"
          >
            {loading
              ? "Submitting..."
              : type === "create"
              ? "Add Student"
              : "Update"}
          </button>
        </form>
      ) : null}
    </div>
  );
};

export default StudentForm;
