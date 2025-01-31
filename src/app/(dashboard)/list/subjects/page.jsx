import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { ITEM_PER_PAGE } from "@/lib/settings";
import prisma from "@/lib/prisma";
import Image from "next/image";
import React from "react";
import { role } from "@/lib/authUtils";

const column = [
  { header: "Subject Name", accessor: "name" },
  {
    header: "Teachers",
    accessor: "teachers",
    className: "hidden md:table-cell",
  },
  ...(role === "admin"
    ? [
        {
          header: "Actions",
          accessor: "actions",
        },
      ]
    : []),
];

const subjectListPage = async ({ searchParams }) => {
  const params = searchParams ? await searchParams : {};
  const page = params?.page || 1;
  const p = parseInt(page);

  // QUERY CONDITIONS - Only fetch subjects that are NOT deleted
  const query = { deletedAt: null }; // 🔹 Exclude soft-deleted subjects

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.name = { contains: value, mode: "insensitive" };
            break;
          default:
            break;
        }
      }
    }
  }

  // FETCH DATA AND COUNT FROM DB
  const subjectData = await prisma.subject.findMany({
    where: query, // 🔹 Ensure only non-deleted subjects are returned
    include: {
      teacher: true,
    },
    take: ITEM_PER_PAGE,
    skip: (p - 1) * ITEM_PER_PAGE,
  });

  const count = await prisma.subject.count({ where: query }); // 🔹 Ensure correct count without soft-deleted records

  const renderRow = (subject) => (
    <tr
      key={subject.id}
      className="text-xs border-b border-grey-200 even:bg-slate-50 hover:bg-[#F1F0FF]"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{subject.name}</h3>
        </div>
      </td>
      <td className="hidden md:table-cell">{subject.teacher?.name}</td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormModal type="update" table="subject" data={subject} />
              <FormModal type="delete" table="subject" id={subject?.id} />
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
        <h1 className="hidden md:block text-lg font-semibold">All Subjects</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src={"/filter.png"} alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src={"/sort.png"} alt="" width={14} height={14} />
            </button>
            {role === "admin" && <FormModal type="create" table="subject" />}
          </div>
        </div>
      </div>

      {/* LIST */}
      <Table column={column} renderRow={renderRow} data={subjectData || []} />

      {/* PAGINATION */}
      <Pagination count={count} page={p} />
    </div>
  );
};

export default subjectListPage;
