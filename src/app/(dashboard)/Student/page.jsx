import Annoucement from "@/components/Annoucement";
import BigCalendar from "@/components/BigCalendar";
import Performance from "@/components/Performance";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import React from "react";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getUserRole } from "@/lib/authUtils";

const studentPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

    const role = await getUserRole(); // get the user role from Clerk
    if (!role) {
      redirect(`/${role}`);
  
    }

  const student = await prisma.student.findUnique({
    where: { id: userId },
    select: {
      surname: true,
      firstname: true,
      admission: true,
      paymentStatus: true,
      img:true,
      email: true,
      term: {select:{id:true, name:true}},
      phone: true,
      class: {  
        select: {
          id: true,
          name: true,
          grade: { select: { name: true } },
        },
      },
    },
  });
  
  console.log(student)

  const subjectCount = await prisma.subject.count({
    where: {
      students: {
        some: {
          studentId: userId,
        },
      },
    },
  });

  const latestSession = await prisma.session.findFirst({
    orderBy: { id: "desc" },
    select: {
      name: true,
    },
  });

  const StudentCurrentClass = await prisma.class.findFirst({
    where: {
      students: {
        some: {
          id: userId,
        },
      },
    },
    select: {
      name: true,
      grade: { select: { name: true } },
    },
  })

  if (!student) {
    return (
      <div className="text-center text-red-500">Error: Student not found!</div>
    );
  }

  return (
    <div className="flex-1 p-6 flex flex-col xl:flex-row gap-6 items-stretch">
      {/* LEFT SECTION - USER PROFILE & SCHEDULE */}
      <div className="flex flex-col gap-6 w-full xl:w-2/3">
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          {/* USER PROFILE CARD */}
         {/* USER CARD */}
<div className="bg-gradient-to-r from-white to-purple-300 p-6 flex flex-col md:flex-row gap-6 shadow-md w-full items-center md:items-start">
  {/* USER IMAGE */}
  <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden">
    <img
      src={student.img}
      alt="Student Profile"
      className="w-full h-full object-cover object-center block"
    />
  </div>

  {/* USER INFO */}
  <div className="flex flex-col gap-4 w-full md:w-2/3 text-center md:text-left">
    <h1 className="text-lg font-bold text-gray-800 capitalize">
      {student.surname} {student.name}
    </h1>

    {/* PAYMENT STATUS */}
    <span
      className={`px-4 py-2 rounded-md w-40 text-center text-xl font-bold shadow-md ${
        student.paymentStatus === "Paid"
          ? "bg-green-200 text-green-800"
          : student.paymentStatus === "NOT_PAID"
          ? "bg-yellow-200 text-yellow-800"
          : "bg-red-200 text-red-800"
      }`}
    >
      {student.paymentStatus || "Unknown"}
    </span>

    <p className="text-sm text-gray-600">
      Welcome back! Stay focused and keep learning!
    </p>

    {/* CONTACT & SESSION INFO - Ensured it appears */}
    <div className="flex flex-wrap items-center gap-4 text-sm font-medium justify-center md:justify-start">
      <div className="flex items-center gap-2">
        <Image src="/date.png" alt="Session" width={16} height={16} />
        <span className="text-gray-700">
          {latestSession?.name || "N/A"} - {student?.term.name || "Unknown Term"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Image src="/phone.png" alt="Phone" width={16} height={16} />
        <span className="text-gray-700">{student.phone || "N/A"}</span>
      </div>

      <div className="flex items-center gap-2">
        <Image src="/mail.png" alt="Email" width={16} height={16} />
        <span className="text-gray-700 break-all">{student.email}</span>
      </div>
    </div>
  </div>
</div>

        </div>
  
        {/* SMALL CARDS (FLEX GRID) */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white p-4 rounded-xl flex items-center gap-4 shadow-md">
            <Image src="/singleAttendance.png" alt="Attendance" width={24} height={24} />
            <div>
              <h1 className="text-xl font-semibold">__%</h1>
              <span className="text-sm text-gray-500">Attendance</span>
            </div>
          </div>
  
          <div className="bg-white p-4 rounded-xl flex items-center gap-4 shadow-md">
            <Image src="/singleBranch.png" alt="Grade" width={24} height={24} />
            <div>
              <h1 className="text-xl font-semibold">{student.class?.grade?.name}</h1>
              <span className="text-sm text-gray-500">Grade</span>
            </div>
          </div>
  
          <div className="bg-white p-4 rounded-xl flex items-center gap-4 shadow-md">
            <Image src="/singleLesson.png" alt="Subjects" width={24} height={24} />
            <div>
              <h1 className="text-xl font-semibold">{subjectCount || "N/A"}</h1>
              <span className="text-sm text-gray-500">Subjects</span>
            </div>
          </div>
  
          <div className="bg-white p-4 rounded-xl flex items-center gap-4 shadow-md">
            <Image src="/singleClass.png" alt="Class" width={24} height={24} />
            <div>
              <h1 className="text-xl font-semibold">{student.class?.name || "N/A"}</h1>
              <span className="text-sm text-gray-500">Class</span>
            </div>
          </div>
        </div>
  
        {/* STUDENT SCHEDULE (FULL-WIDTH) */}
        <div className="mt-6 bg-white rounded-xl p-6 shadow-md flex-1">
          <h1 className="text-lg font-bold text-gray-800 text-[#cdd3ff] mb-4">STUDENT TIMETABLE</h1>
          <BigCalendar />
        </div>
      </div>
  
      {/* RIGHT SECTION - SHORTCUTS & PERFORMANCE */}
      <div className="flex flex-col gap-6 w-full xl:w-1/3">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h1 className="text-lg font-bold text-purple-300">SHORTCUTS</h1>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-600">
            <Link className="p-3 rounded-md bg-[#ffdcf1] hover:bg-opacity-80" href="/">Classes</Link>
            <Link className="p-3 rounded-md bg-[#cdd3ff] hover:bg-opacity-80" href={`/list/teachers?classId=${2}`}>Teachers</Link>
            <Link className="p-3 rounded-md bg-[#ddc2ff] hover:bg-opacity-80" href="/">Lessons</Link>
            <Link className="p-3 rounded-md bg-[#e3ffd7] hover:bg-opacity-80" href="/">Exams</Link>
            <Link className="p-3 rounded-md bg-[#e4fff6] hover:bg-opacity-80" href="/">Assignments</Link>
            <Link className="p-3 rounded-md bg-[#FEFCE8] hover:bg-opacity-80" href="/">Results</Link>
          </div>
        </div>
  
        <Performance />
        <Annoucement />
      </div>
    </div>
  );
  
};

export default studentPage;
