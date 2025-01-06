import React from "react";
import Cards from "@/Components/Cards";
import CountChart from "@/Components/CountChart";
import AttendanceChart from "@/Components/AttendanceChart";
import FinanceChart from "@/Components/FinanceChart";
import EventCalender from "@/Components/EventCalender";
import Annoucement from "@/Components/Annoucement";




const AdminPage = () => {
  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* LEFT */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        <div className="flex gap-4 justify-between flex-wrap">
          <Cards color="#CFCEFF" text="Student" num={5000} session='2024/2025' />
          <Cards color="#E6C5AD" text="Teacher" num={3000} session='2024/2025'/>
          <Cards color="#CFCEFF" text="Parent" num={2590} session='2024/2025'/>
          <Cards color="#E6C5AD" text="Staff" num={1500} session='2024/2025'/>
        </div>
        {/* MIDDLE CHART */}
        <div className="flex flex-col gap-4 lg:flex-row"> 
        {/* COUNTCHART */}
        <div className="w-full lg:w-1/3">
          <CountChart/>
        </div>
        {/* ATTENDANCECHART */}
        <div className="w-full lg:w-2/3">
        <AttendanceChart/>

        </div>
        </div>
        {/* BOTTOMGRAPH */}
        <div className="w-full h-[350px]">
         <FinanceChart/>
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
      {/* EVENTCALENDAR */}
      
        <EventCalender/>
     
      {/* ANNOUNCEMENT */}

      <Annoucement/>
    

  
      </div>
    </div>
  );
};

export default AdminPage;
