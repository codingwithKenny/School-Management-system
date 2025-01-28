"use client"
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function AboutUs() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Toggle the dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="">
      <div className="relative inline-block" ref={dropdownRef}>
        {/* Dropdown Button */}
        <Link href='/'
          className="inline-flex justify-center items-center text-white"
          onClick={toggleDropdown}
        >
          About us
          <svg
            className="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06 0L10 10.94l3.71-3.73a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 010-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </Link>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black/5">
            <div className="py-1">
              <Link
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                 Muslim Group of school
              </Link>
              <Link
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                The Proprietor
              </Link>
              <Link
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                The Adminstraitor
              </Link>
             
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
