import Image from 'next/image'
import React from 'react'

const TableSearch = () => {
  return (
    <div className="w-full md:w-auto flex items-center gap-2 text-xs bg-white p-2 rounded-full ring-[1.5px] ring-grey-300">
    <Image src="/search.png" alt="Search Icon" width={14} height={14} />
    <input
      type="text"
      placeholder="Search..."
      className="outline-none text-sm w-full placeholder-gray-500"
    />
  </div>
  )
}

export default TableSearch
