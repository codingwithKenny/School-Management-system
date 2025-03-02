"use client"
import { CarouselPlugin } from "@/components/Carousel";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HomeCard from "@/components/HomeCard";
import NewsCard from "@/components/NewsCard";
import Image from "next/image"
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
            <span className="text-sm text-gray-500">GROUP OF SCHOOLS</span>
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
           <Link href="/applynow"> <h2 className="text-sm font-medium">APPLY NOW</h2></Link>
          </div>
        </div>
      </div>

      {/* HEADER */}
      <Header/>
      {/* SECTION 1 */}
      <div className="flex flex-col md:flex-row justify-center p-4 items-center m-4">
        {/* Left Section */}
        <div className="w-full md:w-[50%] flex justify-center items-center mb-8 md:mb-0">
          <CarouselPlugin />
        </div>

        {/* Right Section */}
        <div className="w-full md:w-[50%] p-6 md:p-16 text-center md:text-left">
          <h1 className="text-[24px] md:text-[30px] font-bold font-inter text-[#3C1361]">
            MUSLIM Group of Schools,Oyo
          </h1>
          <p className="text-[14px] md:text-[16px] font-sans italic text-gray-800 mt-4">
            Allah is Great
          </p>
          <h2 className="text-[14px] md:text-[15px] font-serif text-gray-500 mt-4">
            Educating a Generation of Excellence Through Knowledge and
            Character, Guided by the Noble Quran and Sunnah.
          </h2>
         <Link href="https://wa.link/1gn4eg">
         <div className="flex items-center justify-start gap-2 border border-purple-500 p-3 mt-10 w-[50%] md:w-[30%] rounded-lg text-purple-500 mx-auto md:mx-0">
            <Image src="/whatt.png" alt="Phone" width={40} height={40} />
            <h2 className="text-[14px] md:text-[15px] font-medium -ml-3">
              Contact us
            </h2>
          </div>
         </Link>
        </div>
      </div>

      {/*  SECTION2 ABOUT US */}
      <div className=" w-full flex flex-col h-[20%] bg-[#3C1361] md:flex-row justify-center items-center">
        {/* LEFT */}
        <div className="w-full md:w-[50%] justify-center items-center text-white p-6 md:mb-0">
          <h1 className="font-bold text-xl  text-gray-400 ">ABOUT US</h1>
          <p className="mt-3 font-serif">
            Muslim Group of Schools is a premier Islamic institution committed
            to providing quality education to Muslim children. Guided by the
            Noble Quran and Sunnah, we aim to nurture a generation of future
            leaders who excel academically and serve their communities with
            integrity
          </p>
          <button className="border border-purple-300 text-white p-2 mt-5 mb-0 rounded-md">
            Read More
          </button>
        </div>
        {/* RIGHT SIDE */}
        <div className="w-full md:w-[50%] p-2 md:p-5 text-center md:text-left">
          <Image
            src="/muslim71.jpg"
            alt=""
            width={600}
            height={5}
            className=""
          />
        </div>
      </div>
      {/* SECTION 3 */}
      <div className="max-w-4xl mx-auto text-center px-4 md:px-8 lg:px-16 xl:px-24 py-20 md:py-24 lg:py-28 -mt-8 md:-mt-26">
        <h1 className="text-2xl md:text-3xl font-bold text-[#3C1361] mb-4">
          OUR SCHOOL
        </h1>
        <p className="text-sm md:text-base lg:text-lg text-gray-400 leading-relaxed">
          Muslim Group of Schools is a distinguished educational institution
          comprising two schools: PRIMARY and SECONDARY, established to deliver
          exceptional education to Muslim children.
        </p>
        <p className="text-sm md:text-base lg:text-lg text-gray-400 mt-4 leading-relaxed">
          Our schools provide a well-structured and engaging curriculum that
          builds confidence, encourages learning, and develops critical
          thinking. With a team of experienced and dedicated teachers, we ensure
          that every student receives quality education in a supportive and
          disciplined environment.
        </p>
      </div>

      {/* sECTION 4 OUR SCHOOL */}
      <div className="flex flex-col md:flex-row justify-center items-center mt-0 sm:-mt-16 md:-mt-26 gap-6 px-6 md:gap-8 lg:gap-12 md:px-20">
        <HomeCard
          img="/prylogo.jpg"
          text="Muslim Nursery and  Primary School(MNPS,Oyo) nurtures young minds with a balanced curriculum, blending academic excellence and Islamic values to shape confident leaders."
          school="Primary School"
        />
        <HomeCard
          img="/seclogo.jpg"
          school="Secondary School"
          text="Muslim Comprehensive College(MCC,Oyo) delivers a holistic education grounded in academic excellence and Islamic principles, shaping future leaders with integrity, knowledge, and a commitment to community development."
        />
      </div>
      {/*  SECTION 5 VISSION */}
      <div className=" w-full flex flex-col h-[20%] bg-[#3C1361] md:flex-row justify-center items-center mt-4">
        {/* LEFT SIDE */}
        <div className="w-full md:w-[50%] p-2 md:p-5 text-center md:text-left">
          <Image
            src="/muslim9.jpg"
            alt=""
            width={600}
            height={5}
            className=""
          />
        </div>
        {/* RIGHT */}
        <div className="w-full md:w-[50%] justify-center items-center text-white p-6 md:mb-0">
          <h1 className="font-bold text-xl  text-gray-400 ">VISION</h1>
          <p className="mt-3 font-serif">
          To be a distinguished center of excellence, fostering a dynamic learning environment that nurtures academic brilliance, moral integrity, and leadership. Through a well-structured curriculum, we inspire confidence, encourage lifelong learning, and develop critical thinking skills. Rooted in strong Islamic values, we aim to empower students to become compassionate, ethical, and impactful members of their communities and the world at large
          </p>
        </div>
      </div>
      {/*  SECTION 5 MISSION */}
      <div className=" w-full flex flex-col h-[20%] md:flex-row justify-center items-center mt-4">
        {/* LEFT */}
        <div className="w-full md:w-[50%] justify-center items-center text-[#3C1361] p-6 md:mb-0">
          <h1 className="font-bold text-xl  text-[#3C1361] ">MISSION</h1>
          <p className="mt-3 font-serif">
          Our mission is to provide a holistic education that blends academic excellence with strong moral and spiritual values. We are committed to nurturing well-rounded individuals through a rich curriculum, innovative teaching methods, and a supportive learning environment. Guided by Islamic principles, we strive to instill discipline, integrity, and leadership in our students, preparing them to excel in all aspects of life and contribute meaningfully to society..
          </p>
        </div>
        {/* RIGHT SIDE */}
        <div className="w-full md:w-[50%] p-2 md:p-5 text-center md:text-left">
          <Image
            src="/muslim2.jpg"
            alt=""
            width={600}
            height={5}
            className=""
          />
        </div>
      </div>
      {/* SECTION 6 LATEST NEWS  */}
      <div className="bg-[#3C1361] p-5 md:p-8 lg:p-10">
        {/* Title Section */}
        <h1 className="font-bold text-center text-gray-300 text-lg md:text-xl lg:text-2xl">
          LATEST NEWS
        </h1>
        <p className="text-center text-gray-300 text-sm md:text-base">
          Stay Up-to-Date with Our School's Latest News
        </p>

        {/* News Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 place-items-center">
          <NewsCard image='/excellence.jpeg' />
          <NewsCard image="/books.png" />
          <NewsCard image="/studentsuccess.png" />
        </div>
        <button className="border border-purple-300 text-white p-2 mt-5 mb-0 rounded-md">
          Read More
        </button>
      </div>
      {/* APPROVED PARASTATARS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-5 p-4 md:p-8 lg:p-20 place-items-center">
        {/* Government Approved */}
        <button className="w-full max-w-xs bg-[#FAF7E6] shadow-lg rounded-md text-white p-4 flex flex-col items-center justify-center">
          <div className="w-[100px] h-[90px] overflow-hidden flex justify-center items-center">
            <Image
              src="/Approve1.png"
              alt="Government Approved"
              width={120}
              height={110}
              className="scale-90"
            />
          </div>
          <h1 className="mt-3 font-bold text-[#3C1361] text-center">
            GOVERNMENT APPROVED
          </h1>
        </button>

        {/* WAEC Accredited */}
        <button className="w-full max-w-xs bg-[#FFF5D7] shadow-lg rounded-md text-white p-4 flex flex-col items-center justify-center">
          <Image src="/waec.png" alt="" width={90} height={90} />
          <h1 className="mt-3 font-bold text-[#3C1361] text-center">
            WAEC ACCREDITED
          </h1>
        </button>

        {/* NECO Certified */}
        <button className="w-full max-w-xs bg-[#EDE0C8] shadow-lg rounded-md text-white p-4 flex flex-col items-center justify-center">
          <Image src="/neco.png" alt="" width={90} height={90} />
          <h1 className="mt-3 font-bold text-[#3C1361] text-center">
            NECO 
            <br/>SSCE AND BECE ACCREDITED
          </h1>
        </button>
      </div>

      {/*  SECTION 7 EXPLORE */}
      <div className="bg-[#3C1361] ">
        <div className=" w-full flex flex-col h-[20%] md:flex-row justify-center items-center mt-4">
          {/* LEFT SIDE */}
          <div className="w-full md:w-[50%] p-2 md:p-5 text-center md:text-left">
            <Image
              src="/muslim6.jpg"
              alt=""
              width={600}
              height={5}
              className=""
            />
          </div>
          {/* RIGHT */}
          <div className="w-full md:w-[50%] justify-center items-center text-white p-6 md:mb-0">
            <p className="mt-3 font-serif">
              We are delighted to welcome you to Muslim Group of Schools, where
              we provide a well-rounded education that nurtures academic
              excellence, strong character, and a commitment to lifelong
              learning. Our school integrates a balanced curriculum that fosters
              critical thinking, confidence, and discipline, while upholding
              core values of integrity and respect.
            </p>
            <p className="mt-4">
              I invite you to explore our website to learn more about our
              curriculum, programs, and services. Thank you for considering
              Muslim Group of Schools for your child’s education. We look
              forward to welcoming you into our school community.
            </p>
            <p className="mt-3 text-gray-400 font-bold">YOUMAS ANJAENA</p>
            <p className=" text-gray-400">School Proprietor</p>
            <div className="flex items-center justify-start gap-2 border border-purple-500 p-3 mt-3 w-[50%] md:w-[30%] rounded-lg text-white mx-auto md:mx-0">
              <Image src="/whatt.png" alt="Phone" width={40} height={40} />
              <h2 className="text-[14px] md:text-[15px] font-medium -ml-3">
                Contact us
              </h2>
            </div>
          </div>
        </div>
        <hr className="mt-10" />
        <Footer />
      </div>
    </div>
  );
}
