import Annoucement from '@/components/Annoucement'
import BigCalendar from '@/components/BigCalendar'
import FormModal from '@/components/FormModal'
import Performance from '@/components/Performance'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const singleTeacherPage = () => {
  return (
    <div className='flex-1 p-4 flex flex-col gap-4 xl:flex-row'>
        {/* LEFT */}
        <div className='w-full xl:w-2/3 '>
        {/* TOP */}
        <div className='flex flex-col lg:flex-row gap-4'>
          {/* USER INFO CARDS */}
          <div className='bg-[#CFCEFF] py-6 px-4 flex-1 flex rounded-md gap-4'>
            {/* USERIMAGE */}
            <div className='w-full lg:-ml-3' >
              <img
               src="https://images.pexels.com/photos/2888150/pexels-photo-2888150.jpeg?auto=compress&cs=tinysrgb&w=1200" 
               alt="" 
               width={144} 
               height={144} 
               className='w-28 h-28 rounded-full object-cover'/>

            </div>
            {/* USERiNFO */}
            <div className='w-2/3 flex flex-col justify-between gap-2 lg:-ml-28'>
            <div className='flex items-center gap-2'>
            <h1 className='text-sm font-semibold'>Idris Adedayo</h1>
              <FormModal type='update' table='teacher' data={
                {id: '1',
                name: 'Idris Adedayo',
                image: 'https://images.pexels.com/photos/2888150/pexels-photo-2888150.jpeg?auto=compress&cs=tinysrgb&w=1200',
                email: 'idrisAdedayo@gmail.com',
                phonenumber: '+234-8114218',
                department: 'Science',
                position: 'Head Teacher',
                qualifications: 'MBA, PhD',
                experience: '15 years',
                hire_date: '2010-01-01',
                graduation_date: '2020-06-30',
                salary: '50000',
                subjects: 'Mathematics, Physics, Chemistry',}
              }/>
            </div>
             
              <p className='text-xs text-gray-500'>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
              <div className='flex items-center justify-between flex-wrap text-xs font-small gap-2 '>
                <div className='w-full md:w-1/3 lg:full flex  items-center gap-2' >
                  <Image src="/date.png" alt="" width={12} height={12} />
                  <span>2024/2025</span>
                  </div> 
                
                <div className='w-full md:w-1/3 lg:full flex items-center gap-2'>
                  <Image src="/phone.png" alt="" width={12} height={12} />
                  <span>+234-8114218</span>
                  </div> 

                  <div className='w-full md:w-1/3 lg:full flex  items-center gap-2'>
                  <Image src="/mail.png" alt="" width={12} height={12} />
                  <span>idrisAdedayo@gmail.com</span>
                  </div> 
                

              </div>
            </div>
          </div>
          {/* SMALL CARDS */}
          <div className='flex-1 flex gap-4 justify-between flex-wrap'>
            {/* CARD */}
            <div className='bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]'>
              <Image src='/singleAttendance.png' alt='' width={24} height={24} className='w-6 h-6'/>
              <div>
                <h1 className='text-xl font-semibold'>90%</h1>
                <span className='text-xs text-gray-400'>Attendance</span>
              </div>
            </div>
            {/* CARD */}
            <div className='bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]'>
              <Image src='/singleBranch.png' alt='' width={24} height={24} className='w-6 h-6'/>
              <div>
                <h1 className='text-xl font-semibold'>2</h1>
                <span className='text-sm text-gray-400'>Branches</span>
              </div>
            </div>
            {/* CARD */}
            <div className='bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]'>
              <Image src='/singleLesson.png' alt='' width={24} height={24} className='w-6 h-6'/>
              <div>
                <h1 className='text-xl font-semibold'>6</h1>
                <span className='text-sm text-gray-400'>Lesson</span>
              </div>
            </div>
            {/* CARD */}
            <div className='bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]'>
              <Image src='/singleClass.png' alt='' width={24} height={24} className='w-6 h-6'/>
              <div>
                <h1 className='text-xl font-semibold'>6</h1>
                <span className='text-sm text-gray-400'>Class</span>
              </div>
            </div>

          </div>


        </div>
        {/* BOTTOM */}
        <div className='mt-4 bg-white rounded-md p-4 h-[800px]'>
          <h1>Teachers Schedule</h1>
          <BigCalendar/>
          </div>
        </div>
        {/* RIGHT */}
        <div className='w-full xl:w-1/3 flex flex-col gap-4'>
        <div className='bg-white p-4 rounded-md '>
          <h1 className='text-xl font-semibold'>Shortcuts</h1>
          <div className='mt-3 flex gap-2 flex-wrap text-xs text-gray-500'>
            <Link className='p-3 rounded-md bg-[#FEFCE8]' href='/'>Teachers Classes</Link>
            <Link className='p-3 rounded-md bg-[#F1F0FF]' href={`/list/teachers?studentId=${2}`}>Teachers Students</Link>
            <Link className='p-3 rounded-md bg-pink-50' href='/'>Teachers Lessons</Link>
            <Link className='p-3 rounded-md bg-[#EDF9FD]' href='/'>Teachers Exam</Link>
            <Link className='p-3 rounded-md bg-[#FEFCE8]' href='/'>Teachers Assignment</Link>

          </div>


        </div>
        <Performance/>
        <Annoucement/>

        </div>
      
    </div>
  )
}

export default singleTeacherPage
