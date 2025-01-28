import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Helper function to generate random data
function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log("Seeding database...");

  // South-West Nigerian names
  const surnames = ["Adeyemi", "Oluwafemi", "Adebayo", "Olagoke", "Akinlade", "Akinyemi", "Adesanya"];
  const firstNamesMale = ["Tunde", "Kunle", "Dele", "Segun", "Femi", "Bayo", "Seyi"];
  const firstNamesFemale = ["Sade", "Tola", "Funmi", "Bisi", "Titi", "Bukky", "Yemi"];

  // Subject Names
  const subjectNames = [
    "Mathematics",
    "English",
    "Science",
    "Social Studies",
    "Yoruba",
    "Physics",
    "Biology",
    "Chemistry",
    "Geography",
    "Economics",
  ];

  // Create Admin
  const admin = await prisma.admin.create({
    data: {
      name: "School Admin",
      email: "admin@school.com",
      password: "admin123",
    },
  });

  // Create Session
  const session2024 = await prisma.session.create({
    data: {
      name: "2024/2025",
    },
  });

  // Create Terms
  const term1 = await prisma.term.create({
    data: {
      name: "First Term",
      sessionId: session2024.session_id,
      startDate: new Date("2024-09-01"),
      endDate: new Date("2024-12-15"),
    },
  });

  const term2 = await prisma.term.create({
    data: {
      name: "Second Term",
      sessionId: session2024.session_id,
      startDate: new Date("2025-01-10"),
      endDate: new Date("2025-03-31"),
    },
  });

  // Create Grades and Classes
  const grades = [];
  const classes = [];
  for (let i = 1; i <= 5; i++) { // 5 grades
    const grade = await prisma.grade.create({
      data: {
        name: `Grade ${i}`,
      },
    });
    grades.push(grade);

    for (let j = 0; j < 2; j++) { // 2 classes per grade
      const newClass = await prisma.class.create({
        data: {
          name: `${i}${j === 0 ? "A" : "B"}`,
          gradeId: grade.grade_id,
        },
      });
      classes.push(newClass);
    }
  }

  // Create Teachers
  const teachers = [];
  for (let i = 1; i <= 15; i++) {
    const teacher = await prisma.teacher.create({
      data: {
        teacher_id: `teacher${i}`,
        surname: getRandomElement(surnames),
        name: getRandomElement(firstNamesMale.concat(firstNamesFemale)),
        username: `teacher${i}`,
        sex: i % 2 === 0 ? "MALE" : "FEMALE",
        email: `teacher${i}@school.com`,
        password: `password${i}`,
      },
    });
    teachers.push(teacher);
  }

  // Create Subjects and assign to teachers
  const subjects = [];
  for (let i = 0; i < subjectNames.length; i++) {
    const subject = await prisma.subject.create({
      data: {
        name: subjectNames[i],
        teacherId: teachers[i % teachers.length].teacher_id,
      },
    });
    subjects.push(subject);
  }

  // Create Parents
  const parents = [];
  for (let i = 1; i <= 25; i++) {
    const parent = await prisma.parent.create({
      data: {
        name: `${getRandomElement(surnames)} ${getRandomElement(firstNamesMale.concat(firstNamesFemale))}`,
        email: `parent${i}@example.com`,
      },
    });
    parents.push(parent);
  }

  // Create Students
  const students = [];
  for (let i = 1; i <= 50; i++) {
    const student = await prisma.student.create({
      data: {
        student_id: `student${i}`,
        surname: getRandomElement(surnames),
        name: i % 2 === 0 ? getRandomElement(firstNamesMale) : getRandomElement(firstNamesFemale),
        username: `student${i}`,
        sex: i % 2 === 0 ? "MALE" : "FEMALE",
        gradeId: grades[i % grades.length].grade_id,
        classId: classes[i % classes.length].class_id,
        parentId: parents[i % parents.length].parent_id,
      },
    });
    students.push(student);
  }

  // Enroll Students in Subjects
  for (const student of students) {
    for (const subject of subjects) {
      await prisma.studentSubject.create({
        data: {
          studentId: student.student_id,
          subjectId: subject.subject_id,
        },
      });
    }
  }

  // Create Exams
  const exams = [];
  for (let i = 1; i <= 20; i++) {
    const exam = await prisma.exam.create({
      data: {
        name: `Exam ${i}`,
        subjectId: subjects[i % subjects.length].subject_id,
        termId: term1.term_id,
        sessionId: session2024.session_id,
      },
    });
    exams.push(exam);
  }

  // Create Assessments
  const assessments = [];
  for (let i = 1; i <= 20; i++) {
    const assessment = await prisma.assessment.create({
      data: {
        name: `Assessment ${i}`,
        subjectId: subjects[i % subjects.length].subject_id,
        termId: term1.term_id,
        sessionId: session2024.session_id,
      },
    });
    assessments.push(assessment);
  }

  // Add Results
  for (let i = 1; i <= 20; i++) {
    await prisma.result.create({
      data: {
        studentId: students[i % students.length].student_id,
        subjectId: subjects[i % subjects.length].subject_id,
        termId: term1.term_id,
        sessionId: session2024.session_id,
        examScore: Math.floor(Math.random() * 50) + 50, // Random exam score (50-100)
        assessmentScore: Math.floor(Math.random() * 20) + 10, // Random assessment score (10-30)
        totalScore: Math.floor(Math.random() * 100) + 50, // Random total score (50-150)
      },
    });
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
