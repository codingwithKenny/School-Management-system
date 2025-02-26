import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Proprietor | Muslim Groups of School",
  description:
    "Learn about the visionary founder of Muslim Groups of School, YOUMBAS ANJAENA (Young Muslim Brothers and Sisters of Nigeria).",
};

const ProprietorPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-2xl">
        <h1 className="text-4xl font-bold text-purple-700 mb-4 text-center">
          PROPRIETOR
        </h1>

        <p className="text-gray-700 mb-4 text-justify">
          <strong>Muslim Group of Schools</strong> was established through the vision and dedication of  
          <span className="text-purple-600 font-bold"> YOUMBAS ANJAENA</span> –
          <strong> Young Muslim Brothers and Sisters of Nigeria</strong>.  
          Since its founding, the institution has been committed to delivering quality education  
          while upholding Islamic values and principles.
        </p>

        <p className="text-gray-700 mb-4 text-justify">
          With a passion for empowering young minds, <strong>YOUMBAS ANJAENA</strong>  aimed to create  
          an institution where students receive academic excellence, moral guidance, and  
          spiritual development. The initiative started with the establishment of  
          <strong> Muslim Nursery and Primary School</strong> in <span className="text-red-500">1986</span> followed by  
          <strong> Muslim Comprehensive College</strong>, which further expanded the school’s  
          impact on education.
        </p>

        <p className="text-gray-700 mb-4 text-justify">
          Over the years, <stong>Muslim Group of Schools</stong> has nurtured thousands of students,  
          producing graduates who excel in various fields, carry strong ethical values,  
          and contribute positively to their communities.
        </p>

        <div className="text-center">
          <Link href="/">
            <button className="mt-6 bg-purple-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-purple-700 transition">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProprietorPage;
