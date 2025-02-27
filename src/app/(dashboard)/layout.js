"use client";
import { usePathname } from "next/navigation"; // Use usePathname instead of useRouter
import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";

export default function DashboardLayout({ children }) {
  // const pathname = usePathname(); // Get the current path
  // console.log(pathname)

  // // Exclude `/welcome` from using the layout
  // if (pathname === "/welcome") {
  //   return <>{children}</>; // Render the children without the layout
  // }

  return (
    <div className="flex h-screen">
      {/* Left */}
      <div className="w-[14%] md:w-[8%] lg:w-[16%] xl-w:[14%]">
       
        <Menu />
      </div>
      {/* Right */}
      <div className="w-[86%] md:w-[92%] lg:w-[84%] xl-w[86%] bg-purple-50 border border-red overflow-y-scroll flex flex-col">
        <Navbar />
        {children}
      </div>
    </div>
  );
}