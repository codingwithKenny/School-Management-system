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
        <div className="rounded-md bg-white p-4">
            hello
        </div>
        </div>}
    </>
  );
};

export default FormModal;
