-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE');

-- CreateTable
CREATE TABLE "Admin" (
    "admin_id" VARCHAR(10) NOT NULL DEFAULT substring(gen_random_uuid()::text, 1, 10),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("admin_id")
);

-- CreateTable
CREATE TABLE "Teacher" (
    "teacher_id" VARCHAR(10) NOT NULL DEFAULT substring(gen_random_uuid()::text, 1, 10),
    "surname" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "sex" "Sex" NOT NULL,
    "email" TEXT NOT NULL,
    "img" TEXT,
    "address" TEXT,
    "password" TEXT NOT NULL,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("teacher_id")
);

-- CreateTable
CREATE TABLE "Session" (
    "session_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "Term" (
    "term_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Term_pkey" PRIMARY KEY ("term_id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "subject_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "teacherId" VARCHAR(10),

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("subject_id")
);

-- CreateTable
CREATE TABLE "Grade" (
    "grade_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("grade_id")
);

-- CreateTable
CREATE TABLE "Class" (
    "class_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "gradeId" INTEGER NOT NULL,
    "supervisorId" VARCHAR(10),

    CONSTRAINT "Class_pkey" PRIMARY KEY ("class_id")
);

-- CreateTable
CREATE TABLE "Parent" (
    "parent_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Parent_pkey" PRIMARY KEY ("parent_id")
);

-- CreateTable
CREATE TABLE "Student" (
    "student_id" VARCHAR(10) NOT NULL DEFAULT substring(gen_random_uuid()::text, 1, 10),
    "surname" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "sex" "Sex" NOT NULL,
    "img" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gradeId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "parentId" INTEGER NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("student_id")
);

-- CreateTable
CREATE TABLE "StudentSubject" (
    "studentId" VARCHAR(10) NOT NULL,
    "subjectId" INTEGER NOT NULL,

    CONSTRAINT "StudentSubject_pkey" PRIMARY KEY ("studentId","subjectId")
);

-- CreateTable
CREATE TABLE "Exam" (
    "exam_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "termId" INTEGER NOT NULL,
    "sessionId" INTEGER NOT NULL,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("exam_id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "assessment_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "termId" INTEGER NOT NULL,
    "sessionId" INTEGER NOT NULL,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("assessment_id")
);

-- CreateTable
CREATE TABLE "Result" (
    "result_id" VARCHAR(10) NOT NULL DEFAULT substring(gen_random_uuid()::text, 1, 10),
    "studentId" VARCHAR(10) NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "termId" INTEGER NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "examScore" DOUBLE PRECISION NOT NULL,
    "assessmentScore" DOUBLE PRECISION NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("result_id")
);

-- CreateTable
CREATE TABLE "ExamResult" (
    "id" SERIAL NOT NULL,
    "studentId" VARCHAR(10) NOT NULL,
    "examId" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ExamResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentResult" (
    "id" SERIAL NOT NULL,
    "studentId" VARCHAR(10) NOT NULL,
    "assessmentId" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "AssessmentResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "attendance_id" SERIAL NOT NULL,
    "studentId" VARCHAR(10) NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("attendance_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_username_key" ON "Teacher"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_email_key" ON "Teacher"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_name_key" ON "Session"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_key" ON "Subject"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Grade_name_key" ON "Grade"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Class_name_key" ON "Class"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Parent_email_key" ON "Parent"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_username_key" ON "Student"("username");

-- AddForeignKey
ALTER TABLE "Term" ADD CONSTRAINT "Term_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("session_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("teacher_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("grade_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "Teacher"("teacher_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("grade_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("class_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Parent"("parent_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSubject" ADD CONSTRAINT "StudentSubject_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("student_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSubject" ADD CONSTRAINT "StudentSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("subject_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("subject_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("term_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("session_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("subject_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("term_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("session_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("student_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("subject_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("term_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("session_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamResult" ADD CONSTRAINT "ExamResult_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("student_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamResult" ADD CONSTRAINT "ExamResult_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("exam_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentResult" ADD CONSTRAINT "AssessmentResult_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("student_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentResult" ADD CONSTRAINT "AssessmentResult_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("assessment_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("student_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("subject_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("session_id") ON DELETE RESTRICT ON UPDATE CASCADE;
