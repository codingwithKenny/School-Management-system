import StudentResultView from '@/components/StudentResultView';
import { getCurrentUser } from '@/lib/authUtils';
import prisma from '@/lib/prisma';

// STUDENT CHECK RESULT PAGE
const CheckResult = async () => {
  const { role, userId } = await getCurrentUser();
  console.log(userId, "current user");

  let sessions = [];

  if (role === "student") {
    sessions = await prisma.session.findMany({
      select: {
        id: true,
        name: true,
        terms: { select: { id: true, name: true } },
        grades: {
          select: {
            id: true,
            name: true,
            classes: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });
  } 

  const studentInfo = await prisma.student.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      surname: true,
      session: { select: { name: true } }, 
      grade: { select: { id: true, name: true } }, 
      class: { select: { id: true, name: true } }, 
      img: true
    }
  });
  const results = await prisma.result.findMany({
    where: { studentId: userId },
    select: {
      termId: true,
      sessionId: true,
      gradeId: true,
      classId: true,
      subject: { select: { name: true } },
      firstAssessment: true,
      secondAssessment: true,
      examScore: true,
      totalScore: true
    }
  });
  console.log(results, "results");

  return (
    <div>
      <StudentResultView sessions={sessions} results={results} studentInfo={studentInfo} userId={userId} />
    </div>
  );
};

export default CheckResult;
