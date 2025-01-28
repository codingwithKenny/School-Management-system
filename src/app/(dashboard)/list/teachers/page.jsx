import Image from 'next/image';
import Link from 'next/link';
import FormModal from '@/components/FormModal';
import Pagination from '@/components/Pagination';
import Table from '@/components/Table';
import TableSearch from '@/components/TableSearch';
import prisma from '@/lib/prisma';
import { ITEM_PER_PAGE } from '@/lib/settings';
import { role } from '@/lib/authUtils';

export default async function TeacherListPage({ searchParams}) {
  const params = searchParams ? await searchParams : {};

  const page = params.page || 1; // Default to 1 if not provided
  const p = parseInt(page);

  // Construct query conditions
  const query = {};
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        switch (key) {
          case 'classId':
            query.lessons = {
              some: { classId: parseInt(value) },
            };
            break;
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

  // Fetch teachers and count
  const teachersData = await prisma.teacher.findMany({
    where: query,
    include: {
      subjects: true, // Include related subjects
      classes: true,  // Include related classes
    },
    take: ITEM_PER_PAGE,
    skip: (p - 1) * ITEM_PER_PAGE,
  });

  const count = await prisma.teacher.count({ where: query });


  // Table column definitions
  const column = [
    { header: 'Info', accessor: 'info' },
    { header: 'Teacher Id', accessor: 'id', className: 'hidden md:table-cell' },
    { header: 'Subject', accessor: 'subjects', className: 'hidden md:table-cell' },
    { header: 'Classes', accessor: 'classes', className: 'hidden md:table-cell' },
    { header: 'Phone', accessor: 'phone', className: 'hidden lg:table-cell' },
    { header: 'Address', accessor: 'address', className: 'hidden lg:table-cell' },
 ...(role === 'admin' ? [ { 
    header: "Actions", 
    accessor: "actions" }]
    :
    []),  ];

  // Render table rows
  const renderRow = (teacher) => (
    <tr key={teacher.id} className="text-xs border-b border-grey-200 even:bg-slate-50 hover:bg-[#F1F0FF]">
      <td className="flex items-center gap-4 p-4">
        <Image
          src={teacher.photo || '/noAvatar.png'}
          alt="Profile"
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 object-cover rounded-full"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{teacher.name}</h3>
          <h4 className="text-gray-500 text-sm">{teacher.email}</h4>
        </div>
      </td>
      <td className="hidden md:table-cell">{teacher.username}</td>
      <td className="hidden md:table-cell">
        {teacher.subjects?.map((subject) => subject.name).join(', ') || 'N/A'}
      </td>
      <td className="hidden md:table-cell">
        {teacher.classes?.map((item) => item.name).join(', ') || 'N/A'}
      </td>
      <td className="hidden md:table-cell">{teacher.phone || 'N/A'}</td>
      <td className="hidden md:table-cell">{teacher.address || 'N/A'}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/teachers/${teacher.teacher_id}`}>
            <button className="w-7 h-7 rounded-full flex items-center justify-center bg-[#C3EBFA]">
              <Image src="/view.png" alt="View" width={16} height={16} />
            </button>
          </Link>
          {role === 'admin' && (
            <FormModal type="delete" table="teacher" id={teacher.id} />
          )}
        </div>
      </td>
    </tr>
  );

  // Page rendering
  return (
    <div className="bg-white rounded-md p-4 flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Teachers</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>
            {role === 'admin' && (
            <FormModal type="create" table="teacher" />
          )}
          </div>
        </div>
      </div>
      <Table column={column} renderRow={renderRow} data={teachersData || []} />
      <Pagination page={p} count={count} />
    </div>
  );
}
