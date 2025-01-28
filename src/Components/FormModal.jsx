'use client';
import Image from "next/image";
import React, { useState } from "react";
import dynamic from "next/dynamic";

// Lazy load forms
const TeachersForm = dynamic(() => import("./Forms/TeachersForm"), {
  loading: () => <h1>Loading...</h1>,
});
const StudentForm = dynamic(() => import("./Forms/StudentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const SubjectForm = dynamic(() => import("./Forms/SubjectForm"), {
  loading: () => <h1>Loading...</h1>,
});

// Map table names to form components
const forms = {
  teacher: (type, data) => <TeachersForm type={type} data={data} />,
  student: (type, data) => <StudentForm type={type} data={data} />,
  subject: (type, data) => <SubjectForm type={type} data={data} />,
};

const FormModal = ({ table, type, data, id }) => {
  const size = type === "create" ? "w-7 h-7" : "w-8 h-8";
  const bgColor =
    type === "create"
      ? "#FAE27C"
      : type === "update"
      ? "#C3EBFA"
      : "#CFCEFF";

  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className={`${size} rounded-full flex items-center justify-center`}
        style={{ backgroundColor: bgColor }}
        onClick={() => setOpen(true)}
      >
        <Image src={`/${type}.png`} alt="" width={16} height={16} />
      </button>

      {open && (
        <div className="w-screen h-screen absolute top-0 left-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="rounded-md bg-white p-4 relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:[40%]">
            {/* Conditional Rendering */}
            {type === "delete" && id ? (
              <form className="p-4 flex flex-col gap-4">
                <span className="text-center font-medium">
                  All data will be lost. Are you sure you want to delete this{" "}
                  {table}?
                </span>
                <button className="bg-red-500 text-white py-2 px-4 rounded-md border-none self-center w-max">
                  Delete
                </button>
              </form>
            ) : (
              forms[table]?.(type, data) || <h1>Invalid Form</h1>
            )}

            {/* Close Button */}
            <div
              className="absolute top-4 right-4 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <Image src={"/close.png"} alt="Close" width={14} height={14} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
