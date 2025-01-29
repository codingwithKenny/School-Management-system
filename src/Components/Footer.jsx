import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const Footer = () => {
  return (
    <footer className="text-white py-10 px-6">
      <div className="container mx-auto flex flex-wrap justify-between gap-10">
        
        {/* CONTACT US */}
        <div className="flex flex-col gap-y-4">
          <h1 className="font-semibold text-gray-400">Contact Us</h1>
          <div className="flex items-center gap-2 text-sm">
            <Image src="/phone3.png" alt="Phone Icon" width={20} height={20} />
            <span>09036391952</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Image src="/footermail.png" alt="Email Icon" width={20} height={20} />
            <span>muslimschooloyo@gmail.com</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Image src="/locationn.png" alt="Location Icon" width={40} height={40} />
            <span className="w-40">Behind Premier Tobacco, Ileko Alaaafin Odo Eran, OYO</span>
          </div>
        </div>

        {/* QUICK LINKS */}
        <div className="flex flex-col gap-y-4">
          <h1 className="font-semibold text-gray-400">Quick Links</h1>
          <Link href="#" className="hover:text-gray-300 transition">About Us</Link>
          <Link href="#" className="hover:text-gray-300 transition">School</Link>
          <Link href="#" className="hover:text-gray-300 transition">News</Link>
          <Link href="#" className="hover:text-gray-300 transition">Gallery</Link>
        </div>

        {/* SCHOOLS */}
        <div className="flex flex-col gap-y-4">
          <h1 className="font-semibold text-gray-400">Schools</h1>
          <Link href="#" className="hover:text-gray-300 transition">Primary School</Link>
          <Link href="#" className="hover:text-gray-300 transition">Secondary School</Link>
        </div>

        {/* SCHOOL HOURS */}
        <div className="flex flex-col gap-y-4">
          <h1 className="font-semibold text-gray-400">School Hours</h1>
          <p className="text-sm">Monday - Friday: 8:00 AM - 4:00 PM</p>
          <p className="text-sm">Saturday: 9:00 AM - 1:00 PM</p>
          <p className="text-sm">Sunday: Closed</p>
        </div>

        {/* SOCIAL MEDIA */}
        <div className="flex flex-col gap-y-4">
          <h1 className="font-semibold text-gray-400">Follow Us</h1>
          <div className="flex gap-4">
            <Link href="#" aria-label="Facebook">
              <Image src="/facebook.png" alt="Facebook Icon" width={24} height={24} />
            </Link>
            <Link href="#" aria-label="Twitter">
              <Image src="/twitter.png" alt="Twitter Icon" width={24} height={24} />
            </Link>
            <Link href="#" aria-label="Instagram">
              <Image src="/instagram.png" alt="Instagram Icon" width={24} height={24} />
            </Link>
          </div>
        </div>
      </div>

      {/* THIN GRAY HR */}
      <hr className="mt-20 w-[80%] mx-auto border-t-[1px] border-gray-500" />

      {/* COPYRIGHT */}
      <div className="mt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Muslim School Oyo. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
