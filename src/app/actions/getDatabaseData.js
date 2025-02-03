"use server";

import prisma from "@/lib/prisma";


export async function getDatabaseData() {
  try {
    console.log("🟡 Fetching database data...");

    // 🔵 Try fetching each table separately
    const sessions = await prisma.session.findMany({ select: { id: true, name: true } });
    console.log("✅ Sessions Fetched:", sessions);

    const grades = await prisma.grade.findMany({ select: { id: true, name: true } });
    console.log("✅ Grades Fetched:", grades);

    const classes = await prisma.class.findMany({ select: { id: true, name: true } });
    console.log("✅ Classes Fetched:", classes);

    const subjects = await prisma.subject.findMany({ select: { id: true, name: true } });
    console.log("✅ Subjects Fetched:", subjects);

    const parents = await prisma.parent.findMany({ select: { id: true, name: true } });
    console.log("✅ Subjects Fetched:", parents);

    return {
      success: true,
      data: { sessions, grades, classes, subjects, parents },
    };
  } catch (error) {
    console.error("❌ Prisma Error:", error);
    return { success: false, error: error.message };
  }
}
