"use server";

import prisma from "@/lib/prisma";

export async function getDatabaseData() {
  try {
    console.log("🟡 Fetching database data...");

    // 🔵 Parallelize requests to speed up data fetching
    const [sessions, grades, classes, subjects, teachers, parents, terms] = await Promise.all([
      prisma.session.findMany({
        select: { id: true, name: true, isCurrent: true },
      }),
      prisma.grade.findMany({
        select: { id: true, name: true, sessionId: true },
      }),
      prisma.class.findMany({
        select: { id: true, name: true, gradeId: true },
      }),
      prisma.subject.findMany({
        select: { id: true, name: true },
      }),
      prisma.teacher.findMany({
        select: { id: true, surname: true, name: true },
      }),
      prisma.parent.findMany({
        select: { id: true, name: true },
      }),
      prisma.term.findMany({  // ✅ Fetch terms
        select: { id: true, name: true, sessionId: true },
      }),
    ]);

    // Log the count of each result after they are all fetched
    console.log("✅ Sessions Fetched:", sessions.length);
    console.log("✅ Grades Fetched:", grades.length);
    console.log("✅ Classes Fetched:", classes.length);
    console.log("✅ Subjects Fetched:", subjects.length);
    console.log("✅ Teachers Fetched:", teachers.length);
    console.log("✅ Parents Fetched:", parents.length);
    console.log("✅ Terms Fetched:", terms.length); // ✅ Log terms count

    return {
      success: true,
      data: { sessions, grades, classes, subjects, parents, teachers, terms }, // ✅ Include terms
    };
  } catch (error) {
    console.error("❌ Prisma Error:", error);
    return { success: false, error: error.message };
  }
}
