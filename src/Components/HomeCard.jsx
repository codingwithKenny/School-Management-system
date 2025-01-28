import Image from "next/image";
import React from "react";

const HomeCard = ({ school, text, img }) => {
  return (
    <div className="p-4 border border-gray-300 rounded-lg shadow-lg flex flex-col justify-center gap-3 items-center w-80 h-80">
      <div className="flex justify-center items-center">
        <Image src={img} alt={school} width={80} height={80} className="" />
      </div>
      <h1 className="text-lg font-semibold text-center">{school}</h1>
      <h3 className="text-sm text-gray-500 text-center">
        {text}
      </h3>
    </div>
  );
};

export default HomeCard;
