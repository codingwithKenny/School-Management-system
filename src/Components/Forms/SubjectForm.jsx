"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../InputField";
import { subjectSchema } from "@/lib/formValidation";
import { createSubject, updateSubject } from "@/lib/actions";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const SubjectForm = ({ type, data, setOpen }) => {
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(subjectSchema),
  });

  const assignedTeachers =
    data?.teachers?.length > 0
      ? data.teachers
          .map((t) => `${t.teacher.name} ${t.teacher.surname}`)
          .join(", ")
      : "No assigned teacher";

  // useEffect(() => {
  //   if (assignedTeacher) {
  //     setValue("teacherName", `${assignedTeacher.name} ${assignedTeacher.surname}`);
  //     setValue("teacherId", assignedTeacher.id);
  //   }
  // }, [assignedTeacher, setValue]);

  // ✅ State for success & error messages
  const [state, setState] = useState({
    success: false,
    error: false,
    errorMessage: "",
  });

  const onSubmit = handleSubmit(async (formData) => {
    console.log("Form Submitted:", formData);

    setLoading(true);

    try {
      let response;

      if (type === "create") {
        response = await createSubject(formData);
      } else if (type === "update" && data?.id) {
        response = await updateSubject(data.id, formData);
      } else {
        setState({
          success: false,
          error: true,
          errorMessage: "Invalid subject ID.",
        });
        return;
      }

      if (response.success) {
        setState({ success: true, error: false, errorMessage: "" });
      } else {
        setState({ success: false, error: true, errorMessage: response.error });
      }
    } catch (error) {
      setState({
        success: false,
        error: true,
        errorMessage: "An unexpected error occurred.",
      });
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
        {type === "create" ? "Create New Subject" : "Update Subject"}
      </h1>

      <div className="flex flex-wrap justify-between gap-2">
        <InputField
          label="Subject Name"
          name="name"
          register={register}
          error={errors.name}
          defaultValue={data?.name}
        />
      </div>

      {/* ✅ Assigned Teacher Display */}
      {type === "create" ? (
        <p className="text-sm text-purple-500">
          Teacher will be assigned shortly, go ahead and create a new subject.
        </p>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Assigned Teacher
          </label>
          <input
            type="text"
            {...register("teacherName")}
            defaultValue={assignedTeachers}
            className="w-full p-2 border rounded-md bg-gray-100"
            readOnly
          />
          <input type="hidden" {...register("teacherId")} />
        </div>
      )}

      {state.success && (
        <p className="text-green-500">
          Subject {type === "create" ? "created" : "updated"} successfully!
        </p>
      )}
      {state.error && (
        <p className="text-red-500">
          {state.errorMesdisage || "Something went wrong."}
        </p>
      )}

      <button
        type="submit"
        className="bg-purple-400 rounded-md text-white p-2 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? "Saving..." : type === "create" ? "Create" : "Update"}
        </button>
    </form>
  );
};

export default SubjectForm;
