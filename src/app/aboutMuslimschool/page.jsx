import React from "react";
import Link from "next/link";

export const metadata = {
  title: "About Us | Muslim Groups of School",
  description:
    "Learn about the history, mission, and values of Muslim Groups of School, shaping future leaders since 1986.",
};

const AboutMuslimSchoolPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-2xl">
        <h1 className="text-4xl font-bold text-purple-700 mb-4 text-center">
          About Us
        </h1>

        <p className="text-gray-700 mb-4 text-justify">
          <strong>Muslim Groups of School</strong> was founded in  
          <span className="text-red-500 font-bold"> 1986</span> by the visionary group  
          <span className="text-purple-600 font-bold"> YOUBAS ANJAENA</span>. With a mission to provide  
          high-quality education rooted in Islamic values, the school started with the establishment of  
          <strong> Muslim Nursery and Primary School</strong>, offering a strong foundation in academics  
          and moral teachings.
        </p>

        <p className="text-gray-700 mb-4 text-justify">
          As the institution grew, <strong>Muslim Comprehensive College</strong> was later established,  
          further expanding our commitment to excellence in secondary education. Over the years,  
          we have nurtured and graduated countless students who have excelled in various fields of life.
        </p>

        <p className="text-gray-700 mb-4 text-justify">
          Today, <strong>Muslim Groups of School</strong> remains dedicated to shaping future leaders  
          through a balanced blend of academic excellence, character building, and Islamic  
          principles. Our students continue to make us proud as they thrive in their  
          communities and beyond.
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

export default AboutMuslimSchoolPage;
