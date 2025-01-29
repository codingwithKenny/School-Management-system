import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import AboutUs from "./AboutBar";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="bg-[#3C1361] text-white">
      {/* Mobile & Tablet Menu Bar */}
      <div className="flex justify-between items-center p-4 md:p-6 lg:hidden">
        {/* Contact Info */}
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

        {/* Menu Toggle Button (For Mobile & Tablets) */}
        <button
          className="p-2 rounded-md border border-white md:hidden"
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          )}
        </button>
      </div>

      {/* Navigation Menu - Always Visible on Tablet and Desktop */}
      <nav
        className={`${
          isMenuOpen ? "flex" : "hidden"
        } flex-col md:flex-row md:flex justify-center items-center font-serif gap-6 p-4 md:p-6 lg:gap-10`}
      >
        <Link href="/" className="hover:underline text-sm md:text-base">
          Home
        </Link>
        <AboutUs/>
        <Link href="/" className="hover:underline text-sm md:text-base">
          School
        </Link>
        <Link href="/" className="hover:underline text-sm md:text-base">
          News
        </Link>
        <Link href="/" className="hover:underline text-sm md:text-base">
          Gallery
        </Link>
        <Link href="/" className="hover:underline text-sm md:text-base">
          Contact Us
        </Link>
        <Link href="/sign-in" className="hover:underline text-sm md:text-base">
          Login
        </Link>
      </nav>
    </div>
  );
};

export default Header;
