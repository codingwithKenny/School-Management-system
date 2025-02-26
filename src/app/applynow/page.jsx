import React from "react";
import Link from "next/link";
import { FaGraduationCap, FaPhone, FaWhatsapp, FaArrowLeft } from 'react-icons/fa'; // Import the back arrow icon

export const metadata = {
  title: "Apply Now | Muslim Groups of School",
  description: "Enroll your child today for quality education and a bright future.",
};

const ApplyNow = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-purple-100 p-6">

      {/* Back Arrow */}
      <div className="absolute top-4 left-4">
        <Link href="/">
            <FaArrowLeft className="inline-block mr-1 align-middle" /> Back to Home
        </Link>
      </div>

      <div className="bg-white shadow-xl rounded-lg p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-4 tracking-tight">
          <FaGraduationCap className="inline-block mr-2 mb-1 text-gray-500" /> Apply Now
        </h1>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Unlock a world of opportunity for your child with our enriching educational environment.
        </p>

        <ul className="text-gray-700 mb-8 space-y-3">
          <li className="flex items-center justify-center">
            <span className="mr-2 text-lg"><i className="fas fa-book-open"></i></span>
            <span>High-Quality Curriculum</span>
          </li>
          <li className="flex items-center justify-center">
            <span className="mr-2 text-lg"><i className="fas fa-chalkboard-teacher"></i></span>
            <span>Experienced & Dedicated Educators</span>
          </li>
          <li className="flex items-center justify-center">
            <span className="mr-2 text-lg"><i className="fas fa-users"></i></span>
            <span>Nurturing & Supportive Community</span>
          </li>
        </ul>

        <Link href="/">
          <button
            className="bg-gray-700 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-900 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          >
            Begin Application
          </button>
        </Link>


        <p className="text-gray-600 mt-8 mb-4">Need Assistance? Contact us:</p>

        <div className="bg-gray-100 p-4 rounded-md shadow-sm flex items-center justify-center space-x-2">
          <FaPhone className="text-gray-500" />
          <span className="text-gray-700 font-semibold text-lg">09036391952</span>
        </div>

        <div className="mt-4">
          <Link
            href="https://wa.link/1gn4eg"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-gray-500 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-600 transition-colors duration-300 focus:outline-none focus:ring-gray-500 focus:ring-opacity-50"
          >
            <FaWhatsapp className="mr-2" />
            Chat on WhatsApp
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ApplyNow;