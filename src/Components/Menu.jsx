"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Import usePathname
import React, { useEffect, useState } from "react";

export default function Menu() {
  const { isLoaded, user } = useUser();
  const { signOut } = useClerk();
  const [loggedUser, setLoggedUser] = useState(null);
  const pathname = usePathname(); // Get current route

  useEffect(() => {
    if (isLoaded && user?.publicMetadata?.role) {
      const role = user.publicMetadata.role;
      setLoggedUser(role)
    }
  }, [isLoaded, user]);

  // useEffect(() => {
  //   const storedUser = localStorage.getItem("loggedUser");
  //   if (storedUser) {
  //     setLoggedUser(storedUser);
  //   }
  // }, []);

  const menuItems = [
    {
      title: "MENU",
      items: [
        { icon: "/home.png", label: "Home", href: `/${loggedUser}`, visible: ["admin", "teacher", "student", "parent"] },
        { icon: "/subject.png", label: "Subjects", href: "/list/subjects", visible: ["admin"] },
        { icon: "/teacher.png", label: "Teachers", href: "/list/teachers", visible: ["admin"] },
        { icon: "/student.png", label: "Students", href: "/list/students", visible: ["admin"] },
        { icon: "/class.png", label: "Classes", href: "/list/classes", visible: ["admin", "teacher"] },
        { icon: "/assignment.png", label: "Result Overview", href: "/list/resultoverview", visible: ["admin"] },
        { icon: "/exam.png", label: "Check Result", href: "/list/checkresult", visible: ["student", "parent"] },
        { icon: "/result.png", label: "Results", href: "/list/results", visible: ["teacher"] },
        { icon: "/parent.png", label: "Parents", href: "/list/parents", visible: ["admin", "teacher"], disabled: true },
        { icon: "/message.png", label: "Messages", href: "/list/messages", visible: ["admin", "teacher", "student", "parent"], disabled: true },
        { icon: "/announcement.png", label: "Announcements", href: "/list/announcements", visible: ["admin", "teacher", "student", "parent"], disabled: true },
      ],
    },
    {
      title: "OTHER",
      items: [
        { icon: "/profile.png", label: "Profile", href: "/profile", visible: ["admin"] },
        { icon: "/setting.png", label: "Settings", href: "/settings", visible: ["admin"]},
      ],
    },
  ];

  if (!isLoaded) {
    return <div className="text-center py-4 text-gray-500">Loading...</div>;
  }

  return (
    <div className="h-full w-64 bg-gradient-to-b from-white to-purple-100 text-xs text-purple-900 font-bold shadow-lg p-4 overflow-y-auto">
      {/* Logo and School Name */}
   {/* Logo and School Name */}
<div className="flex flex-col items-center mb-6">
  <Image src="/logo.png" alt="Logo" width={64} height={64} className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16" />
  <p className="hidden sm:block font-semibold text-gray-700 text-sm mt-2">MUSLIM SCHOOL, OYO</p>
</div>


      {/* Menu Items */}
      {menuItems.map((section) => (
        <div key={section.title} className="mb-6">
          <span className="hidden lg:block text-gray-400 font-semibold text-xs uppercase">
            {section.title}
          </span>
          <div className="flex flex-col gap-2">
            {section.items.map((item) =>
              loggedUser && item.visible.includes(loggedUser) ? (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-4 px-3 py-2 rounded-md transition duration-300 ${
                    item.disabled
                      ? "pointer-events-none opacity-50"
                      : pathname === item.href
                      ? "bg-purple-300 text-purple-900 font-bold shadow-md" // Active state styling
                      : "hover:bg-purple-200 hover:text-purple-900"
                  }`}
                >
                  <Image src={item.icon} alt={item.label} width={20} height={20} />
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              ) : null
            )}
          </div>
        </div>
      ))}

      {/* Logout Button */}
      <button
        onClick={() => {
          signOut({ redirect: false });
          localStorage.removeItem("loggedUser");
          setLoggedUser(null);
        }}
        className="flex items-center justify-between -mt-5 bg-pink-400 gap-4 px-3 py-2 rounded-md text-gray-700 hover:bg-red-200 hover:text-red-600 transition duration-300"
        >
        <Image src="/logout.png" alt="Logout" width={20} height={20} />
        <span className="hidden lg:block">Logout</span>
      </button>
    </div>
  );
}
