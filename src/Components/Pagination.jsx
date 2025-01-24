'use client'
import { ITEM_PER_PAGE } from '@/lib/paginationSettings'
import { useRouter } from 'next/navigation'
import React from 'react'

const Pagination = ({page, count}) => {
  const router = useRouter()
  const changePage = (newPage) => {
    const params = new URLSearchParams(window.location.search)
    params.set('page', newPage.toString())
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.push(newUrl);
  }
  const hasPrev = ITEM_PER_PAGE *(page -1) > 0
  const hasNext = ITEM_PER_PAGE * page < count
  return (
    <div className='p-4 flex items-center justify-between text-gray-500'>
        <button disabled = {!hasPrev} className='py-2 px-4 rounded-md bg-slate-200 disabled:opacity-50 disable:cursor-not-allowed'
        onClick={()=>{changePage(page - 1)}}>
          Prev
          </button>
        <div className='flex items-center gap-2 text-sm'>
          {Array.from({
            length :Math.ceil(count / ITEM_PER_PAGE)},
            (_,index) => {
              const pageIndex = index + 1;
              return  (<button key={pageIndex} className={`px-2 rounded-sm  ${page === pageIndex? "bg-[#C3EBFA]" :'' }`}
              onClick={()=>{changePage(pageIndex)}}>{pageIndex}</button> )}
            )}

            
        </div>
        <button 
        className='py-2 px-4 rounded-md bg-slate-200 disabled:opacity-50 disable:cursor-not-allowed' 
        onClick={()=>{changePage(page +1)}}
        disabled={!hasNext}  
        >
          Next
        </button>
      
    </div>
  )
}

export default Pagination
