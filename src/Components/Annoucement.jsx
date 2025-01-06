import React from 'react'

const Annoucement = () => {
  return (
    <div className='bg-white rounded-md p-4'>
        <div className='flex items-center justify-between '>
            <h1 className='font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-gray-500 text-sm'>ANNOUNCEMENT</h1>
            <span className='text-gray-300 text-xs'>View All</span>
        </div>
       <div className='flex flex-col gap-4 mt-2'>
       <div className='bg-[#FEFCE8] rounded-md p-4 '>
        <div className='flex items-center justify-between '>
            <h2 className='text-sm font-semibold text-gray-600'>Registration</h2>
            <span className='text-gray-400 bg-white rounded-md px-1 py-1 text-xs'>25th March, 2023</span>
        </div>
        <p className='text-gray-400 text-xs'>Registration for 2024/2025 session is schedule for 25th march,2025.All student must be available with their documents.</p>
       </div>
       <div className='bg-[#F1F0FF] rounded-md p-4 '>
        <div className='flex items-center justify-between '>
            <h2 className='text-sm font-semibold text-gray-600'>Registration</h2>
            <span className='text-gray-400 bg-white rounded-md px-1 py-1 text-xs'>25th March, 2023</span>
        </div>
        <p className='text-gray-400 text-xs'>Registration for 2024/2025 session is schedule for 25th march,2025.All student must be available with their documents.</p>
       </div>
       <div className='bg-[#EDF9FD] rounded-md p-4 '>
        <div className='flex items-center justify-between '>
            <h2 className='text-sm font-semibold text-gray-600'>Registration</h2>
            <span className='text-gray-400 bg-white rounded-md px-1 py-1 text-xs'>25th March, 2023</span>
        </div>
        <p className='text-gray-400 text-xs'>Registration for 2024/2025 session is schedule for 25th march,2025.All student must be available with their documents.</p>
       </div>

       </div>
      
    </div>
  )
}

export default Annoucement
