import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { ITEM_PER_PAGE } from "@/lib/settings";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

import React from "react";
import { role } from "@/lib/authUtils";

const column = [
  { header: "Info", accessor: "info" },
  {
    header: "Student Name",
    accessor: "studentname",
    className: "hidden md:table-cell",
  },
  { header: "Phone", accessor: "phone", className: "hidden md:table-cell" },
  { header: "Address", accessor: "address", className: "hidden lg:table-cell" },
  { header: "Actions", accessor: "actions" },
];


const parentListPage = async({ searchParams }) => {
  const params = searchParams ? await searchParams : {};

  const page = params.page || 1; // Default to 1 if not provided
  const p = parseInt(page);

  // CQUERY CONDITIONS
  const query = {};
 
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        switch (key) {
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

  // FETCH PARENT AND COUNT
  const data = await prisma.parent.findMany({
    where: query,
    include: {
      children: true, 
    },
    take: ITEM_PER_PAGE,
    skip: (p - 1) * ITEM_PER_PAGE,
  });

  const count = await prisma.parent.count({ where: query });

  
  

  const renderRow = (parent) => (
    <tr
      key={parent.parent_id}
      className="text-xs border-b border-grey-200 even:bg-slate-50 hover:bg-[#F1F0FF]"
    >
      <td className="flex items-center  gap-4 p-4 ">
        <div className="flex flex-col">
          <h3 className="font-semibold">{parent.name}</h3>
          <h4 className="text-gray-500 text-sm">{parent.email}</h4>
        </div>
      </td>
      <td className="hidden md:table-cell">{parent.children?.map((item)=> item.name).join(",")}</td>
      <td className="hidden md:table-cell">{parent.phone || "N/A"}</td>
      <td className="hidden md:table-cell">{parent.address || "N/A"}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/parents/${parent.parent_id}`}></Link>
          {role === "admin" && (
            // <button className="w-7 h-7 rounded-full flex items-center justify-center bg-[#CFCEFF]">
            //   <Image src={"/delete.png"} alt="" width={16} height={16} />
            // </button>
            <>
              <FormModal type="update" table="parent" id={parent} />
  
              <FormModal type="delete" table="parent" id={parent.parent_id} />
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
        <h1 className="hidden md:block text-lg font-semibold">All Parent</h1>
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
             {role === "admin" && (
            // <button className="w-7 h-7 rounded-full flex items-center justify-center bg-[#CFCEFF]">
            //   <Image src={"/delete.png"} alt="" width={16} height={16} />
            // </button>
            <>
             <FormModal type="create" table="parent" />
            </>
          )}
           
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table column={column} renderRow={renderRow} data={data || []} />
      {/* PAGINATION */}
      <Pagination count={count} page={p} />
    </div>
  );
};

export default parentListPage;
