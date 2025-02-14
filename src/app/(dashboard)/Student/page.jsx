import Annoucement from "@/components/Annoucement";
import BigCalendar from "@/components/BigCalendar";
import Performance from "@/components/Performance";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import React from "react";

const studentPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const student = await prisma.student.findUnique({
    where: { id: userId },
    select: {
      surname: true,
      name: true,
      username: true,
      paymentStatus: true,
      email: true,
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
    <div className="flex-1 p-6 flex flex-col gap-6 xl:flex-row">
      {/* LEFT SECTION */}
      <div className="w-full xl:w-2/3">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* USER CARD */}
          <div className="bg-[#E3ECF9] p-4 md:p-6 flex flex-col md:flex-row rounded-xl gap-4 md:gap-6 shadow-md items-center md:items-start w-full md:w-auto mx-auto">
            {/* USER IMAGE */}
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden aspect-square">
              <img
                src="https://images.pexels.com/photos/1187765/pexels-photo-1187765.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Student Profile"
                className="w-full h-full object-cover object-center block"
              />
            </div>

            {/* USER INFO */}
            <div className="w-full md:w-2/3 flex flex-col gap-3 text-center md:text-left items-center md:items-start">
              <h1 className="text-md md:text-lg font-bold text-gray-800 capitalize">
                {student.surname} {student.name}
              </h1>

              {/* PAYMENT STATUS */}
              <span
                className={`px-3 py-1 md:px-4 md:py-2 rounded-md w-32 md:w-40 text-center text-sm md:text-xl font-bold shadow-md ${
                  student.paymentStatus === "Paid"
                    ? "bg-green-200 text-green-800"
                    : student.paymentStatus === "NOT_PAID"
                    ? "bg-yellow-200 text-yellow-800"
                    : "bg-red-200 text-red-800"
                }`}
              >
                {student.paymentStatus || "Unknown"}
              </span>

              <p className="text-xs text-gray-600 md:text-sm">
                Welcome back! Stay focused and keep learning!
              </p>

              {/* Contact & Session Info */}
              <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm font-medium justify-center md:justify-start">
                <div className="flex items-center gap-1 md:gap-2">
                  <Image src="/date.png" alt="Session" width={14} height={14} />
                  <span className="text-gray-700">
                    {latestSession?.name || "N/A"} -{" "}
                    {latestSession?.term || "Unknown Term"}
                  </span>
                </div>

                <div className="flex items-center gap-1 md:gap-2">
                  <Image src="/phone.png" alt="Phone" width={14} height={14} />
                  <span className="text-gray-700">
                    {student.phone || "N/A"}
                  </span>
                </div>

                <div className="flex items-center gap-1 md:gap-2">
                  <Image src="/mail.png" alt="Email" width={14} height={14} />
                  <span className="text-gray-700 break-all">
                    {student.email}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SMALL CARDS */}
        <div className="flex flex-wrap gap-4 mt-6">
          <div className="bg-white p-4 rounded-xl flex items-center gap-4 shadow-md w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
            <Image
              src="/singleAttendance.png"
              alt="Attendance"
              width={24}
              height={24}
            />
            <div>
              <h1 className="text-xl font-semibold">__%</h1>
              <span className="text-sm text-gray-500">Attendance</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl flex items-center gap-4 shadow-md w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
            <Image src="/singleBranch.png" alt="Grade" width={24} height={24} />
            <div>
              <h1 className="text-xl font-semibold">{student.class?.grade?.name}</h1>
              <span className="text-sm text-gray-500">Grade</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl flex items-center gap-4 shadow-md w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
            <Image
              src="/singleLesson.png"
              alt="Subjects"
              width={24}
              height={24}
            />
            <div>
              <h1 className="text-xl font-semibold">{subjectCount || "N/A"}</h1>
              <span className="text-sm text-gray-500">Subjects</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl flex items-center gap-4 shadow-md w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
            <Image src="/singleClass.png" alt="Class" width={24} height={24} />
            <div>
              <h1 className="text-xl font-semibold">{student.class?.name || "N/A"}</h1>
              <span className="text-sm text-gray-500">Class</span>
            </div>
          </div>
        </div>

        {/* STUDENT SCHEDULE */}
        <div className="mt-6 bg-white rounded-xl p-6 shadow-md h-[800px]">
          <h1 className="text-lg font-semibold text-gray-800 mb-4">
            Student Schedule
          </h1>
          <BigCalendar />
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="w-full xl:w-1/3 flex flex-col gap-6">
        {/* SHORTCUTS */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h1 className="text-lg font-semibold text-gray-800">Shortcuts</h1>
          <div className="mt-4 flex gap-3 flex-wrap text-xs text-gray-600">
            <Link
              className="p-3 rounded-md bg-[#FEFCE8] hover:bg-opacity-80 transition"
              href="/"
            >
              Classes
            </Link>
            <Link
              className="p-3 rounded-md bg-[#F1F0FF] hover:bg-opacity-80 transition"
              href={`/list/teachers?classId=${2}`}
            >
              Teachers
            </Link>
            <Link
              className="p-3 rounded-md bg-pink-50 hover:bg-opacity-80 transition"
              href="/"
            >
              Lessons
            </Link>
            <Link
              className="p-3 rounded-md bg-[#EDF9FD] hover:bg-opacity-80 transition"
              href="/"
            >
              Exams
            </Link>
            <Link
              className="p-3 rounded-md bg-[#FEFCE8] hover:bg-opacity-80 transition"
              href="/"
            >
              Assignments
            </Link>
            <Link
              className="p-3 rounded-md bg-[#FEFCE8] hover:bg-opacity-80 transition"
              href="/"
            >
              Results
            </Link>
          </div>
        </div>

        {/* OTHER COMPONENTS */}
        <Performance />
        <Annoucement />
      </div>
    </div>
  );
};

export default studentPage;
