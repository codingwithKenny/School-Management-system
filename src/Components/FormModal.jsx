'use client';

import Image from "next/image";
import React, { useState } from "react";

const FormModal = ({ table, type, data, id }) => {
  const size = type === "create" ? "w-7 h-7" : "w-8 h-8";
  const bgColor =
    type === "create"
      ? "#FAE27C"
      : type === "update"
      ? "#C3EBFA"
      : "#CFCEFF";

      const [open,setOpen] = useState(false)

      const Form = () =>{
        return type === 'delete' && id ? (
            <form action="" className="p-4 flex flex-col gap-4">
                <span className="text-center font-medium">All data will be lost.Are you sure you want to delete this {table}</span>
                <button className="bg-red-500 text-white py-2 px-4 rounded-md border-none self-center w-max">Delete</button>
            </form>
        ):(
            'update form or create form'
        )
      }

  return (
    <>
      <button
        className={`${size} rounded-full flex items-center justify-center`}
        style={{ backgroundColor: bgColor }} // Apply bgColor as inline style
        onClick={() => setOpen(true)} // Open modal on button click
      >
        <Image src={`/${type}.png`} alt="" width={16} height={16} />
      </button>
      {open && <div className="w-screen h-screen absolute top-0 left-0 bg-black bg-opacity-60 z-5 flex items-center justify-center">
        <div className="rounded-md bg-white p-4 relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:[40%]">
            <Form />
            <div className="absolute top-4 right-4 cursor-pointer " onClick={() => setOpen(false)}>
                <Image src={'/close.png'} alt="" width={14} height={14} />
            </div>
        </div>
        </div>}
    </>
  );
};

export default FormModal;
