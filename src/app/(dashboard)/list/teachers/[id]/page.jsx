import React from 'react'

const singleTeacherPage = () => {
  return (
    <div className='flex-1 p-4 flex flex-col gap-4 xl:flex-row'>
        {/* LEFT */}
        <div className='w-full xl:w-2/3 '>
        {/* TOP */}
        <div className='flex flex-col lg:flex-row  gap-4'>
          {/* USER INFO CARDS */}
          <div className='bg-[#c3ebfa] py-6 px-4 flex-1 flex rounded-md gap-4'>
            {/* USERIMAGE */}
            <div className='w-1/3'>
              <img
               src="https://images.pexels.com/photos/2888150/pexels-photo-2888150.jpeg?auto=compress&cs=tinysrgb&w=1200" 
               alt="" 
               width={144} 
               height={144} 
               className='rounded-full object-cover w-36 h-36'/>

            </div>
            {/* USERiNFO */}
            <div className='w-2/3 flex flex-col justify-between gap-2'>
              <h1 className='text-xl font-semibold'>Teacher Name</h1>
              <p className='text-sm text-gray-500'>Lorem ipsum dolor sit amet, consectetur adipisicing elit. At, cumque.</p>
              <div className='flex items-center justify-between flex-wrap text-xs font-medium gap-2 '>
                <div className='w-full md:w-1/3 flex  items-center gap-2' >
                  <img src="/date.png" alt="" width={14} height={14} />
                  <p>2024/2025</p>
                  </div> 
                <div className='w-full md:w-1/3 flex  items-center gap-2'>
                  <img src="/mail.png" alt="" width={14} height={14} />
                  <p>name@gmail.com</p>
                  </div> 
                <div className='w-full md:w-1/3 flex items-center gap-2'>
                  <img src="/phone.png" alt="" width={14} height={14} />
                  <p>+234-8114218</p>
                  </div> 
                

              </div>
            </div>
          </div>
          {/* SMALL CARDS */}
          <div>
            
          </div>
        </div>
        l
        {/* BOTTOM */}
        <div>Schedule</div>
        </div>
        {/* RIGHT */}
        <div className='w-full xl:w-1/2'>r

        </div>
      
    </div>
  )
}

export default singleTeacherPage
