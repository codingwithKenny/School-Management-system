import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Menu() {
  const { isLoaded, user } = useUser();

  if (!isLoaded || !user) {
    return <div>Loading...</div>;
  }

  const role = user.publicMetadata?.role;

  const menuItems = [
    {
      title: "MENU",
      items: [
        {
          icon: "/home.png",
          label: "Home",
          href: `/${role}`,
          visible: ["admin", "teacher", "student", "parent"],
        },
        {
          icon: "/teacher.png",
          label: "Teachers",
          href: "/list/teachers",
          visible: ["admin", "teacher"],
        },
        {
          icon: "/student.png",
          label: "Students",
          href: "/list/students",
          visible: ["admin", "teacher"],
        },
        {
          icon: "/parent.png",
          label: "Parents",
          href: "/list/parents",
          visible: ["admin", "teacher"],
          className: "disabled",
        },
        {
          icon: "/subject.png",
          label: "Subjects",
          href: "/list/subjects",
          visible: ["admin"],
        },
        {
          icon: "/class.png",
          label: "Classes",
          href: "/list/classes",
          visible: ["admin", "teacher"],
        },
        {
          icon: "/assignment.png",
          label: "Result Overview",
          href: "/list/resultoverview",
          visible: ["admin"],
        },
        {
          icon: "/exam.png",
          label: "Check Result",
          href: "/list/checkresult",
          visible: ["student", "parent"],
        },
        {
          icon: "/result.png",
          label: "Results",
          href: "/list/results",
          visible: ["teacher"],
        },
        {
          icon: "/message.png",
          label: "Messages",
          href: "/list/messages",
          visible: ["admin", "teacher", "student", "parent"],
          className: "disabled",
        },
        {
          icon: "/announcement.png",
          label: "Announcements",
          href: "/list/announcements",
          visible: ["admin", "teacher", "student", "parent"],
          className: "disabled", 
        },
      ],
    },
    {
      title: "OTHER",
      items: [
        {
          icon: "/profile.png",
          label: "Profile",
          href: "/profile",
          visible: ["admin"],
        },
        {
          icon: "/setting.png",
          label: "Settings",
          href: "/settings",
          visible: ["admin", "teacher", "student", "parent"],
          className: "disabled",
        },
        {
          icon: "/logout.png",
          label: "Logout",
          href: "/logout",
          visible: ["admin", "teacher", "student", "parent"],
          className: "disabled",
        },
      ],
    },
  ];

  return (
    <div className="mt-2 text-xs p-4">
      {menuItems.map((item) => (
        <div className="gap-2" key={item.title}>
          {/* TITLE */}
          <span className="hidden lg:block text-gray-400 font-light text-sm">
            {item.title}
          </span>
          {/* ITEMS */}
          {item.items.map((el) => {
            if (role && el.visible.includes(role)) {
              const disabledClass = el.className === "disabled" ? "pointer-events-none" : "";

              return (
                <Link
                  href={el.href}
                  key={el.label}
                  className={`flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 ${disabledClass}`}
                >
                  <Image
                    src={el.icon}
                    alt="image"
                    width={20}
                    height={20}
                  />
                  <span className="hidden lg:block">{el.label}</span>
                </Link>
              );
            }
            return null;
          })}
        </div>
      ))}
    </div>
  );
}
