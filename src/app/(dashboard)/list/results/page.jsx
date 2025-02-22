import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/authUtils';
import TeacherResultActions from '@/components/TeacherResultActions';
import { allResults } from '@/lib/actions';
import StudentResultView from '@/components/StudentResultView';

const resultUploadPage = async () => {
  const { role, userId } = await getCurrentUser();
  if (role !== 'teacher' || !userId) {
    throw new Error("Unauthorized access: Only teachers can upload results.");
  }

  try {
    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: { teacherId: userId },
      select: { subjectId: true }
    });

    const subjectIds = teacherSubjects.map(s => s.subjectId);
    if (!subjectIds.length) {
      return <div className="p-4 text-red-500">No students found for your subjects.</div>;
    }
    //  FETCH SESSION WITH RELATED TERMS AND GRADES
   // Fetch only the current session (where isCurrent is true)
    // and within that, only fetch the current term (where isCurrent is true)
    const sessions = await prisma.session.findMany({
      where: { isCurrent: true },
      select: {
        id: true,
        name: true,
        terms: {
          where: { isCurrent: true },
          select: { id: true, name: true, sessionId: true },
        },
        grades: {
          select: {
            id: true,
            name: true,
            sessionId: true,
            classes: { select: { id: true, name: true, gradeId: true } },
          },
        },
      },
    });
    
    if (!sessions) {
      return <div className="p-4 text-red-500">No current session available.</div>;
    }
    // FETCH STUDENT OFFERING THE COURSE
    const students = await prisma.student.findMany({
      where: { isDeleted: false,subjects: { some: { subjectId: { in: subjectIds } } } },
      select: {
        id: true,
        name: true,
        surname: true,
        grade: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
        subjects: { select: { subject: { select: { id: true, name: true } } } }
      }
    });
    //  TEACHERS SUBJECT
    const subjects = await prisma.subject.findMany({
      where: { id: { in: subjectIds } },
      select: { id: true, name: true }
    });
    // ALL RESULT FROM DB
    const Results = await allResults();

    return (
      <div className=" rounded-md p-4 flex-1 m-4 mt-0">
      {role =="teacher" && (
          <TeacherResultActions
          students={students}
          sessions={sessions} 
          subjects={subjects}
          teacherId={userId}
          Results={Results.data || []}
        />
      )}
      </div>
    );
  } catch (error) {
    console.error("Error Fetching Data:", error);
    return <div className="p-4 text-red-500">An error occurred while fetching data.</div>;
  }
};

export default resultUploadPage;
