import FormModal from '@/Components/FormModal';
import Pagination from '@/Components/Pagination';
import Table from '@/Components/Table';
import TableSearch from '@/Components/TableSearch';
import { classesData, role} from '@/lib/data';
import { ITEM_PER_PAGE } from '@/lib/paginationSettings';
import prisma from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';

import React from 'react';

const column = [
  { header: 'Class Name', accessor: 'name' },
  { header: 'Capacity', accessor: 'capacity', className: 'hidden md:table-cell' },
  { header: 'Grade', accessor: 'grade', className: 'hidden md:table-cell' },
  { header: 'Supervisor', accessor: 'supervisor', className: 'hidden md:table-cell' },
  { header: 'Actions', accessor: 'actions' },
];

const classListPage = async ({searchParams = {}}) => {
   const page = searchParams?.page || 1
   const p = parseInt(page)

    // Construct query conditions
  const query = {};
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined) {
        switch (key) {
          // Add additional filters as needed
          case 'search':
            query.name = { contains: value, mode:"insensitive" };
            break;
          // Add additional filters as needed
          default:
            break;
        }
      }
    }
  }
 const classData = await prisma.class.findMany({
  where:query,
  include:{
    students: true,
    grade: true,
    supervisor: true,
    lessons: true
  },
  take:ITEM_PER_PAGE,
  skip: (p-1)* ITEM_PER_PAGE

 })
const count = await prisma.class.count({where:query})

  const renderRow = (classes) => (
    <tr key={classes.id} className='text-xs border-b border-grey-200 even:bg-slate-50 hover:bg-[#F1F0FF]'>
      <td className='flex items-center  gap-4 p-4 '>
        <div className="flex flex-col">
          <h3 className="font-semibold">{classes.name}</h3>
        </div>
      </td>
      <td className="hidden md:table-cell">{classes.capacity || "N/A"}</td>
      <td className="hidden md:table-cell">{classes.grade.name}</td>
      <td className="hidden md:table-cell">{classes.supervisor?.name}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/classes/${classes.id}`}>
          
          </Link>
          {role === 'admin' && (
            <>
            <FormModal type='update' data={classes}/>
             <FormModal type='delete' data={classes} id={classes.id}/>
            </>
         
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white rounded-md p-4 flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Classes</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src={"/filter.png"} alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src={"/sort.png"} alt="" width={14} height={14} />
            </button>
            {/* <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src={"/plus.png"} alt="" width={14} height={14} />
            </button> */}
            <FormModal type='create' table='class'/>
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table column={column} renderRow={renderRow} data={classData || []} />
      {/* PAGINATION */}
      <Pagination count={count} page={p} />
    </div>
  );
};

export default classListPage;
