import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import Image from "next/image";
import FormModal from "@/components/FormModal";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { currentUserId, role } from "@/lib/authUtils";

const ExamListPage = async ({ searchParams }) => {
  const params = searchParams ? await searchParams : {};
  const page = params.page || 1;
  const p = parseInt(page);

  // QUERY CONDITION
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
    case "admin":// ADMIN CAN VIEW ALL EXAM
      break;

    case "teacher":
      query.subject = {
        teacherId: currentUserId, // TEACHER CAN ONLY VIEW THIER SUBJECT EXAM 
      }; 
      break;

    case "student":
      query.subject = {
        students: {
          some: {
            studentId: currentUserId,    // STUDENT CAN ONL VIEW EXAM THEY ENROL FOR

          },
        },
      };
      break;

    case "parent":
      query.subject = {
        students: {
          some: {
            student: {
              parent: {
                parent_id: currentUserId, // Parent can view exams for their children’s subjects
              },
            },
          },
        },
      };
      break;

    default:
      throw new Error("Unauthorized access");
  }

  // Fetch data and count from the database
  const [data, count] = await prisma.$transaction([
    prisma.exam.findMany({
      where: query,
      include: {
        subject: {
          include: {
            teacher: { select: { name: true, surname: true } }, // Fetch teacher details
          },
        },
        term: { select: { name: true, session: { select: { name: true } } } }, // Include term details
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.exam.count({ where: query }),
  ]);

  //TABLE COLUMN
  const column = [
    { header: "Subject Name", accessor: "subject.name" },
    { header: "Teacher", accessor: "subject.teacher", className: "hidden md:table-cell" },
    { header: "Term", accessor: "term.name", className: "hidden md:table-cell" },
    { header: "Date", accessor: "startTime", className: "hidden md:table-cell" },
    ...(role ==='admin' ? [ { 
      header: "Actions", 
      accessor: "actions" }]
      :
      []),
  ];

  // Define renderRow function
  const renderRow = (item) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.subject.name}</td>
      <td className="hidden md:table-cell">
        {item.subject.teacher.name + " " + item.subject.teacher.surname}
      </td>
      <td className="hidden md:table-cell">
        {item.term.name} ({item.term.session.name})
      </td>
      <td className="hidden md:table-cell">
        {/* {new Intl.DateTimeFormat("en-US").format(new Date(item.startTime))} */}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {(role === "admin" || role === "teacher") && (
            <>
              <FormModal table="exam" type="update" data={item} />
              <FormModal table="exam" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  // Return the component
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* Top Section */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Exams</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {(role === "teacher") && (
              <FormModal table="exam" type="create" />
            )}
          </div>
        </div>
      </div>
      {/* Table Section */}
      <Table column={column} renderRow={renderRow} data={data} />
      {/* Pagination */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default ExamListPage;
