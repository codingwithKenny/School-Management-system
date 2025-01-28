import FormModal from '@/components/FormModal';
import Pagination from '@/components/Pagination';
import Table from '@/components/Table';
import TableSearch from '@/components/TableSearch';
import prisma from '@/lib/prisma';
import { ITEM_PER_PAGE } from '@/lib/settings';
import Link from 'next/link';
import Image from 'next/image';
import { currentUserId, role } from '@/lib/authUtils';

// COLUNM TABLE
const column = [
  { header: 'Subject', accessor: 'subject' },
  { header: 'Student', accessor: 'student' },
  { header: 'Score', accessor: 'score', className: 'hidden md:table-cell' },
  { header: 'CA', accessor: 'assessmentScore', className: 'hidden md:table-cell' },
  { header: 'Exam', accessor: 'examScore', className: 'hidden md:table-cell' },
  { header: 'Teacher', accessor: 'teacher', className: 'hidden md:table-cell' },
  { header: 'Term', accessor: 'term', className: 'hidden md:table-cell' },
  { header: 'Date', accessor: 'date', className: 'hidden md:table-cell' },
  ...(role === 'teacher' ? [ { 
    header: "Actions", 
    accessor: "actions" }]
    :
    []),
];

const resultListPage = async ({ searchParams }) => {
if (!role || !currentUserId) {
    throw new Error("Unauthorized access: missing role or user ID.");
  }
  const params = searchParams ? await searchParams : {};
  const page = params.page || 1;
  const p = parseInt(page);

  // QUERY CONDITIONS
  const query = {};
   // SEARCH AND FILTER

   if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.subject = {
              students: {
                some: {
                  student: {
                    classId: parseInt(value),
                  },
                },
              },
            };
            break;
          case "teacherId":
            query.subject = {
              teacherId: value,
            };
            break;
          case "search":
            query.subject = {
              name: { contains: value, mode: "insensitive" },
            };
            break;
          default:
            break;
        }
      }
    }
  }


  // ROLE CONDITIONS
  switch (role) {
    case 'admin': 
      break;

    case 'teacher':
      query.subject = {
        teacherId: currentUserId,  //TEACHER CAN ONL VIEW THE RESULT OF SUBJECT THEY TEACH
      };
      break;

    case 'student':
      query.studentId = currentUserId;   //STUDENT CAN ONL VIEW THEIR RESULT
      break;

    case 'parent':
      query.student = {
        parent: {
          parent_id: currentUserId,
        },
      };
      break;

    default:
      throw new Error('Unauthorized access: invalid role.');
  }

  // FETCH RESULT DATA AND COUNT
  const [dataRes, count] = await prisma.$transaction([
    prisma.result.findMany({
      where: query,
      include: {
        student: { select: { name: true, surname: true } },
        subject: {
          include: {
            teacher: { select: { name: true, surname: true } },
          },
        },
        term: { select: { name: true, session: { select: { name: true } } } },
      },
      take: ITEM_PER_PAGE,
      skip: (p - 1) * ITEM_PER_PAGE,
    }),
    prisma.result.count({ where: query }),
  ]);

  // MAP THE AVAILABLE DATA IN RESULT
  const data = dataRes.map((item) => ({
    id: item.result_id,
    subject: item.subject.name,
    student: `${item.student.surname} ${item.student.name}`,
    score: item.totalScore || 'N/A',
    assessmentScore: item.assessmentScore || 'N/A',
    examScore: item.examScore || 'N/A',
    teacher: `${item.subject.teacher.name} ${item.subject.teacher.surname}`,
    term: `${item.term.name} (${item.term.session.name})`,
    date: new Date(item.createdAt).toLocaleDateString(),
  }));

  const renderRow = (result) => (
    <tr key={result.id} className="text-xs border-b border-grey-200 even:bg-slate-50 hover:bg-[#F1F0FF]">
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{result.subject}</h3>
        </div>
      </td>
      <td>{result.student}</td>
      <td className="hidden md:table-cell">{result.score}</td>
      <td className="hidden md:table-cell">{result.assessmentScore}</td>
      <td className="hidden md:table-cell">{result.examScore}</td>
      <td className="hidden md:table-cell">{result.teacher}</td>
      <td className="hidden md:table-cell">{result.term}</td>
      <td className="hidden md:table-cell">{result.date}</td>
      <td>
        <div className="flex items-center gap-2">
        {(role === "teacher") && (
            <>
             <Link href={`/list/results/${result.id}`}>
            <FormModal type="update" table="result" />
          </Link>
          <FormModal type="delete" table="result" />
            </>
          )}
       
          
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white rounded-md p-4 flex-1 m-4 mt-0">
      {/* Header Section */}
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
            {(role === 'teacher') && (
             <>
             <FormModal type='create' table='class'/>
             </>
            )}
          </div>
        </div>
      </div>
      {/* Table Section */}
      <Table column={column} renderRow={renderRow} data={data} />
      {/* Pagination Section */}
      <Pagination count={count} page={p} />
    </div>
  );
};

export default resultListPage;
