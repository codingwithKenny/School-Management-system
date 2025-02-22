"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../InputField";
import { teacherSchema } from "@/lib/formValidation";
import { createTeacher, updateTeacher } from "@/lib/actions";
import Image from "next/image";
import SelectField from "../SelectField";
import { CldUploadWidget } from "next-cloudinary";
import { useDatabase } from "@/app/context/DatabaseProvider";
import { useRouter } from "next/navigation";

const TeacherForm = ({ type, data,setOpen }) => {
  const { databaseData } = useDatabase();
  const [message, setMessage] = useState(null);
  const [img, setImg] = useState(data?.img || ""); 
  const [loading, setLoading] = useState(false);
  const router =useRouter()

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
      subjects: data?.subjects?.map((s) => String(s.subjectId)) || [],
    },
  });

  useEffect(() => {
    if (data) {
      reset({
        ...data,
        sex: data?.sex || "",
        phone: data?.phone || "", // Add this line
        img: data?.img || "", // Ensure image is set
        subjects: data?.subjects?.map((s) => String(s.subjectId)) || [],
      });
  
      setValue("sex", data?.sex || "");
      setValue("phone", data?.phone || ""); // Ensure phone is set
      setValue("img", data?.img || ""); // Ensure image is set
      setValue("subjects", data?.subjects?.map((s) => String(s.subjectId)) || []);
    }
  }, [data, reset, setValue]);
  

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setValue("img", file.name);
    }
  };

  const onSubmit = handleSubmit(async (formData) => {
    console.log("Form Submitted:", formData);
    setLoading(true);

    try {
      let response;

      const requestData = {
        ...formData,
        subjects: formData.subjects.map((s) => Number(s)),
        img: formData.img || img?.secure_url || data?.img, // Ensure `img` is included

    
    
      };

      console.log("Request Data:", requestData); // Debugging step


      if (type === "create") {
        response = await createTeacher(requestData);
      } else if (type === "update" && data?.id) {
        response = await updateTeacher(data.id, requestData);
      } else {
        console.error("No teacher ID found for update.");
        return;
      }

      console.log("Response:", response);

      if (response.success) {
        setMessage({ 
          type: "success", 
          text: type === "create" ? "Teacher created successfully!" : "Teacher updated successfully!"
        });

        setTimeout(() => {
          setOpen(false)
          router.refresh()
        }, 2000);
      }
        else {
          if (response.error) {
            console.error(response.error)
            setMessage({
              type: "error",
              text: type === "create" ? response.error : response.error,
            });
            throw new Error(response.error || "Unknown error occurred.");
          }
        }
        setLoading(false);

       
    } catch (error) {
      console.error("Error submitting form:", error);
      setServerError("An unexpected error occurred. Please try again.");
    }
  });
  useEffect(() => {
    console.log("Received data:", data);
  }, [data]);
  

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Add New Teacher" : "Update Teacher"}
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


      <div className="flex flex-wrap justify-between gap-2">
        <InputField label="Surname" name="surname" register={register} error={errors.surname} />
        <InputField label="Name" name="name" register={register} error={errors.name} />
        <InputField label="Username" name="username" register={register} error={errors.username} />
       
        { type === "update" ? (
  <InputField 
    disabled={true}
    label="Email" 
    name="email" 
    register={register} 
    error={errors.email} 
    className="disabled:opacity-50 disabled:cursor-not-allowed"
  />
) : (
  <InputField 
    label="Email" 
    name="email" 
    register={register} 
    error={errors.email} 
  />
)}
        <InputField label="Password" name="password" type="password" register={register} error={errors.password} />
        <InputField label="Address" name="address" register={register} error={errors.address} />
      </div>
      <div className="flex gap-5 items-center justify-between">
      <div className="flex flex-col w-full md:w-1/4">
        <label className="text-xs text-gray-500">Sex</label>
        <select {...register("sex")} defaultValue={data?.sex || ""}>
  <option value="">Select gender</option>
  <option value="MALE">Male</option>
  <option value="FEMALE">Female</option>
</select>

        {errors.sex && <p className="text-red-500 text-xs">{errors.sex.message}</p>}
      </div>

      <InputField label="phone" name="phone" register={register} error={errors.address} />

      <SelectField
        name="subjects"
        label="Subjects"
        control={control}
        options={databaseData?.subjects || []}
        multiple={true}
        placeholder="-- Select Subjects --"
        error={errors.subjects}
      />


      </div>

      <CldUploadWidget uploadPreset="MuslimSchool" onSuccess={(result, { widget }) => {
  setImg(result.info.secure_url);
  setValue("img", result.info.secure_url); // Ensures img is included in formData
  widget.close();
}}>
  {({ open }) => (
    <div className="text-xs text-gray-500 flex items-center cursor-pointer gap-2" onClick={() => open()}>
      <Image src={img || data?.img || "/avatar.png"} alt="Upload" width={28} height={28} />
      <span>Upload Image</span>
    </div>
  )}
</CldUploadWidget>





      

      
      {/* <div className="flex flex-col justify-center">
        <label className="text-xs text-gray-500 flex items-center cursor-pointer gap-2" htmlFor="img">
          <Image src="/upload.png" alt="Upload" width={28} height={28} />
          <span>Upload Image</span>
        </label>
        <input type="file" id="img" accept="image/*" className="hidden" onChange={handleFileChange} />
        {errors.img && <p className="text-red-400 text-xs">{errors.img.message}</p>}
      </div> */}
      <button type="submit" disabled={loading} className="bg-purple-400 rounded-md text-white p-2 disabled:opacity-50 disabled:cursor-not-allowed">
      {loading ? "Saving..." : type === "create" ? "Add new Teacher" : "Update Teacher"}
      </button>
    </form>
  );
};

export default TeacherForm;
