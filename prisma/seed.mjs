import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

const generateShortUuid = () => uuidv4().replace(/-/g, "").slice(0, 8);

console.log(generateShortUuid());

async function main() {
  console.log("Seeding data...");

  // Seed Admins
  await prisma.admin.createMany({
    data: [
      {
        admin_id: generateShortUuid(),
        name: "Admin 1",
        email: "admin1@example.com",
        password: "password123",
      },
      {
        admin_id: generateShortUuid(),
        name: "Admin 2",
        email: "admin2@example.com",
        password: "password123",
      },
    ],
  });

  // Seed Grades
  const gradeList = [];
  for (let i = 1; i <= 6; i++) {
    const grade = await prisma.grade.create({
      data: {
        name: `Grade ${i}`,
      },
    });
    gradeList.push(grade);
  }

  // Seed Teachers
  const teacherList = [];
  for (let i = 1; i <= 5; i++) {
    const teacher = await prisma.teacher.create({
      data: {
        teacher_id: generateShortUuid(),
        name: `Teacher ${i}`,
        surname: `Surname ${i}`,
        username: `teacher${i}`,
        email: `teacher${i}@example.com`,
        password: "password123",
        sex: i % 2 === 0 ? "MALE" : "FEMALE",
      },
    });
    teacherList.push(teacher);
  }

  // Seed Subjects
  const subjects = ["Math", "Science", "English", "History", "Art"];
  const subjectList = [];
  for (let i = 0; i < subjects.length; i++) {
    const subject = await prisma.subject.create({
      data: {
        name: subjects[i],
        teacherId: teacherList[i % teacherList.length].teacher_id,
      },
    });
    subjectList.push(subject);
  }

  // Seed Classes
  const classList = [];
  for (let i = 0; i < gradeList.length; i++) {
    const classroom = await prisma.class.create({
      data: {
        name: `Class ${i + 1}A`,
        gradeId: gradeList[i].grade_id,
        supervisorId: teacherList[i % teacherList.length].teacher_id,
      },
    });
    classList.push(classroom);
  }

  // Seed Parents
  const parentList = [];
  for (let i = 1; i <= 10; i++) {
    const parent = await prisma.parent.create({
      data: {
        parent_id: i,
        name: `Parent ${i}`,
        email: `parent${i}@example.com`,
      },
    });
    parentList.push(parent);
  }

  // Seed Students
  const studentList = [];
  for (let i = 1; i <= 30; i++) {
    const student = await prisma.student.create({
      data: {
        student_id: generateShortUuid(),
        username: `student${i}`,
        name: `Student Name ${i}`,
        surname: `Student Surname ${i}`,
        sex: i % 2 === 0 ? "MALE" : "FEMALE",
        address: `Address ${i}`,
        gradeId: gradeList[i % gradeList.length].grade_id,
        classId: classList[i % classList.length].class_id,
        parentId: parentList[i % parentList.length].parent_id,
      },
    });
    studentList.push(student);
  }

  // Seed Lessons
  const lessonList = [];
  for (let i = 0; i < 20; i++) {
    const lesson = await prisma.lesson.create({
      data: {
        name: `Lesson ${i + 1}`,
        day: "MONDAY",
        classId: classList[i % classList.length].class_id,
        subjectId: subjectList[i % subjectList.length].subject_id,
        teacherId: teacherList[i % teacherList.length].teacher_id,
      },
    });
    lessonList.push(lesson);
  }

  // Seed Terms
  const termList = [];
  for (let i = 1; i <= 3; i++) {
    const term = await prisma.term.create({
      data: {
        name: `Term ${i}`,
        session: `2023/2024`,
        startDate: new Date(`2023-01-01`),
        endDate: new Date(`2023-12-31`),
      },
    });
    termList.push(term);
  }

  // Seed Exams
  const examList = [];
  for (let i = 0; i < 10; i++) {
    const exam = await prisma.exam.create({
      data: {
        name: `Exam ${i + 1}`,
        lessonId: lessonList[i % lessonList.length].lesson_id,
        termId: termList[i % termList.length].term_id,
      },
    });
    examList.push(exam);
  }

  // Seed Assignments
  const assignmentList = [];
  for (let i = 0; i < 10; i++) {
    const assignment = await prisma.assignment.create({
      data: {
        name: `Assignment ${i + 1}`,
        lessonId: lessonList[i % lessonList.length].lesson_id,
        termId: termList[i % termList.length].term_id,
      },
    });
    assignmentList.push(assignment);
  }

  // Seed Results
  for (let i = 0; i < 30; i++) {
    const student = studentList[i % studentList.length];
    if (i < examList.length) {
      await prisma.result.create({
        data: {
          result_id: generateShortUuid(),
          studentId: student.student_id,
          examId: examList[i].exam_id,
          score: Math.random() * 100,
        },
      });
    } else {
      await prisma.result.create({
        data: {
          result_id: generateShortUuid(),
          studentId: student.student_id,
          assignmentId: assignmentList[i % assignmentList.length].assignment_id,
          score: Math.random() * 100,
        },
      });
    }
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
