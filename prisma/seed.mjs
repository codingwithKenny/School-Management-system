import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ✅ Create Sessions First (Foreign key for students, grades, etc.)
  const session1 = await prisma.session.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "2023/2024 Academic Year",
      isCurrent: true,
    },
  });

  const session2 = await prisma.session.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: "2024/2025 Academic Year",
      isCurrent: false,
    },
  });

  // ✅ Create Grades
  const grade1 = await prisma.grade.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Grade 1",
      sessionId: session1.id,
    },
  });

  const grade2 = await prisma.grade.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: "Grade 2",
      sessionId: session1.id,
    },
  });

  // ✅ Create Classes
  const class1 = await prisma.class.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Class A",
      gradeId: grade1.id,
    },
  });

  const class2 = await prisma.class.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: "Class B",
      gradeId: grade2.id,
    },
  });

  // ✅ Create Subjects
  const subject1 = await prisma.subject.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: "Mathematics" },
  });

  const subject2 = await prisma.subject.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, name: "English Language" },
  });

  // ✅ Create Admins
  const admin1 = await prisma.admin.upsert({
    where: { email: "admin@school.com" },
    update: {},
    create: {
      id: "admin_123",
      name: "Principal John",
      email: "admin@school.com",
      password: "AdminPass123!",
    },
  });

  // ✅ Create Teachers
  const teacher1 = await prisma.teacher.upsert({
    where: { id: "teacher_001" },
    update: {},
    create: {
      id: "teacher_001",
      surname: "Williams",
      name: "Michael",
      username: "michael_teacher",
      email: "michael@school.com",
      sex: "MALE",
      password: "TeacherPass123!",
    },
  });

  // ✅ Create Parents
  const parent1 = await prisma.parent.upsert({
    where: { id: "parent_001" },
    update: {},
    create: {
      id: "parent_001",
      name: "Mrs. Adebayo",
      email: "adebayo_parent@school.com",
    },
  });

  // ✅ Create Students (Ensure session, grade, class, and parent exist)
  await prisma.student.createMany({
    data: [
      {
        id: "student_001",
        surname: "Apenaola",
        name: "Kabirat",
        username: "kabby",
        email: "kabby@example.com",
        sex: "MALE",
        img: "avatar.png",
        address: "Ikorodu",
        sessionId: session1.id,
        gradeId: grade1.id,
        classId: class1.id,
        parentId: parent1.id,
        paymentStatus: "PAID",
      },
      {
        id: "student_002",
        surname: "Hikamt",
        name: "Abimbola",
        username: "hikkygift",
        email: "hikky@dev.com",
        sex: "MALE",
        img: "avatar.png",
        address: "Cele Oyo",
        sessionId: session1.id,
        gradeId: grade2.id,
        classId: class2.id,
        parentId: null,
        paymentStatus: "PAID",
      },
    ],
  });

  console.log("✅ Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
