'use client'
import Image from 'next/image';
import React from 'react'
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', Present: 45, Absent: 55 },
  { name: 'Tue', Present: 60, Absent: 40 },
  { name: 'Wed', Present: 70, Absent: 30 },
  { name: 'Thur', Present: 80, Absent: 20 },
  { name: 'Fri', Present: 50, Absent: 50 },
];

const AttendanceChart = () => {
  return (
    <div className='bg-white rounded-xl w-full h-[260px] p-2'>
      {/* TITLE */}
      <div className='flex justify-between items-center'>
        <h1 className='font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-gray-500 text-sm'>ATTENDANCE</h1> 
        <Image src={'/moreDark.png'} alt='' width={20} height={20} />
      </div>
      {/* CHART */}
      <div className='w-full h-[100%]'>
        <ResponsiveContainer>
          <BarChart
            width={500}
            height={300}
            data={data}
            barSize={10}
            className='text-xs'
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke='#ddd' />
            <XAxis dataKey="name"  axisLine={false} tick={{fill:"#d1d5db"}} tickLine={false}/>
            <YAxis axisLine={false} tick={{fill:"#d1d5db"}} tickLine={false} /> {/* Set domain for y-axis */}
            <Tooltip />
            <Legend align='left' verticalAlign='top' wrapperStyle={{marginTop:"5px", paddingBottom: '20px' }} />
            <Bar dataKey="Present" fill="#C3EBFA" legendType='circle' radius={[10,10,0,0]} />
            <Bar dataKey="Absent" fill="#FAE27C" legendType='circle' radius={[10,10,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default AttendanceChart
