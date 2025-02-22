import Image from "next/image";
import React from "react";

const Cards = ({ type , data, color,session }) => {
  return (
    <div
      className=" p-4 flex-1 min-w-[130px] items-center"
      style={{ backgroundColor: color }}
    >
      <div className="flex justify-between gap-4 items-center">
        <span className="bg-white rounded-full text-green-600 text-[10px] p-2">{session}</span>
      </div>
      <h1 className="text-2xl font-semibold my-2">{data}</h1>
      <h3 className="text-sm text-gray-500 mt-1">{type}</h3>
    </div>
  );
};

export default Cards;
