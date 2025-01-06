import Pagination from '@/Components/Pagination';
import Table from '@/Components/Table';
import TableSearch from '@/Components/TableSearch';
import {eventsData, resultsData, role} from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';

import React from 'react';

const column = [
  { header: 'Title', accessor: 'title' },
  { header: 'Class', accessor: 'class', className: '' },
  { header: 'Date', accessor: 'date', className: 'hidden md:table-cell' },
  { header: 'Start Time', accessor: 'startTime', className: 'hidden md:table-cell' },
  { header: 'End Time', accessor: 'endTime', className: 'hidden md:table-cell' },
  { header: 'Actions', accessor: 'actions' },
];

const eventListPage = () => {
  const renderRow = (event) => (
    <tr key={event.id} className='text-xs border-b border-grey-200 even:bg-slate-50 hover:bg-[#F1F0FF]'>
      <td className='flex items-center  gap-4 p-4 '>
        <div className="flex flex-col">
          <h3 className="font-semibold">{event.title}</h3>
        </div>
      </td>
      <td className="">{event.class}</td>
      <td className="hidden md:table-cell">{event.date}</td>
      <td className="hidden md:table-cell">{event.startTime}</td>
      <td className="hidden md:table-cell">{event.endTime}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/teachers/${event.id}`}>
            <button className="w-7 h-7 rounded-full flex items-center justify-center bg-[#C3EBFA]">
              <Image src={"/edit.png"} alt="" width={16} height={16} />
            </button>
          </Link>
          {role === 'admin' && (
            <button className="w-7 h-7 rounded-full flex items-center justify-center bg-[#CFCEFF]">
              <Image src={"/delete.png"} alt="" width={16} height={16} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white rounded-md p-4 flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Result</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src={"/filter.png"} alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src={"/sort.png"} alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src={"/plus.png"} alt="" width={14} height={14} />
            </button>
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table column={column} renderRow={renderRow} data={eventsData} />
      {/* PAGINATION */}
      <Pagination />
    </div>
  );
};

export default eventListPage;
