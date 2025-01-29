"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../InputField";
import { subjectSchema } from "@/lib/formValidation";
import { createSubjectData } from "@/lib/actions";
import { useEffect, useState } from "react";

const SubjectForm = ({ type, data }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(subjectSchema),
  });

  // HANDLE SUCCESS AND ERROR MESSAGE
  const [state, setState] = useState({
    success: false,
    error: false,
  });
  const onSubmit = handleSubmit(async (data) => {
    try {
      const response = await createSubjectData(data); // Server action
      console.log("Form Data Submitted:", data);


      if (response.success) {
        setState({ success: true, error: false });
      } else {
        setState({ success: false, error: true });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setState({ success: false, error: true });
    }
  });

  useEffect(() => {
    if (state.success) {
      setTimeout(() => {
        window.location.reload(); // Full-page reload if needed
      }, 300);
    }
  }, [state]);

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

      {/* Success and Error Messages */}
      {state.success && (
        <p className="text-green-500">Subject created successfully!</p>
      )}
      {state.error && <p className="text-red-500">Something went wrong.</p>}

      <button
        type="submit"
        className="bg-purple-400 rounded-md text-white p-2"
        disabled={state.success}
      >
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default SubjectForm;
