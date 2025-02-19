import React from "react";
import Cards from "@/components/Cards";
import CountChart from "@/components/CountChart";
import AttendanceChart from "@/components/AttendanceChart";
import FinanceChart from "@/components/FinanceChart";
import EventCalender from "@/components/EventCalender";
import Annoucement from "@/components/Annoucement";
import prisma from "@/lib/prisma";
import SessionModal from "@/components/SessionModal"; 

export default async function AdminPage() {
  const latestSession = await prisma.session.findFirst({
    orderBy: { id: "desc" },
  });

  const terms = await prisma.term.findMany({
    where: {
      sessionId: latestSession?.id,
    },
    orderBy: { id: "desc" }, 
  });
    //  cARD iNFO FROM DB
    const cardData = {
    admin: await prisma.admin.count(),
    student: await prisma.student.count(),
    teacher: await prisma.teacher.count(),
    parent: await prisma.parent.count(),
    session: latestSession?.name || "No active session",
  };

  return (
    <div className="p-4 flex flex-col md:flex-row gap-2">
      {/* LEFT SIDE */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        {/* CARDS SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* SESSION MODAL */}
          <SessionModal sessionName={cardData.session} terms={terms} />
          
          {/* OTHER CARDS */}
          <Cards color="#CFCEFF" type="Student" data={cardData.student} session={cardData.session} />
          <Cards color="#E6C5AD" type="Teacher" data={cardData.teacher} session={cardData.session} />
          <Cards color="#CFCEFF" type="Parent" data={cardData.parent} session={cardData.session} />
        </div>

        {/* MIDDLE CHARTS */}
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="w-full lg:w-1/3">
            <CountChart boys={120} girls={130} />
          </div>
          <div className="w-full lg:w-2/3">
            <AttendanceChart />
          </div>
        </div>

        {/* FINANCIAL CHART */}
        <div className="w-full h-[350px]">
          <FinanceChart />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <EventCalender />
        <Annoucement />
      </div>
    </div>
  );
}
