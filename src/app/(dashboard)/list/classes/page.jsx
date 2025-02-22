import GradeComponent from "@/components/GradeComponent";
import { getUserId, getUserRole } from "@/lib/authUtils";
import prisma from "@/lib/prisma"; // Ensure prisma is correctly imported

export default async function GradePage() {
  const role = await getUserRole(); 
  const userId = await getUserId();

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
          classes: {
            where: { isDeleted: false },
            select: { id: true, name: true, gradeId: true },
          },
        },
      },
    },
  });

  return <GradeComponent role={role} currentUser={userId} sessions={sessions} />;
}
