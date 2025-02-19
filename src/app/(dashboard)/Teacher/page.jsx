import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

// Dynamically import components
const Annoucement = dynamic(() => import("@/components/Annoucement"));
const BigCalendar = dynamic(() => import("@/components/BigCalendar"));
const FormModal = dynamic(() => import("@/components/FormModal"));
const Performance = dynamic(() => import("@/components/Performance"));

export default async function TeacherPage() {
  // ✅ Get the current logged-in user from Clerk
  const { userId } = await auth();

  console.log(userId, "👤 Current User ID");

  // ✅ Redirect to Sign-in if no user is logged in
  if (!userId) {
    redirect("/sign-in");
  }

  // ✅ Fetch the teacher's details from the database
  const teacher = await prisma.teacher.findUnique({
    where: { id: userId },
    include: {
      subjects: { include: { subject: true } },
      classes: true,
    },
  });

  if (!teacher) {
    return <div className="text-center text-red-500">Error: Teacher not found!</div>;
  }

  return  (
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
               src={teacher.img || "/noAvatar.png"}
               alt="" 
               width={144} 
               height={144} 
               className='w-28 h-28 rounded-full object-cover'/>

            </div>
            {/* USERiNFO */}
            <div className='w-2/3 flex flex-col justify-between gap-2 lg:-ml-28'>
            <div className='flex items-center gap-2'>
            <h1 className='text-sm font-semibold'>{teacher.name}</h1>
              <FormModal type='update' table='teacher' data={teacher}/>
            </div>
             
              <p className='text-xs text-gray-500'>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
              <div className='flex items-center justify-between flex-wrap text-xs font-small gap-2 '>
                <div className='w-full md:w-1/3 lg:full flex  items-center gap-2' >
                  <Image src="/date.png" alt="" width={12} height={12} />
                  <span>2024/2025</span>
                  </div> 
                
                <div className='w-full md:w-1/3 lg:full flex items-center gap-2'>
                  <Image src="/phone.png" alt="" width={12} height={12} />
                  <span>{teacher.phone || "N/A"}</span>
                  </div> 

                  <div className='w-full md:w-1/3 lg:full flex  items-center gap-2'>
                  <Image src="/mail.png" alt="" width={12} height={12} />
                  <span>{teacher.email}</span>
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
  );
}
