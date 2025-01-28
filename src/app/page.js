"use client";
import Cards from "@/components/Cards";
import { CarouselPlugin } from "@/components/Carousel";
import AboutUs from "@/components/Dropdown";
import HomeCard from "@/components/HomeCard";
import { Carousel } from "@/components/ui/carousel";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <div className="font-sans bg-purple-50 min-h-screen">
      {/* BEFORE HEADER */}
      <div className="flex flex-col md:flex-row justify-around items-center p-5">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Logo" width={60} height={60} />
          <div className="text-center md:text-left">
            <h1 className="text-xl text-[#3C1361] font-bold text-gray-800">
              MUSLIM
            </h1>
            <span className="text-sm text-gray-500">GROUP OF SCHOOL</span>
          </div>
        </div>

        {/* Contact and Apply Now (Hidden on small screens) */}
        <div className="hidden lg:flex flex-row items-center gap-5 mt-4 md:mt-0">
          <div className="flex items-center gap-2 border border-purple-500 px-4 py-2 rounded-lg text-purple-500">
            <Image src="/phone2.png" alt="Phone" width={24} height={24} />
            <h2 className="text-sm font-medium">09036391952</h2>
          </div>
          <div className="flex items-center gap-2 bg-[#3C1361] text-white px-4 py-2 rounded-lg">
            <Image src="/cap3.png" alt="Apply Now" width={24} height={24} />
            <h2 className="text-sm font-medium">APPLY NOW</h2>
          </div>
        </div>
      </div>

      {/* HEADER */}
      <div className="bg-[#3C1361] text-white">
        {/* Mobile Menu Bar */}
        <div className="flex justify-between items-center p-4 md:hidden">
          {/* Contact Info in Menu Bar */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 border border-white px-3 py-2 bg-purple-100 rounded-lg text-[#3C1361]">
              <Image src="/phone2.png" alt="Phone" width={20} height={20} />
              <h2 className="text-xs font-medium">09036391952</h2>
            </div>
            <div className="flex items-center gap-2 bg-purple-300 text-[#3C1361] px-3 py-2 rounded-lg">
              <Image src="/cap3.png" alt="Apply Now" width={20} height={20} />
              <h2 className="text-xs font-medium">APPLY NOW</h2>
            </div>
          </div>

          {/* Menu Toggle Button */}
          <button
            className="p-2 rounded-md border border-white"
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Header Navigation */}
        <div
          className={`${
            isMenuOpen ? "block" : "hidden"
          } md:block flex lg:flex flex-col md:flex-row justify-center items-center font-serif gap-10 p-4`}
        >
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <div>
            <AboutUs />
          </div>
          <Link href="/" className="hover:underline">
            School
          </Link>
          <Link href="/" className="hover:underline">
            News
          </Link>
          <Link href="/" className="hover:underline">
            Gallery
          </Link>
          <Link href="/" className="hover:underline">
            Contact us
          </Link>
          <Link href="/" className="hover:underline">
            Login
          </Link>
        </div>
      </div>
      {/* SECTION 1 */}
      <div className="flex flex-col md:flex-row justify-center p-4 items-center m-4">
  {/* Left Section */}
  <div className="w-full md:w-[50%] flex justify-center items-center mb-8 md:mb-0">
    <CarouselPlugin />
  </div>

  {/* Right Section */}
  <div className="w-full md:w-[50%] p-6 md:p-16 text-center md:text-left">
    <h1 className="text-[24px] md:text-[30px] font-bold font-inter text-[#3C1361]">
      MUSLIM Group of School, Oyo
    </h1>
    <p className="text-[14px] md:text-[16px] font-sans italic text-gray-800 mt-4">
      Allah is Great
    </p>
    <h2 className="text-[14px] md:text-[15px] font-serif text-gray-500 mt-4">
      Educating a Generation of Excellence Through Knowledge and Character, Guided by the Noble Quran and Sunnah.
    </h2>
    <div className="flex items-center justify-start gap-2 border border-purple-500 p-3 mt-10 w-[50%] md:w-[30%] rounded-lg text-purple-500 mx-auto md:mx-0">
      <Image src="/whatt.png" alt="Phone" width={40} height={40} />
      <h2 className="text-[14px] md:text-[15px] font-medium -ml-3">
        Contact us
      </h2>
    </div>
  </div>
</div>


      {/*  SECTION2 */}
      <div className=" w-full flex flex-col h-[20%] bg-[#3C1361] md:flex-row justify-center items-center">
        {/* LEFT */}
        <div className="w-full md:w-[50%] justify-center items-center text-white p-6 md:mb-0">
          <h1 className="font-bold text-xl  text-gray-400 ">ABOUT US</h1>
          <p className="mt-3 font-serif">Muslim Group of Schools is a premier Islamic institution committed to providing quality education to Muslim children. Guided by the Noble Quran and Sunnah, we aim to nurture a generation of future leaders who excel academically and serve their communities with integrity</p>
          <button className="border border-purple-300 text-white p-2 mt-5 mb-0 rounded-md">Read More</button>
        </div>
        {/* RIGHT SIDE */}
        <div className="w-full md:w-[50%] p-2 md:p-5 text-center md:text-left">
          <Image src="/school1.jpg" alt="" width={600} height={5} className=""/>
        </div>
      </div>
      {/* SECTION 3 */}
      <div className="text-center p-20 md:p-16 lg:p-20 xl:p-40 -mt-8 md:-mt-36">
  <h1 className="text-2xl md:text-3xl font-bold text-[#3C1361] mb-4">
    OUR SCHOOL MISSION
  </h1>
  <p className="text-sm md:text-base lg:text-lg text-gray-400 leading-relaxed">
    Muslim Group of Schools is a distinguished educational institution comprising two schools: Primary and Secondary,established to deliver exceptional education to Muslim children.
  </p>
  <p className="text-sm md:text-base lg:text-lg text-gray-400 mt-4 leading-relaxed">
    Our mission is to nurture future leaders who excel academically, uphold integrity, and make meaningful contributions to their communities. At Muslim Group of Schools, we are committed to creating a balanced learning environment that integrates quality education with Islamic principles.
  </p>
</div>
{/* sECTION 4 */}
<div className="flex flex-col md:flex-row justify-center items-center mt-0 sm:-mt-20 md:-mt-28 gap-6 px-6 md:gap-8 lg:gap-12 md:px-20">
  <HomeCard
    img="/prylogo.jpg"
    text="Muslim Primary School nurtures young minds with a balanced curriculum, blending academic excellence and Islamic values to shape confident leaders."
    school="Primary School"
  />
  <HomeCard
    img="/seclogo.jpg"
    school="Secondary School"
    text="Muslim Comprehensive College delivers a holistic education grounded in academic excellence and Islamic principles, shaping future leaders with integrity, knowledge, and a commitment to community development."
  />
</div>
<div>
  hhhhhhhhhh
</div>



    </div>
  );
}
