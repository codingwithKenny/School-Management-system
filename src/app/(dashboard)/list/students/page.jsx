import FormModal from '@/components/FormModal';
import Pagination from '@/components/Pagination';
import Table from '@/components/Table';
import TableSearch from '@/components/TableSearch';
import { ITEM_PER_PAGE } from '@/lib/settings';
import prisma from '@/lib/prisma';
import Image from 'next/image';
import React from 'react';
import { getUserRole } from '@/lib/authUtils';
import { fetchStudents } from '@/lib/actions';


const studentListPage = async({ searchParams}) => {
    const role = await getUserRole();
  
  const params = searchParams ? await searchParams : {};

  const page = params.page || 1; 
  const p = parseInt(page);

    // QUERY CONDITIONS
    const query = {};
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          switch (key) {
            case 'teacherId':
              query.lessons = {
                some: { teacherId: parseInt(value) },
              };
              break;
              case 'search':
                query.OR = [
                    { name: { contains: value, mode: "insensitive" } }, // Search by student name
                    { class: { name: { contains: value, mode: "insensitive" } } }, // Search by class name
                ];
                break;
          }
        }
      }
    }

  // FETCH STUDENT FROM DATABASE AND COUNT
  const studentData = await prisma.student.findMany({
    where: {
      ...query,
      isDeleted: false,
    },
    select: {
      id: true,
      firstname: true, // Use firstname instead of name
      surname: true,   // Use surname instead of name
      admission: true,
      phone: true,
      address: true,
      email: true,
      img: true,
      sex: true,  // Use sex as defined in the schema
      paymentStatus: true,
      sessionId: true,
      termId: true,
      classId: true,
      gradeId: true,
      class: { select: { id: true, name: true } }, 
      grade: { select: { id: true, name: true } },
      subjects: { select: { subject: { select: { id: true, name: true } } } },
      createdAt: true,
      isDeleted: true,
      deletedAt: true,
      session: true,
      term: true,
      paymentHistory: true,
      results: true,
      attendance: true,
      classRecords: true,
      histories: true,
    },
    take: ITEM_PER_PAGE,
    skip: (p - 1) * ITEM_PER_PAGE,
  });
  
  
  


  const count = await prisma.student.count({
    where: {
      ...query,
      isDeleted: false, // ✅ Only count students who are NOT deleted
    },
  });
   
 const column = [
  { header: 'Info', accessor: 'info' },
  { header: 'Adnission No', accessor: 'studentId', className: 'hidden md:table-cell' },
  { header: 'Grade', accessor: 'grade', className: 'hidden md:table-cell' },
  { header: 'Phone', accessor: 'phone', className: 'hidden lg:table-cell' },
  { header: 'Address', accessor: 'address', className: 'hidden lg:table-cell' },
  ...(role === 'admin' ? [ { 
    header: "Actions", 
    accessor: "actions" }]
    :
    []),];


  const renderRow = (student, index) => (
    <tr key={student.id || `fallback-${index}`} className='text-xs border-b border-grey-200 even:bg-slate-50 hover:bg-[#F1F0FF]'>
      <td className='flex items-center  gap-4 p-4 '>
        <Image
          src={student.photo || '/noAvatar.png'}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 object-cover rounded-full"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{student.firstname}</h3>
          <h4 className="text-gray-500 text-sm">{student.class?.name|| 'N/A'}</h4>
        </div>
      </td>
      <td className="hidden md:table-cell">{student.admission}</td>
      <td className="hidden md:table-cell">{student.grade?.name || 'N/A'}</td>
      <td className="hidden md:table-cell">{student.phone}</td>
      <td className="hidden md:table-cell">{student.address}</td>
      <td>
      <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormModal
                type="update"
                table="student"
                data={student}
              />
              <FormModal
                type="delete"
                table="student"
                id={student?.id}
              />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-purple-50 rounded-md p-4 flex-1 mt-10">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Students</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src={"/filter.png"} alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src={"/sort.png"} alt="" width={14} height={14} />
            </button>
            <FormModal type='create' table='student'/>
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table column={column} renderRow={renderRow} data={studentData || []} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default studentListPage;
