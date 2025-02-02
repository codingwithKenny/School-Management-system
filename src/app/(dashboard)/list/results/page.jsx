import prisma from '@/lib/prisma';
import {getCurrentUser } from '@/lib/authUtils';
import TeacherResultActions from '@/components/TeacherResultActions';
import { allResults } from '@/lib/actions';

const resultListPage = async () => {
const {role,userId} = await getCurrentUser();
const currentUserId = userId
  console.log(role,'heyyyyyyyyyyyyyyyyyyyyyyyyyyyyy')
  console.log(currentUserId,'heyyyyyyyyyyyyyyyyyyyyyyyyyyyyy')

  if (role !== 'teacher' || !currentUserId) {
    throw new Error("Unauthorized access: Only teachers can upload results.");
  }

  console.log("Fetching Data for Teacher ID:", currentUserId);

  try {
    // Fetch teacher's subjects
    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: { teacherId: currentUserId },
      select: { subjectId: true }
    });

    const subjectIds = teacherSubjects.map(s => s.subjectId);
    if (!subjectIds.length) {
      console.log("No subjects found for this teacher.");
      return <div className="p-4 text-red-500">No students found for your subjects.</div>;
    }

    console.log("Subjects Taught by Teacher:", subjectIds);

    // Fetch students & other required data
    const [students, grades, sessions, subjects, terms] = await prisma.$transaction([
      prisma.student.findMany({
        where: { subjects: { some: { subjectId: { in: subjectIds } } } },
        select: {
          id: true,
          name: true,
          surname: true,
          grade: { select: { id: true, name: true, id: true } },
          subjects: { select: { subject: { select: { id: true, name: true } } } }
        }
      }),
      prisma.grade.findMany({ select: { id: true, name: true } }),
      prisma.session.findMany({ select: { id: true, name: true } }),
      prisma.subject.findMany({ where: { id: { in: subjectIds } }, select: { id: true, name: true } }),
      prisma.term.findMany({ select: { id: true, name: true } })
    ]);

    // FETCH ALL RESULTS IN DB
    const Results = await allResults();

    return (
      <div className="bg-white rounded-md p-4 flex-1 m-4 mt-0">
        <TeacherResultActions
          students={students}
          grades={grades}
          subjects={subjects}
          terms={terms}
          sessions={sessions}
          teacherId={currentUserId}
          Results={Results.data || []} 
        />
      </div>
    );
  } catch (error) {
    console.error("Error Fetching Data:", error);
    return <div className="p-4 text-red-500">An error occurred while fetching data.</div>;
  }
};

export default resultListPage;
