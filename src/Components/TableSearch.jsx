'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'

const TableSearch = () => {
  const router = useRouter()
   const handleSubmit = (e)=>{
    e.preventDefault()
   const  value = e.currentTarget[0].value
    const params = new URLSearchParams(window.location.search)
    params.set("search", value)
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.push(newUrl);
   }
  return (
  <form
   onSubmit={handleSubmit} 
    className="w-full md:w-auto flex items-center gap-2 text-xs bg-white p-2 rounded-full ring-[1.5px] ring-grey-300">
    <Image src="/search.png" alt="Search Icon" width={14} height={14} />
    <input
      type="text"
      placeholder="Search..."
      className="outline-none text-sm w-full placeholder-gray-500"
    />
  </form>
  )
}

export default TableSearch
