import StudentResultView from '@/components/StudentResultView';
import { getCurrentUser } from '@/lib/authUtils';
import prisma from '@/lib/prisma';

const CheckResult = async () => {
  const { role, userId } = await getCurrentUser();
  console.log(userId, "current user");

  let sessions = [];

  if (role === "student") {
    // ✅ Fetch only sessions where the student is enrolled
    sessions = await prisma.session.findMany({
      where: {
        grades: {
          some: {
            classes: {
              some: {
                students: { some: { id: userId } }
              }
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        terms: { select: { id: true, name: true } },
        grades: {
          where: {
            classes: {
              some: {
                students: { some: { id: userId } }
              }
            }
          },
          select: {
            id: true,
            name: true,
            classes: {
              where: {
                students: { some: { id: userId } }
              },
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });
  } else if (role === "teacher") {
    // ✅ Show only sessions where the teacher is assigned
    sessions = await prisma.session.findMany({
      where: {
        grades: {
          some: {
            classes: {
              some: {
                teachers: {
                  some: { id: userId }
                }
              }
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        terms: { select: { id: true, name: true, sessionId: true } },
        grades: {
          select: {
            id: true,
            name: true,
            sessionId: true,
            classes: {
              select: {
                id: true,
                name: true,
                gradeId: true
              }
            }
          }
        }
      }
    });
  } else {
    // ✅ Admin can see all sessions
    sessions = await prisma.session.findMany({
      select: {
        id: true,
        name: true,
        terms: { select: { id: true, name: true, sessionId: true } },
        grades: {
          select: {
            id: true,
            name: true,
            sessionId: true,
            classes: {
              select: {
                id: true,
                name: true,
                gradeId: true
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
      session: { select: { name: true } }, // Student's session
      grade: { select: { id: true, name: true } }, // Student's grade
      class: { select: { id: true, name: true } }, // Student's class
      img: true, // Optional: Fetch student profile picture if available
    }
  });
  console.log(studentInfo)


// ✅ Fetch results related to the student
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
    totalScore: true,
  }
});

  return (
    <div>
      <StudentResultView sessions={sessions} results={results} studentInfo={studentInfo} />
    </div>
  );
};

export default CheckResult;
