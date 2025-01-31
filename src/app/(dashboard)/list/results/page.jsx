import FormModal from '@/components/FormModal';
import Pagination from '@/components/Pagination';
import Table from '@/components/Table';
import TableSearch from '@/components/TableSearch';
import prisma from '@/lib/prisma';
import { ITEM_PER_PAGE } from '@/lib/settings';
import { currentUserId, role } from '@/lib/authUtils';
import TeacherResultActions from '@/components/TeacherResultActions';

const resultListPage = async ({ searchParams }) => {
  if (!role || !currentUserId) {
    throw new Error("Unauthorized access: missing role or user ID.");
  }
  const params = searchParams || {};
  const page = params.page || 1;
  const p = parseInt(page, 10);

  // ROLE-BASED FILTERING
  let query = {};
  if (role === 'teacher') {
    query.teacherId = currentUserId; // Teachers see only their students' results
  }

  // FETCH NECESSARY DATA
  const [students, grades, sessions, subjects, terms, results, count] = await prisma.$transaction([
    // Fetch students assigned to the teacher
    prisma.student.findMany({
      where: {
        results: { some: { teacherId: currentUserId } }
      },
      select: { 
        id: true, 
        name: true, 
        surname: true, 
        grade: { select: { id: true, name: true } }
      }
    }),

    // Fetch all grades
    prisma.grade.findMany({
      select: { id: true, name: true }
    }),

    // ✅ Fetch all sessions (Fixing the missing `sessions` data)
    prisma.session.findMany({
      select: { id: true, name: true }
    }),

    // Fetch subjects taught by the teacher
    prisma.subject.findMany({
      where: {
        results: { some: { teacherId: currentUserId } }
      },
      select: { id: true, name: true }
    }),

    // Fetch all terms (since they are fixed)
    prisma.term.findMany({
      select: { id: true, name: true }
    }),

    // Fetch teacher's results
    prisma.result.findMany({
      where: query,
      include: {
        student: { 
          select: { 
            id: true,
            name: true, 
            surname: true, 
            grade: { select: { id: true, name: true } }
          } 
        },
        subject: { select: { id: true, name: true } },
        term: { select: { id: true, name: true } }
      },
      take: ITEM_PER_PAGE,
      skip: (p - 1) * ITEM_PER_PAGE,
    }),

    // Count total results for pagination
    prisma.result.count({ where: query }),
  ]);

  // MAP RESULTS INTO CLEAN DATA FORMAT
  const mappedResults = results.map((item) => ({
    id: item.id,
    subject: item.subject?.name ?? "Unknown Subject",
    student: item.student 
      ? `${item.student.surname ?? "Unknown"} ${item.student.name ?? "Unknown"}`
      : "Unknown Student",
    grade: item.student?.grade?.name ?? "Unknown Grade",
    term: item.term?.name ?? "Unknown Term"
  }));

  console.log("Mapped Data:", mappedResults);
  console.log("Sessions Data:", sessions); // Debugging check

  return (
    <div className="bg-white rounded-md p-4 flex-1 m-4 mt-0">
      {/* TEACHER UI */}
      {role === "teacher" && (
        <>
          <TeacherResultActions 
            students={students} 
            grades={grades} 
            subjects={subjects} 
            terms={terms} 
            sessions={sessions}  
            teacherId={currentUserId}
          />
          <div className="mt-4">
            {/* <h2 className="text-lg font-semibold">Student Results</h2> */}
            {/* <Table data={mappedResults} /> */}
          </div>
        </>
      )}

      {/* PAGINATION SECTION */}
      {/* <Pagination count={count} page={p} /> */}
    </div>
  );
};

export default resultListPage;
