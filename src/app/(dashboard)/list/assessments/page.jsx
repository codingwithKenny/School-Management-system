import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { ITEM_PER_PAGE } from "@/lib/settings";
import prisma from "@/lib/prisma";
import Image from "next/image";
import { currentUserId, role } from "@/lib/authUtils";


const assessmentListPage = async ({ searchParams }) => {
  if (!role || !currentUserId) {
    throw new Error("Unauthorized access: Role or User ID missing.");
  }
  const params = searchParams ? await searchParams : {};
  const page = params.page || 1;
  const p = parseInt(page);

  // QUERY CONDITIONS
  const query = {};
if (params) {
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      switch (key) {
        case 'search':
          query.OR = [
            { name: { contains: value, mode: "insensitive" } }, // Match main name
            { subject: { name: { contains: value, mode: "insensitive" } } }, // Match subject name
            { subject: { teacher: { name: { contains: value, mode: "insensitive" } } } } // Match teacher name
          ];
          break;

        case 'teacherId':
          query.subject = { 
            ...query.subject, 
            teacherId: value 
          };
          break;

        // Add additional filters as needed
        default:
          break;
      }
    }
  }
}
 // ROLE CONDITIONS
  switch (role) {
    case "admin": // ADMIN CAN VIEW ALL aSSESSMENT
      break;
     case "teacher":
      query.subject = { teacherId: currentUserId };// TEACHER CAN VIEW ALL ASSESSMENT OF THE SUBJECT THEY TEACH
      break;
     case "student":
      query.subject = {
        students: {
          some: { studentId: currentUserId },   // STUDENT CAN ONLY VIEW THIER OWN ASSESSMENT
        },
      };
      break;

    case "parent":
      // Parent can view assessments for their children's subjects
      query.subject = {
        students: {
          some: {
            student: {
              parent: { parent_id: currentUserId },
            },
          },
        },
      };
      break;

    default:
      throw new Error("Unauthorized access.");
  }

  // FETCH ASSESSMENT DATA AND COUNT FROM DB

  const [assessmentData, count] = await prisma.$transaction([
    prisma.assessment.findMany({
      where: query,
      include: {
        subject: {
          include: {
            teacher: { select: { name: true, surname: true } },
          },
        },
        term: { select: { name: true } },
        session: { select: { name: true}}

      },
      take: ITEM_PER_PAGE,
      skip: (p - 1) * ITEM_PER_PAGE,
    }),
    prisma.assessment.count({ where: query }),
  ]);

  // TABLE COLUMN
  const columns = [
    { header: "Subject Name", accessor: "subject" },
    {
      header: "Teacher",
      accessor: "teacher",
      className: "hidden md:table-cell",
    },
    { header: "Term", accessor: "term", className: "hidden md:table-cell" },
    { header: "Date", accessor: "date", className: "hidden md:table-cell" },
    ...(role ==='admin' || role === 'teacher' ? [ { 
      header: "Actions", 
      accessor: "actions" }]
      :
      [])
  ];

  // CHECK FOR AVAILABE DATA IN ASSEEMENT DATA
  const data = assessmentData.map((item) => ({
    id: item.assessment_id,
    subject: item.subject.name || "N/A",
    teacher: `${item.subject.teacher.name} ${item.subject.teacher.surname}`,
    term: item.term.name,
    session: item.session.name,
  }));

  const renderRow = (assessment) => (
    <tr
      key={assessment.id}
      className="text-xs border-b border-grey-200 even:bg-slate-50 hover:bg-[#F1F0FF]"
    >
      <td>{assessment.subject}</td>
      <td className="hidden md:table-cell">{assessment.teacher}</td>
      <td className="hidden md:table-cell">{assessment.term}</td>
      <td className="hidden md:table-cell">{assessment.session}</td>
      {role === "admin" || role === "teacher" ? (
        <td>
          <div className="flex items-center gap-2">
            <FormModal type="update" table="assessment" data={assessment} />
            <FormModal type="delete" table="assessment" id={assessment.id} />
          </div>
        </td>
      ) : null}
    </tr>
  );

  return (
    <div className="bg-white rounded-md p-4 flex-1 m-4 mt-0">
      {/* Top Section */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          All Assessments
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>
            {(role === "admin" || role === "teacher") && (
              <FormModal type="create" table="assessment" />
            )}
          </div>
        </div>
      </div>
      {/* Table Section */}
      <Table column={columns} renderRow={renderRow} data={data} />
      {/* Pagination Section */}
      <Pagination count={count} page={p} />
    </div>
  );
};

export default assessmentListPage;
