import Annoucement from '@/components/Annoucement'
import BigCalendar from '@/components/BigCalendar'
import EventCalender from '@/components/EventCalender'
import React from 'react'

export default function studentPage() {
  return (
    <div className='p-4 flex gap-4 flex-col xl:flex-row'>
      {/* LEFT */}
      <div className='w-full xl:w-2/3'>
      <div className='h-full bg-white p-4 rounded-md'>
        <h1 className='font-semibold text-sm'>Schedule(4A)</h1>
        <BigCalendar/>

      </div>
      </div>
      
      {/* RIGHT */}
      <div className='w-full flex flex-col gap-8 xl:w-1/3'>
      <EventCalender/>
      <Annoucement/>
      
      </div>
      
    </div>
  )
}
