import FormModal from '@/Components/FormModal';
import Pagination from '@/Components/Pagination';
import Table from '@/Components/Table';
import TableSearch from '@/Components/TableSearch';
import { role } from '@/lib/data';
import { ITEM_PER_PAGE } from '@/lib/paginationSettings';
import prisma from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';

import React from 'react';

const column = [
  { header: 'Subject', accessor: 'subject' },
  { header: 'Student', accessor: 'student', className: '' },
  { header: 'Score', accessor: 'score', className: 'hidden md:table-cell' },
  { header: 'Teacher', accessor: 'teacher', className: 'hidden md:table-cell' },
  { header: 'Class', accessor: 'class', className: 'hidden md:table-cell' },
  { header: 'Date', accessor: 'date', className: 'hidden md:table-cell' },
  { header: 'Actions', accessor: 'actions' },
];

const resultListPage = async ({ searchParams }) => {
  const params = searchParams ? await searchParams : {};
  const page = params.page || 1; // Default to 1 if not provided
  const p = parseInt(page);

  // Construct query conditions
  const query = {};
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        switch (key) {
          case 'search':
            query.OR =[
              {exam:{name:{ contains: value, mode: 'insensitive' }}},
              {student:{name:{ contains: value, mode: 'insensitive' }}},

            ] ;
            break;
          // Add additional filters as needed
          default:
            break;
        }
      }
    }
  }

  const dataRes = await prisma.result.findMany({
    where: query,
    include: {
      student: { select: { name: true, surname: true } },
      exam: {
        include: {
          lesson: {
            select: {
              class: { select: { name: true } },
              teacher: { select: { name: true } },
            },
          },
        },
      },
      assignment: {
        include: {
          lesson: {
            select: {
              class: { select: { name: true } },
              teacher: { select: { name: true } },
            },
          },
        },
      },
    },
    take: ITEM_PER_PAGE,
    skip: (p - 1) * ITEM_PER_PAGE,
  });

  const count = await prisma.result.count({ where: query });

  const data = dataRes.map((item) => {
    // Check if it's an exam or an assignment
    const isExam = Boolean(item.exam); // True if `exam` field is populated
    const assessment = item.exam || item.assignment; // Use exam if present, otherwise assignment

    return {
      id: item.result_id,
      subject: assessment?.name || 'N/A', // Exam/Assignment name
      student: `${item.student?.surname} ${item.student?.name}`,
      score: item.score,
      teacher: assessment?.lesson?.teacher?.name || 'N/A', // Teacher associated with the lesson
      class: assessment?.lesson?.class?.name || 'N/A', // Class associated with the lesson
      date: isExam
        ? new Date(item.exam.createdAt).toLocaleDateString()
        : 'N/A', // Add created date for exam
      type: isExam ? 'Exam' : 'Assignment', // Determine type
    };
  });

  const renderRow = (result) => (
    <tr key={result.id} className="text-xs border-b border-grey-200 even:bg-slate-50 hover:bg-[#F1F0FF]">
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{result.subject}</h3>
          {/* <span className="text-gray-500 text-sm">{result.type}</span> Show type (Exam/Assignment) */}
        </div>
      </td>
      <td className="">{result.student}</td>
      <td className="hidden md:table-cell">{result.score}</td>
      <td className="hidden md:table-cell">{result.teacher}</td>
      <td className="hidden md:table-cell">{result.class}</td>
      <td className="hidden md:table-cell">{result.date}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/results/${result.id}`}>
            <FormModal type="update" table="result" />
          </Link>
          {role === 'admin' && (
            <FormModal type="delete" table="result" />
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white rounded-md p-4 flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Results</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src="/plus.png" alt="Add" width={14} height={14} />
            </button>
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table column={column} renderRow={renderRow} data={data} />
      {/* PAGINATION */}
      <Pagination count={count} page={p} />
    </div>
  );
};

export default resultListPage;
