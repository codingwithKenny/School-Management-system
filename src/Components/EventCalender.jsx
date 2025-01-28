"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // Import the default Calendar styles

// TEMPORARY EVENT DATA
const Events = [
  {
    id: 1,
    title: "Lorem ipsum dolor ",
    time: "09:00 AM-12:00 PM",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: 2,
    title: "Lorem ipsum dolor ",
    time: "09:00 AM-12:00 PM",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: 3,
    title: "Lorem ipsum dolor ",
    time: "09:00 AM-12:00 PM",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
];

const EventCalendar = () => {
  const [value, setValue] = useState(null); // Ensure no mismatch by deferring initialization
  const [isMounted, setIsMounted] = useState(false); // Track hydration status

  useEffect(() => {
    setValue(new Date()); // Initialize date only on the client
    setIsMounted(true); // Mark component as mounted
  }, []);

  if (!isMounted || !value) {
    return null; // Prevent rendering until the component is fully hydrated
  }

  return (
    <div className="rounded-md bg-white p-4 shadow-md">
      {/* Calendar Component */}
      <Calendar onChange={setValue} value={value} className="text-xs" locale="en-US" />

      {/* Events Header */}
      <div className="flex justify-between items-center mt-4 mb-2">
        <h1 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-gray-500 text-sm">
          EVENTS
        </h1>
        <Image src={"/moreDark.png"} alt="More Options" width={20} height={20} />
      </div>

      {/* Events List */}
      <div className="flex flex-col gap-2">
        {Events.map((event, index) => (
          <div
            key={event.id}
            className={`p-3 rounded-md border-2 border-gray-100 border-t-4 ${
              index % 2 === 0 ? "border-t-[#C3EBFA]" : "border-t-[#CFCEFF]"
            }`}
          >
            <div className="flex items-center justify-between">
              <h1 className="text-gray-700 text-sm font-medium">{event.title}</h1>
              <span className="text-gray-500 text-xs">{event.time}</span>
            </div>
            <p className="text-gray-400 mt-1 text-sm">{event.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventCalendar;
