import React from "react";
import Cards from "@/components/Cards";
import CountChart from "@/components/CountChart";
import AttendanceChart from "@/components/AttendanceChart";
import FinanceChart from "@/components/FinanceChart";
import EventCalender from "@/components/EventCalender";
import Annoucement from "@/components/Annoucement";
import prisma from "@/lib/prisma";


export default async function AdminPage() {
  // FETCH CARD DATA
  const cardData = {
    admin: await prisma.admin.count(),
    student: await prisma.student.count(),
    teacher: await prisma.teacher.count(),
    parent: await prisma.parent.count(),
    session: await prisma.session.findFirst({
      orderBy: { id: "desc" }, // Fetch the most recent session
    }),
  };

   // FETCH DATA FOR BOYS AND GIRLS
   const data = await prisma.student.groupBy({
    by: ["sex"],
    _count: true,
  });

  const boys = data.find((d) => d.sex === "MALE")?._count || 0;
  const girls = data.find((d) => d.sex === "FEMALE")?._count || 0;


  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* LEFT */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        <div className="flex gap-4 justify-between flex-wrap">
          <Cards
            color="#E6C5AD"
            type="Admin"
            data={cardData.admin}
            session={cardData.session?.name || "No active session"}
          />
          <Cards color="#CFCEFF" type="Student" data={cardData.student} session={cardData.session?.name || "No active session"} />
          <Cards color="#E6C5AD" type="Teacher" data={cardData.teacher} session={cardData.session?.name || "No active session"}/>
          <Cards color="#CFCEFF" type="Parent" data={cardData.parent} session={cardData.session?.name || "No active session"}/>
        </div>
        {/* MIDDLE CHART */}
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* COUNTCHART */}
          <div className="w-full lg:w-1/3">
            <CountChart boys={boys} girls={girls}/>
          </div>
          {/* ATTENDANCECHART */}
          <div className="w-full lg:w-2/3">
            <AttendanceChart />
          </div>
        </div>
        {/* BOTTOMGRAPH */}
        <div className="w-full h-[350px]">
          <FinanceChart />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        {/* EVENTCALENDAR */}
        <EventCalender />
        {/* ANNOUNCEMENT */}
        <Annoucement />
      </div>
    </div>
  );
}
