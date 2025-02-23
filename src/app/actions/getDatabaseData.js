
"use server";

import prisma from "@/lib/prisma";

export async function getDatabaseData() {
  try {
    console.log("🟡 Fetching database data...");

    // 🔵 Parallelize requests to speed up data fetching
    const [sessions, grades, classes, subjects, teachers, parents, terms,classRecord, paymentHistory,studentHistory,student] = await Promise.all([
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
      prisma.classRecord.findMany({
          include: {
            student: true,
            class: true,
            term: true,
            session: true,
            teacher: true,
            histories: true,
          },
        }),
        prisma.paymentHistory.findMany({
          select: {
            id: true,
            studentId: true,
            termId: true,
            sessionId: true,
            amount: true,
            status: true,
            // other necessary fields
          },
          
        }),
        prisma.studentHistory.findMany({
          include: {
            student: true,        // Include student details
            results: true,        // Include results for each student (across sessions)
            session: true,        // Include session details
            grade: true,          // Include grade details (if needed)
            class: true,          // Include class details (if needed)
          },
        }),
        prisma.student.findMany({
          select: { id: true, name: true }, // ✅ Fetch students
        }),
    ]);

    // // Log the count of each result after they are all fetched
    // console.log("✅ Sessions Fetched:", sessions.length);
    // console.log("✅ Grades Fetched:", grades.length);
    // console.log("✅ Classes Fetched:", classes.length);
    // console.log("✅ Subjects Fetched:", subjects.length);
    // console.log("✅ Teachers Fetched:", teachers.length);
    // console.log("✅ Parents Fetched:", parents.length);
    // console.log("✅ Terms Fetched:", terms.length); // ✅ Log terms count
    // console.log("✅ classRecord Fetched:", classRecord.length); // ✅ Log terms count
    // console.log("✅ paymentHistory Fetched:", paymentHistory.length); // ✅ Log terms count
    // console.log("✅ studentHistory Fetched:", studentHistory.length); // ✅ Log terms count
    // console.log("✅ student Fetched:", student.length); // ✅ Log terms count

    return {
      success: true,
      data: { sessions, grades, classes, subjects, parents, teachers, terms,classRecord ,paymentHistory,studentHistory,student}, // ✅ Include terms
    };
  } catch (error) {
    console.error("❌ Prisma Error:", error);
    return { success: false, error: error.message };
  }
}
