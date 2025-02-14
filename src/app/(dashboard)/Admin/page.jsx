import React from "react";
import Cards from "@/components/Cards";
import CountChart from "@/components/CountChart";
import AttendanceChart from "@/components/AttendanceChart";
import FinanceChart from "@/components/FinanceChart";
import EventCalender from "@/components/EventCalender";
import Annoucement from "@/components/Annoucement";
import prisma from "@/lib/prisma";
import SessionModal from "@/components/SessionModal"; // Client Component for modal

export default async function AdminPage() {
  // Fetch the most recent session (server-side)
  const latestSession = await prisma.session.findFirst({
    orderBy: { id: "desc" },
  });

  // Fetch terms associated with the most recent session (server-side)
  const terms = await prisma.term.findMany({
    where: {
      sessionId: latestSession?.id, // Ensure terms are for the latest session
    },
    orderBy: { id: "desc" }, // Assuming you want the most recent terms first
  });
  
  // Fetch Card Data (server-side)
  const cardData = {
    admin: await prisma.admin.count(),
    student: await prisma.student.count(),
    teacher: await prisma.teacher.count(),
    parent: await prisma.parent.count(),
    session: latestSession?.name || "No active session",
  };

  return (
    <div className="p-4 flex flex-col md:flex-row gap-2">
      {/* LEFT PANEL */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        {/* CARDS SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* ADMIN CARD WITH SESSION MODAL BUTTON */}
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

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <EventCalender />
        <Annoucement />
      </div>
    </div>
  );
}
