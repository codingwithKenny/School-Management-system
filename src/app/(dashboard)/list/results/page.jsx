import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/authUtils';
import TeacherResultActions from '@/components/TeacherResultActions';
import { allResults } from '@/lib/actions';

const resultListPage = async () => {
  const { role, userId } = await getCurrentUser();
  if (role !== 'teacher' || !userId) {
    throw new Error("Unauthorized access: Only teachers can upload results.");
  }

  try {
    // Fetch teacher's subjects
    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: { teacherId: userId },
      select: { subjectId: true }
    });

    const subjectIds = teacherSubjects.map(s => s.subjectId);
    if (!subjectIds.length) {
      return <div className="p-4 text-red-500">No students found for your subjects.</div>;
    }

    // ✅ Fetch sessions along with related terms, grades, and classes
    const sessions = await prisma.session.findMany({
      select: {
        id: true,
        name: true,
        terms: { select: { id: true, name: true, sessionId: true } }, // ✅ Fetch terms within each session
        grades: {
          select: {
            id: true,
            name: true,
            sessionId: true,
            classes: { select: { id: true, name: true, gradeId: true } }
          }
        }
      }
    });

    // Fetch students related to the teacher's subjects
    const students = await prisma.student.findMany({
      where: { subjects: { some: { subjectId: { in: subjectIds } } } },
      select: {
        id: true,
        name: true,
        surname: true,
        grade: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
        subjects: { select: { subject: { select: { id: true, name: true } } } }
      }
    });

    // Fetch subjects taught by the teacher
    const subjects = await prisma.subject.findMany({
      where: { id: { in: subjectIds } },
      select: { id: true, name: true }
    });

    // Fetch all results in the database
    const Results = await allResults();

    return (
      <div className="bg-white rounded-md p-4 flex-1 m-4 mt-0">
        <TeacherResultActions
          students={students}
          sessions={sessions} // ✅ Sessions now include terms, grades, and classes
          subjects={subjects}
          teacherId={userId}
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
