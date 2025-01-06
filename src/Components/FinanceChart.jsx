'use client'
import Image from 'next/image';
import React from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
  } from "recharts";

const data = [
  { name: 'Jan', income: 4500, expense: 1500 },
  { name: 'Feb', income: 5000, expense: 3500 },
  { name: 'Mar', income: 5500, expense: 4505 },
  { name: 'Apr', income: 6000, expense: 5150 },
  { name: 'May', income: 7000, expense: 6100 },
  { name: 'jun', income: 8000, expense: 7100 },
  { name: 'jul', income: 9000, expense: 1800 },
  { name: 'Aug', income: 10000, expense: 2700 },
  { name: 'Sep', income: 10000, expense: 4500 },
  { name: 'Oct', income: 10500, expense: 4800 },
  { name: 'Nov', income: 12000, expense: 2859 },
  { name: 'Dec', income: 12000, expense: 2900 },
  
];

const FinanceChart = () => {
  return (
    <div className='bg-white rounded-xl w-full h-[350px] p-4'>
      {/* TITLE */}
      <div className='flex justify-between items-center'>
        <h1 className='font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-gray-500 text-sm'>FINANCE</h1> 
        <Image src={'/moreDark.png'} alt='' width={20} height={20} />
      </div>
      {/* CHART */}
      <div className='w-full h-[100%]'>
      <ResponsiveContainer>
      <LineChart data={data} className='text-xs'>
        <CartesianGrid strokeDasharray="3 3" stroke='#ddd' />
        <XAxis dataKey="name" axisLine={false} tick={{fill:"#d1d5db"}} tickLine={false} tickMargin={5} />
        <YAxis axisLine={false} tick={{fill:"#d1d5db"}} tickLine={false} tickMargin={10}/>
        <Tooltip />
        <Legend align='center' verticalAlign='top' wrapperStyle={{marginTop:"-5px", paddingBottom: '20px' }} /> 
        <Line
          type="monotone"
          dataKey="income"
          stroke="#CFCEFF"
          strokeWidth={4}
        />
        <Line type="monotone" dataKey="expense" stroke="#E6C5AD" strokeWidth={4} />
      </LineChart>
    </ResponsiveContainer>
       
      </div>
    </div>
  )
}

export default FinanceChart
