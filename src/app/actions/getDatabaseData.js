"use server";

import prisma from "@/lib/prisma";

export async function getDatabaseData() {
  try {
    console.log("🟡 Fetching database data...");

    // 🔵 Fetch Sessions
    const sessions = await prisma.session.findMany({
      select: { id: true, name: true, isCurrent: true },
    });
    console.log("✅ Sessions Fetched:", sessions.length);

    // 🔵 Fetch Grades (including sessionId)
    const grades = await prisma.grade.findMany({
      select: { id: true, name: true, sessionId: true }, // ✅ Include sessionId properly
    });
    console.log("✅ Grades Fetched:", grades.length);

    // 🔵 Fetch Classes
    const classes = await prisma.class.findMany({
      select: { id: true, name: true, gradeId: true }, // ✅ Include gradeId
    });
    console.log("✅ Classes Fetched:", classes.length);

    // 🔵 Fetch Subjects
    const subjects = await prisma.subject.findMany({
      select: { id: true, name: true },
    });
    console.log("✅ Subjects Fetched:", subjects.length);

    // 🔵 Fetch Teachers
    const teachers = await prisma.teacher.findMany({
      select: { id: true, surname:true, name: true },
    });
    console.log("✅ Teacher Fetched:", teachers.length);

    // 🔵 Fetch Parents
    const parents = await prisma.parent.findMany({
      select: { id: true, name: true },
    });
    console.log("✅ Parents Fetched:", parents.length);

    return {
      success: true,
      data: { sessions, grades, classes, subjects, parents, teachers },
    };
  } catch (error) {
    console.error("❌ Prisma Error:", error);
    return { success: false, error: error.message };
  }
}
