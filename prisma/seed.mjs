import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Helper function to get random elements from an array
function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log("Seeding database...");

  // Nigerian Names
  const surnames = ["Adeyemi", "Oluwafemi", "Adebayo", "Olagoke", "Akinlade", "Akinyemi", "Adesanya"];
  const firstNamesMale = ["Tunde", "Kunle", "Dele", "Segun", "Femi", "Bayo", "Seyi"];
  const firstNamesFemale = ["Sade", "Tola", "Funmi", "Bisi", "Titi", "Bukky", "Yemi"];

  // Subject Names
  const subjectNames = [
    "Mathematics", "English", "Science", "Social Studies", "Yoruba",
    "Physics", "Biology", "Chemistry", "Geography", "Economics",
  ];

  // Create Admins
  await prisma.admin.createMany({
    data: [
      { id: "admin1", name: "School Admin", email: "admin1@school.com", password: "admin123" },
      { id: "admin2", name: "Admin Two", email: "admin2@school.com", password: "admin123" },
    ],
  });

  // Create Sessions (Multiple)
  const sessions = await Promise.all(
    ["2023/2024", "2024/2025", "2025/2026"].map(name =>
      prisma.session.create({
        data: { name, isDeleted: false, deletedAt: null },
      })
    )
  );

  // Create Terms for Each Session
  const terms = await Promise.all(
    sessions.flatMap(session =>
      ["First Term", "Second Term", "Third Term"].map(termName =>
        prisma.term.create({
          data: { name: termName, sessionId: session.id, isDeleted: false, deletedAt: null },
        })
      )
    )
  );

  // Create Grades
  const grades = await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      prisma.grade.create({
        data: { name: `Grade ${i + 1}`, isDeleted: false, deletedAt: null },
      })
    )
  );

  // Create Classes
  const classes = await Promise.all(
    grades.flatMap((grade) =>
      ["A", "B"].map((section) =>
        prisma.class.create({
          data: {
            name: `${grade.name}${section}`,
            gradeId: grade.id,
            isDeleted: false,
            deletedAt: null,
          },
        })
      )
    )
  );

  // Create Teachers
  const teachers = await Promise.all(
    Array.from({ length: 15 }, (_, i) =>
      prisma.teacher.create({
        data: {
          id: `teacher${i + 1}`,
          surname: getRandomElement(surnames),
          name: getRandomElement([...firstNamesMale, ...firstNamesFemale]),
          username: `teacher${i + 1}`,
          sex: i % 2 === 0 ? "MALE" : "FEMALE",
          email: `teacher${i + 1}@school.com`,
          password: `password${i + 1}`,
          isDeleted: false,
          deletedAt: null,
        },
      })
    )
  );

  // Create Subjects and Assign to Teachers
  const subjects = await Promise.all(
    subjectNames.map((subject, i) =>
      prisma.subject.create({
        data: {
          name: subject,
          teacherId: teachers[i % teachers.length].id,
          isDeleted: false,
          deletedAt: null,
        },
      })
    )
  );

  // Create Parents
  const parents = await Promise.all(
    Array.from({ length: 25 }, (_, i) =>
      prisma.parent.create({
        data: {
          id: `parent${i + 1}`,
          name: `Parent ${i + 1}`,
          email: `parent${i + 1}@example.com`,
          isDeleted: false,
          deletedAt: null,
        },
      })
    )
  );

  const paymentStatuses = ["PAID", "NOT_PAID", "PARTIALLY_PAID"];

  // Create Students
  const students = await Promise.all(
    Array.from({ length: 50 }, (_, i) =>
      prisma.student.create({
        data: {
          id: `student${i + 1}`,
          surname: getRandomElement(surnames),
          name: i % 2 === 0 ? getRandomElement(firstNamesMale) : getRandomElement(firstNamesFemale),
          username: `student${i + 1}`,
          sex: i % 2 === 0 ? "MALE" : "FEMALE",
          gradeId: getRandomElement(grades).id,
          classId: getRandomElement(classes).id,
          parentId: getRandomElement(parents).id,
          paymentStatus: getRandomElement(paymentStatuses),
          isDeleted: false,
          deletedAt: null,
        },
      })
    )
  );

  // Enroll Students in Subjects
  await Promise.all(
    students.flatMap(student =>
      subjects.slice(0, 5).map(subject =>
        prisma.studentSubject.create({
          data: {
            studentId: student.id,
            subjectId: subject.id,
          },
        })
      )
    )
  );

  // Add Results with `teacherId`
  await Promise.all(
    students.slice(0, 20).flatMap(student =>
      subjects.slice(0, 5).map(subject =>
        prisma.result.create({
          data: {
            studentId: student.id,
            subjectId: subject.id,
            teacherId: subject.teacherId, // Now correctly linked
            termId: getRandomElement(terms).id,
            firstAssessment: Math.floor(Math.random() * 20) + 10,
            secondAssessment: Math.floor(Math.random() * 20) + 10,
            examScore: Math.floor(Math.random() * 50) + 50,
            totalScore: Math.floor(Math.random() * 100) + 50,
            isDeleted: false,
            deletedAt: null,
          },
        })
      )
    )
  );

  // Add Attendance Records
  await Promise.all(
    students.slice(0, 30).flatMap(student =>
      subjects.slice(0, 5).map(subject =>
        prisma.attendance.create({
          data: {
            studentId: student.id,
            subjectId: subject.id,
            termId: getRandomElement(terms).id,
            date: new Date(),
            status: Math.random() > 0.1,
            isDeleted: false,
            deletedAt: null,
          },
        })
      )
    )
  );

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
