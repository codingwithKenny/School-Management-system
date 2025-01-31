"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../InputField";
import { subjectSchema } from "@/lib/formValidation";
import { createSubject,updateSubject} from "@/lib/actions";
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

  const onSubmit = handleSubmit(async (formData) => {
    console.log("Form Submitted:", formData); // This should log when you submit

    try {
      let response;

      if (type === "create") {
        response = await createSubject(formData); // Server action
      } else if (type === "update" && data?.id) {
        response = await updateSubject(data.id, formData); // Server action
      } else {
        console.error("Error: No subject ID found for update.");
        setState({ success: false, error: true });
        return;
      }

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

      {/* Success and Error Messages */}
      {state.success && (
        <p className="text-green-500">Subject {type === "create" ? "created" : "updated"} successfully!</p>
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
