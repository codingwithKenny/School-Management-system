"use server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ..............................................................................................................................................
export async function fetchGrades(sessionId) {
  if (!sessionId || isNaN(parseInt(sessionId, 10))) {
    console.warn("sessionId is missing or invalid in fetchGrades()");
    return [];
  }

  return await prisma.grade.findMany({
    where: { sessionId: parseInt(sessionId, 10) },
    select: { id: true, name: true },
  });
}
export async function fetchTerms(sessionId) {
  if (!sessionId || isNaN(parseInt(sessionId, 10))) {
    console.warn("⚠️ sessionId is missing or invalid in fetchTerms()");
    return [];
  }

  try {
    return await prisma.term.findMany({
      where: {
        sessionId: parseInt(sessionId, 10),
        isCurrent: true,
      },
      select: { id: true, name: true, isCurrent: true },
    });
  } catch (error) {
    console.error("❌ Error fetching terms:", error);
    return [];
  }
}
export async function fetchClasses(sessionId, gradeId) {
  if (!sessionId || isNaN(parseInt(sessionId, 10))) {
    console.warn("⚠️ sessionId is missing or invalid in fetchClasses()");
    return [];
  }
  if (!gradeId || isNaN(parseInt(gradeId, 10))) {
    console.warn("⚠️ gradeId is missing or invalid in fetchClasses()");
    return [];
  }

  return await prisma.class.findMany({
    where: {
      grade: {
        sessionId: parseInt(sessionId, 10),
        id: parseInt(gradeId, 10),
      },
    },
    select: {
      id: true,
      name: true,
      gradeId: true,
      supervisor: {
        select: {
          id: true,
          name: true,
          surname: true,
          username: true,
          sex: true,
        },
      },
    },
  });
}
export async function fetchStudents(sessionId, gradeId, classId) {
  if (!sessionId || !gradeId || !classId) {
    console.warn(
      "⚠️ sessionId, gradeId, or classId is missing in fetchStudents()"
    );
    return [];
  }

  return await prisma.student.findMany({
    where: {
      sessionId: parseInt(sessionId, 10),
      gradeId: parseInt(gradeId, 10),
      classId: parseInt(classId, 10),
      isDeleted: false,
    },
    select: {
      id: true,
      name: true,
      surname: true,
      username: true,
      phone: true,
      address: true,
      email: true,
      img: true,
      sex: true,
      paymentStatus: true,
      session: { select: { id: true, name: true } }, // ✅ Ensure session is fetched
      term: { select: { id: true, name: true } }, // ✅ Ensure term is fetched
      class: { select: { id: true, name: true } },
      grade: { select: { id: true, name: true } },
      subjects: { select: { subject: { select: { id: true, name: true } } } },
      createdAt: true,
    },
  });
}
export async function fetchSubjects() {
  return await prisma.subject.findMany({
    select: { id: true, name: true },
  });
}
// .............................................................................................................................................
export const createTeacher = async (data) => {
  try {
    const existingUsers = await clerkClient.users.getUserList({
      emailAddress: [data.email],
      limit: 1,
    });

    if (existingUsers.length > 0) {
      console.error("Error: Email already in Clerk.");
      return {
        success: false,
        error: "A user with this email already exists.",
      };
    }
    const teacher = await clerkClient.users.createUser({
      username: data.username,
      emailAddress: [data.email],
      password: data.password,
      publicMetadata: { role: "teacher" },
    });

    const newTeacher = await prisma.teacher.create({
      data: {
        id: teacher.id,
        surname: data.surname,
        name: data.name,
        username: data.username,
        phone: data.phone,
        img: data.img || null,
        email: data.email,
        sex: data.sex,
        address: data.address || null,
      },
    });
    if (Array.isArray(data.subjects) && data.subjects.length > 0) {
      const subjectData = data.subjects.map((subjectId) => ({
        teacherId: newTeacher.id,
        subjectId: parseInt(subjectId, 10),
      }));

      await prisma.teacherSubject.createMany({
        data: subjectData,
        skipDuplicates: true,
      });
    } else {
      console.warn("No subjects provided.");
    }
    revalidatePath("/list/teachers");
    revalidatePath("/list/classes");
    return { success: true, message: "Teacher added successfully!" };
  } catch (error) {
    if (error.status === 422) {
      return {
        success: false,
        error: "Invalid user data. Check email, password, and username.",
      };
    }

    return { success: false, error: "An unexpected error occurred." };
  }
};
export const updateTeacher = async (teacherId, data) => {
  try {
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!existingTeacher) {
      return { success: false, error: "Teacher not found." };
    }
    if (
      data.email !== existingTeacher.email ||
      data.username !== existingTeacher.username
    ) {
      const duplicateTeacher = await prisma.teacher.findFirst({
        where: {
          OR: [{ email: data.email }, { username: data.username }],
          NOT: { id: teacherId },
        },
      });

      if (duplicateTeacher) {
        if (duplicateTeacher.email === data.email) {
          return {
            success: false,
            error: "A teacher with this email already exists.",
          };
        }
        if (duplicateTeacher.username === data.username) {
          return {
            success: false,
            error: "A teacher with this username already exists.",
          };
        }
      }
    }
    await clerkClient.users.updateUser(teacherId, {
      emailAddress: [data.email],
      username: data.username,
    });

    const updatedTeacher = await prisma.teacher.update({
      where: { id: teacherId },
      data: {
        surname: data.surname,
        name: data.name,
        username: data.username,
        email: data.email,
        sex: data.sex,
        address: data.address || null,
      },
    });

    console.log("Teacher Updated:", updatedTeacher);

    if (Array.isArray(data.subjects)) {
      console.log("Updating teacher subjects...");

      await prisma.teacherSubject.deleteMany({
        where: { teacherId },
      });

      if (data.subjects.length > 0) {
        const subjectData = data.subjects.map((subjectId) => ({
          teacherId,
          subjectId: parseInt(subjectId, 10),
        }));

        await prisma.teacherSubject.createMany({
          data: subjectData,
          skipDuplicates: true,
        });

        console.log("Subjects Updated:", subjectData);
      } else {
        console.warn("No subjects provided.");
      }
    }

    // Refresh UI
    revalidatePath("/list/teachers");
    revalidatePath("/list/classes");
 
    return { success: true, message: "Teacher updated successfully!" };
  } catch (error) {
    console.error("Error Updating Teacher:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
};
export const deleteTeacher = async (teacherId) => {
  try {
    console.log(`Deleting Teacher ID: ${teacherId}...`);

    const existingTeacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!existingTeacher) {
      console.error("Error: Teacher Not Found.");
      return { success: false, error: "Teacher not found." };
    }
    await prisma.teacher.update({
      where: { id: teacherId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
    try {
      await clerkClient.users.deleteUser(teacherId);
      console.log("Teacher deleted from Clerk.");
    } catch (clerkError) {
      console.error("Error deleting Teacher from Clerk:", clerkError);
      return { success: false, error: "Failed to delete Teacher from Clerk." };
    }

    console.log("Teacher Soft Deleted Successfully.");
    return { success: true, message: "Teacher soft deleted successfully!" };
  } catch (error) {
    console.error("Error Soft Deleting Teacher:", error);
    return { success: false, error: "An unexpted error occurred." };
  }
};
// ...............................................................................................................
export async function createStudent(data) {
  try {
    console.log("Checking if student exists in Clerk and Prisma...");

    const existingStudent = await prisma.student.findUnique({
      where: { username: data.username },
    });

    if (existingStudent) {
      return { success: false, error: "Username is already taken." };
    }

    const sessionId = parseInt(data.sessionId, 10);
    const gradeId = parseInt(data.gradeId, 10);
    const classId = parseInt(data.classId, 10);
    const termId = parseInt(data.termId, 10);

    const [existingSession, existingGrade, existingClass, existingTerm] =
      await Promise.all([
        prisma.session.findUnique({ where: { id: sessionId } }),
        prisma.grade.findUnique({ where: { id: gradeId } }),
        prisma.class.findUnique({ where: { id: classId } }),
        prisma.term.findUnique({ where: { id: termId } }),
      ]);

    if (!existingSession)
      return { success: false, error: "Invalid session selected." };
    if (!existingGrade)
      return { success: false, error: "Invalid grade selected." };
    if (!existingClass)
      return { success: false, error: "Invalid class selected." };
    if (!existingTerm)
      return { success: false, error: "Invalid term selected." };

    console.log("Validating subjects...");

    if (!Array.isArray(data.subjects) || data.subjects.length === 0) {
      return {
        success: false,
        error: "At least one subject must be selected.",
      };
    }

    const existingSubjects = await prisma.subject.findMany({
      where: { id: { in: data.subjects.map((id) => parseInt(id, 10)) } },
      select: { id: true },
    });

    const validSubjectIds = existingSubjects.map((sub) => sub.id);
    if (validSubjectIds.length !== data.subjects.length) {
      return {
        success: false,
        error: "One or more selected subjects are invalid.",
      };
    }


    const generatePassword = (surname) => surname.toLowerCase() + "1234!";

    const storedPassword = generatePassword(data.surname);

    const student = await clerkClient.users.createUser({
      username: data.username.trim(),
      emailAddress: [data.email.trim()],
      password: storedPassword,
      publicMetadata: { role: "student" },
    });


    const newStudent = await prisma.student.create({
      data: {
        id: student.id,
        surname: data.surname,
        name: data.name,
        username: data.username,
        email: data.email,
        phone: data.phone,
        sex: data.sex.toUpperCase(),
        img: data.img || null,
        address: data.address || null,
        sessionId,
        gradeId,
        classId,
        termId,
      },
    });

    if (Array.isArray(data.subjects) && data.subjects.length > 0) {
      const subjectData = data.subjects.map((subjectId) => ({
        studentId: newStudent.id,
        subjectId: parseInt(subjectId, 10),
      }));

      await prisma.studentSubject.createMany({
        data: subjectData,
        skipDuplicates: true,
      });
    } else {
    }
    revalidatePath("/list/students");

    return { success: true, message: "Student created successfully!" };
  } catch (error) {

    if (error.errors) {
      console.error(
        "Clerk Validation Errors:",
        JSON.stringify(error.errors, null, 2)
      );
    }

    return { success: false, error: error.error.errors[0].message };
  }
}
export const updateStudent = async (studentId, data) => {
  try {
    const existingStudent = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        paymentStatus: true,
        termId: true,
        sessionId: true,
        isDeleted: true,
      },
    });

    if (!existingStudent)
      return { success: false, error: "Student not found." };
    if (existingStudent.isDeleted)
      return { success: false, error: "Student record is inactive." };

    const existstudent = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!existstudent) {
      console.error("Error: student Not Found.");
      return { success: false, error: "student not found." };
    }
    if (
      data.email !== existstudent.email ||
      data.username !== existstudent.username
    ) {
      const duplicateStudent = await prisma.student.findFirst({
        where: {
          OR: [{ email: data.email }, { username: data.username }],
          NOT: { id: studentId },
        },
      });

      if (duplicateStudent) {
        if (duplicateStudent.email === data.email) {
          return {
            success: false,
            error: "A student with this email already exists.",
          };
        }
        if (duplicateStudent.username === data.username) {
          console.error("Error: Duplicate Username Detected.");
          return {
            success: false,
            error: "A student with this username already exists.",
          };
        }
      }
    }

    // MAKE SURE CLASS,GRADE AND TERM ARE SAVED IN ID
    const classId = parseInt(data.classId, 10);
    const gradeId = parseInt(data.gradeId, 10);
    const termId = parseInt(data.termId, 10);
    const sessionId = parseInt(data.sessionId, 10);
    console.log(sessionId);

    const [existingClass, existingGrade] = await Promise.all([
      prisma.class.findUnique({ where: { id: classId } }),
      prisma.grade.findUnique({ where: { id: gradeId } }),
    ]);

    if (!existingClass)
      return { success: false, error: "Invalid class selected." };
    if (!existingGrade)
      return { success: false, error: "Invalid grade selected." };

    await clerkClient.users.updateUser(studentId, {
      emailAddress: [data.email.trim()],
      username: data.username.trim(),
    });

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        surname: data.surname,
        phone: data.phone,
        name: data.name,
        username: data.username,
        email: data.email,
        sex: data.sex.toUpperCase(),
        address: data.address || null,
        classId,
        sessionId,
        termId,
        gradeId,
        paymentStatus: data.paymentStatus,
        img: data.img,
      },
    });

    if (Array.isArray(data.subjects)) {
      await prisma.studentSubject.deleteMany({ where: { studentId } });

      if (data.subjects.length > 0) {
        await prisma.studentSubject.createMany({
          data: data.subjects.map((subjectId) => ({
            studentId,
            subjectId: parseInt(subjectId, 10),
          })),
          skipDuplicates: true,
        });
      }
    }
    //  CHECK IF THE PAYMENT UPDATE IS "PAID"
    // if (data.paymentStatus === "PAID") {
    //   const sessionId = existingStudent.sessionId;
    //   const currentTermId = data.termId || existingStudent.termId;

    //   // Check if a payment record exists for the student, session, and term
    //   const existingPayment = await prisma.paymentHistory.findFirst({
    //     where: { studentId, sessionId, termId: currentTermId },
    //   });

    //   if (existingPayment) {
    //     if (existingPayment.status !== "PAID") {
    //       await prisma.paymentHistory.update({
    //         where: { id: existingPayment.id },
    //         data: { status: "PAID" },
    //       });
    //     }
    //   } else {
    //     await prisma.paymentHistory.create({
    //       data: {
    //         studentId,
    //         status: "PAID",
    //         termId: currentTermId,
    //         sessionId,
    //         updatedBy: "Admin",
    //       },
    //     });
    //     console.log("Payment history created for student:", studentId);
    //   }
    // }

    return { success: true, student: updatedStudent };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
export const deleteStudent = async (studentId) => {
  try {

    const existingStudent = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!existingStudent) {
      return { success: false, error: "Teacher not found." };
    }
    await prisma.student.update({
      where: { id: studentId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
    try {
      await clerkClient.users.deleteUser(studentId);
    } catch (clerkError) {
      return { success: false, error: "Failed to delete student from Clerk." };
    }
    return { success: true, message: "student soft deleted successfully!" };
  } catch (error) {
    return { success: false, error: "An unexpted error occurred." };
  }
};
// ............................................................................................................................................
export const createSubject = async (data) => {
  try {
    const existingSubject = await prisma.subject.findUnique({
      where: { name: data.name.trim() },
    });

    if (existingSubject) {
      return { success: false, error: "Subject already available." };
    }
    const newSubject = await prisma.subject.create({
      data: { name: data.name.trim() },
    });
   
    revalidatePath("/list/teachers");
    revalidatePath("/list/classes");
    revalidatePath("/list/resultoverview");
    revalidatePath("/list/students");
    return { success: true, message: "Subject created successfully!" };
    
  } catch (error) {

    return {
      success: false,
      error: "An unexpected error occurred while creating the subject.",
    };
  }
};
export const updateSubject = async (id, data) => {
  try {
    await prisma.subject.update({
      where: { id },
      data: { name: data.name },
    });
    revalidatePath("/list/subjects");
    return { success: true };
  } catch (error) {
    if (error.code === "P2002") {
      return { success: false, error: "Subject already exists." };
    }
    return { success: false, error: "An unexpected error occurred." };
  }
};

export const deleteSubject = async (id) => {
  try {
    const existingSubject = await prisma.subject.findUnique({
      where: { id },
    });

    if (!existingSubject) {
      return { success: false, error: "Subject not found." };
    }
    await prisma.subject.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
    revalidateTag("subjects");
    return { success: true };
  } catch (error) {
    return { success: false, error: "An unexpected error occurred." };
  }
};
// ............................................................................................................................................
export async function createSession(sessionName) {
  try {
    if (!sessionName || typeof sessionName !== "string" || sessionName.trim() === "") {
      return { success: false, message: "Invalid session name." };
    }

    const existingSession = await prisma.session.findFirst({
      where: { name: sessionName.trim() },
    });
    if (existingSession) {
      return { success: false, message: "Session already exists." };
    }

    const lastSession = await prisma.session.findFirst({
      where: { isCurrent: true },
    });

    if (lastSession) {
      // ✅ Get the currently active term in the last session
      const lastActiveTerm = await prisma.term.findFirst({
        where: { sessionId: lastSession.id, isCurrent: true },
      });

      if (lastActiveTerm) {
        console.log("📌 Last active term:", lastActiveTerm.name);

        // ✅ If last active term is "Third Term", save payment history
        if (lastActiveTerm.name === "Third Term") {
          const allStudents = await prisma.student.findMany({
            where: { sessionId: lastSession.id, isDeleted: false },
            select: { id: true, paymentStatus: true },
          });

          if (allStudents.length > 0) {
            const paymentHistoryRecords = allStudents.map((student) => ({
              studentId: student.id,
              sessionId: lastSession.id,
              termId: lastActiveTerm.id,
              status: student.paymentStatus,
            }));

            await prisma.paymentHistory.createMany({ data: paymentHistoryRecords });
          }
        }
      }

      // ✅ Deactivate last session and all its terms
      await prisma.session.update({
        where: { id: lastSession.id },
        data: { isCurrent: false },
      });

      await prisma.term.updateMany({
        where: { sessionId: lastSession.id },
        data: { isCurrent: false },
      });
    }

    // ✅ Create the new session
    const newSession = await prisma.session.create({
      data: { name: sessionName.trim(), isCurrent: true, isDeleted: false },
    });

    if (!newSession?.id) {
      return { success: false, message: "Failed to create a new session." };
    }

    // ✅ Create terms and set **First Term as active by default**
    const termNames = ["First Term", "Second Term", "Third Term"];
    await prisma.term.createMany({
      data: termNames.map((name, index) => ({
        name,
        sessionId: newSession.id,
        isCurrent: index === 0, // ✅ First term is active by default
        isDeleted: false,
      })),
    });

    // ✅ Create grades and classes
    const grades = ["JSS1", "JSS2", "JSS3", "SSS1", "SSS2", "SSS3"];
    for (let grade of grades) {
      const newGrade = await prisma.grade.create({
        data: { name: grade, sessionId: newSession.id },
      });

      let classes = [
        { name: `${grade} A`, gradeId: newGrade.id },
        { name: `${grade} B`, gradeId: newGrade.id },
      ];
      if (grade.startsWith("SSS")) {
        classes.push({ name: `${grade} C`, gradeId: newGrade.id });
      }

      await prisma.class.createMany({ data: classes });
    }

    // ✅ Handle promotion if last session exists
    if (lastSession?.id) {
      const promotionResult = await handlePromotionAndMoveToNewClass(
        lastSession.id,
        newSession.id
      );
      if (!promotionResult.success) {
        console.log("Error handling promotion:", promotionResult.message);
      } else {
      }
    }

    // ✅ Revalidate necessary paths
    revalidatePath("/list/classes");
    revalidatePath("/list/resultoverview");
    revalidatePath("/list/teachers");
    revalidatePath("/list/students");

    return {
      success: true,
      message: "Session created successfully!",
      session: newSession,
    };
  } catch (error) {
    return { success: false, message: "An error occurred while creating the session." };
  }
}



// ..............................................................................................................................................
const classPromotionMap = {
  JSS1A: "JSS2A",
  JSS1B: "JSS2B",
  JSS2A: "JSS3A",
  JSS2B: "JSS3B",
  JSS3A: null,
  JSS3B: null,
  SSS1A: "SSS2A",
  SSS1B: "SSS2B",
  SSS1C: "SSS2C",
  SSS2A: "SSS3A",
  SSS2B: "SSS3B",
  SSS2C: "SSS3C",
};

async function handlePromotionAndMoveToNewClass(lastSessionId, newSessionId) {
  try {
    // ✅ GET NEW SESSION DETAILS
    const newSession = await prisma.session.findUnique({
      where: { id: newSessionId },
      select: {
        id: true,
        grades: {
          select: {
            id: true,
            name: true,
            classes: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!newSession)
      return { success: false, message: "No active session found." };

    // ✅ Fetch Current Term for New Session
    const currentTerm = await prisma.term.findFirst({
      where: { isCurrent: true, sessionId: newSessionId },
      select: { id: true },
    });

    if (!currentTerm)
      return {
        success: false,
        message: "❌ No current term found for the new session.",
      };

    const newTermId = currentTerm.id;

    // ✅ Create Class and Grade ID Maps
    const classIdMap = {};
    const gradeIdMap = {};
    newSession.grades.forEach((grade) => {
      grade.classes.forEach((cls) => {
        const formattedClassName = cls.name.replace(/\s+/g, "").toUpperCase();
        classIdMap[formattedClassName] = cls.id;
        gradeIdMap[formattedClassName] = grade.id;
      });
    });

    // ✅ FETCH PROMOTED & REPEATED STUDENTS
    const studentsToProcess = await prisma.classRecord.findMany({
      where: {
        sessionId: lastSessionId,
        promotion: { in: ["PROMOTED", "REPEATED"] }, // ✅ Fetch both promoted and repeated students
      },
      select: {
        studentId: true,
        class: { select: { name: true, id: true } },
        preferredClass: true,
        promotion: true, // ✅ Include promotion status
      },
    });

    if (studentsToProcess.length === 0) {
      return {
        success: false,
        message: "No students found for promotion or repetition.",
      };
    }


    // ✅ PROCESS EACH STUDENT
    const updatePromises = studentsToProcess.map(async (record) => {
      const studentId = record.studentId;
      const formattedCurrentClass = record.class?.name
        ?.replace(/\s+/g, "")
        .toUpperCase();

      // ✅ Fetch student class record
      const studentClassRecord = await prisma.classRecord.findFirst({
        where: { studentId, sessionId: lastSessionId },
        select: { classId: true, id: true },
      });

      if (!studentClassRecord) {
       
        return null;
      }

      // ✅ Fetch gradeId
      const studentClass = await prisma.class.findUnique({
        where: { id: studentClassRecord.classId },
        select: { gradeId: true },
      });

      if (!studentClass) {
        
        return null;
      }

      console.log(`📌 Student ${studentId}: ${record.promotion}`);

      // ✅ Insert student history before updating
      await prisma.studentHistory.create({
        data: {
          studentId,
          sessionId: lastSessionId,
          classId: studentClassRecord.classId,
          gradeId: studentClass.gradeId,
          classRecordId: studentClassRecord.id, // Link to class record
        },
      });


      // ✅ Handle Repeated Students (Stay in the Same Class)
      if (record.promotion === "REPEATED") {
      
        // Get the new class and grade based on the same class name in the new session
        const repeatNewClassId = classIdMap[formattedCurrentClass]; 
        const repeatNewGradeId = gradeIdMap[formattedCurrentClass]; 
      
        if (!repeatNewClassId || !repeatNewGradeId) {
          return null;
        }
      
      
        const repeatedStudent = await prisma.student.update({
          where: { id: studentId },
          data: {
            classId: repeatNewClassId, 
            sessionId: newSessionId,
            gradeId: repeatNewGradeId,
            termId: newTermId,
          },
        });
      
        return repeatedStudent;
      }
      

      // ✅ Handle Promoted Students
      if (record.promotion === "PROMOTED") {
        let newClassId, newGradeId;

        // Special Case: JSS3 to SSS1 (Preferred Class)
        if (formattedCurrentClass.startsWith("JSS3")) {
          const formattedPreferredClass = record.preferredClass
            ?.replace(/\s+/g, "")
            .toUpperCase();

          if (!formattedPreferredClass) {
            console.warn(
              `⚠️ Student ${studentId} has no preferred class. Manual selection required.`
            );
            return null;
          }

          newClassId = classIdMap[formattedPreferredClass];
          newGradeId = gradeIdMap[formattedPreferredClass];

          if (!newClassId || !newGradeId) {
            console.error(
              `❌ Preferred class ${formattedPreferredClass} not found for student ${studentId}.`
            );
            return null;
          }
        } else {
          // Normal Promotion (Use classPromotionMap)
          const nextClassName = classPromotionMap[formattedCurrentClass];

          if (!nextClassName) {
           
            return null;
          }

          newClassId =
            classIdMap[nextClassName.replace(/\s+/g, "").toUpperCase()];
          newGradeId =
            gradeIdMap[nextClassName.replace(/\s+/g, "").toUpperCase()];

          if (!newClassId || !newGradeId) {
          
            return null;
          }
        }

        console.log(
          `✅ Promoting Student ${studentId} to Class ID: ${newClassId}`
        );

        return prisma.student.update({
          where: { id: studentId },
          data: {
            classId: newClassId,
            sessionId: newSessionId,
            gradeId: newGradeId,
            termId: newTermId,
          },
        });
      }

      return null;
    });

    // ✅ WAIT FOR ALL UPDATES TO COMPLETE
    const updatedStudents = await Promise.all(updatePromises.filter(Boolean));

    return {
      success: true,
      message: "Students promoted and repeated successfully",
      updatedStudents,
    };
  } catch (error) {
    return { success: false, message: "Error occurred while moving students" };
  }
}

// ...............................................................................................................................................
export async function assignClassTeacher({ classId, teacherId }) {
  try {
    if (!classId || !teacherId) {
      return { success: false, error: "Missing required fields" };
    }

    const classIdNum = Number(classId);

    await prisma.$transaction(async (prisma) => {
      const existingClass = await prisma.class.findUnique({
        where: { id: classIdNum },
        include: { grade: { include: { session: true } } },
      });

      if (!existingClass) {
        throw new Error("Class not found");
      }
      const sessionId = existingClass.grade.sessionId;
      // CHECK IF TEACHER IS ALREADY ASSIGNED TO A CLASS IN THAT SESSIO
      const existingAssignment = await prisma.class.findFirst({
        where: {
          grade: {
            sessionId: sessionId,
          },
          supervisorId: teacherId,
          NOT: { id: classIdNum },
        },
      });

      if (existingAssignment) {
        throw new Error(
          "This teacher is already assigned to another class in this session."
        );
      }

      // Assign teacher to class
      await prisma.class.update({
        where: { id: classIdNum },
        data: { supervisorId: teacherId },
      });
    });

    console.log("✅ Teacher assigned successfully");
    revalidatePath("/list/classes");
  
    return { success: true, message: "Teacher assigned successfully" };
  } catch (error) {
    console.error("❌ Error:", error.message);
    return { success: false, error: error.message || "Internal Server Error" };
  }
}
// ............................................................................................................................
export const createResult = async (results) => {
  try {
    if (!Array.isArray(results) || results.length === 0) {
      return { success: false, error: "❌ No results provided." };
    }

    const { sessionId, termId, gradeId, classId, subjectId } = results[0];

    if (!sessionId || !termId || !gradeId || !classId || !subjectId) {
      return { success: false, error: "❌ Missing required fields." };
    }

    // ✅ Check if the class already has submitted results
    const existingClassResults = await prisma.result.findFirst({
      where: { sessionId, termId, gradeId, classId, subjectId },
    });

    if (existingClassResults) {
      return {
        success: false,
        error: "❌ This class already has submitted results.",
      };
    }

    // ✅ Validate student results
    const validResults = results
      .map((result) => {
        if (
          !result.studentId ||
          !result.teacherId ||
          !result.firstAssessment ||
          !result.secondAssessment ||
          !result.examScore
        ) {
          return null;
        }

        return {
          studentId: result.studentId,
          teacherId: result.teacherId,
          subjectId,
          termId,
          sessionId,
          gradeId,
          classId,
          firstAssessment: parseFloat(result.firstAssessment),
          secondAssessment: parseFloat(result.secondAssessment),
          examScore: parseFloat(result.examScore),
          totalScore:
            parseFloat(result.firstAssessment) +
            parseFloat(result.secondAssessment) +
            parseFloat(result.examScore),
        };
      })
      .filter(Boolean);

    if (validResults.length === 0) {
      return {
        success: false,
        error: "❌ Some results are invalid. Fix them before submission.",
      };
    }

    // ✅ Insert results
    await prisma.result.createMany({ data: validResults });

    return { success: true };
  } catch (error) {
    console.error("❌ Error creating results:", error);
    return { success: false, error: "❌ An unexpected error occurred." };
  }
};
// ............................................................................................................................

export const createClassRecord = async (records) => {
  console.log("🚀 Incoming Records:", JSON.stringify(records, null, 2));

  try {
    if (!Array.isArray(records) || records.length === 0) {
      return { success: false, error: "❌ No valid record provided." };
    }

    const { sessionId, termId, classId, teacherId } = records[0];

    if (!sessionId || !termId || !classId || !teacherId) {
      return {
        success: false,
        error:
          "❌ Missing required fields: sessionId, termId, classId, or teacherId.",
      };
    }

    // ✅ Check if term exists
    const selectedTerm = await prisma.term.findUnique({
      where: { id: termId },
    });

    if (!selectedTerm) {
      return { success: false, error: "❌ Term not found." };
    }

    const TermName = selectedTerm.name;

    // ✅ Prevent duplicate records
    const existingRecord = await prisma.classRecord.findFirst({
      where: { sessionId, termId, classId, teacherId },
    });

    if (existingRecord) {
      console.log("❌ Class record already exists.");
      return {
        success: false,
        error: "❌ This class already has submitted records for this term.",
      };
    }

    // ✅ Validate records and include `preferredClass` for JSS3 students
    const validRecords = records
      .map((record, index) => {
        if (!record.studentId || !record.teacherId || !record.remark) {
          console.warn(`⚠️ Skipping invalid record at index ${index}:`, record);
          return null;
        }

        const preferredClass = record.preferredClass?.toUpperCase() || null;

        let promotion = undefined;

        if (TermName === "Third Term") {
          if (record.promotion === "PROMOTED") {
            promotion = "PROMOTED";
          } else if (record.promotion === "REPEATED") {
            promotion = "REPEATED";
          }
        }
        console.log(promotion);
        console.log(TermName);
        console.log("🚀 Incoming Record:", JSON.stringify(record, null, 2));
        console.log("🔍 Processed Preferred Class:", preferredClass);

        return {
          studentId: record.studentId,
          teacherId: record.teacherId,
          termId,
          sessionId,
          classId,
          remark: record.remark || "N/A",
          position: parseInt(record.position, 10) || null,
          promotion,
          preferredClass, // ✅ Automatically included if available, else null
        };
      })
      .filter(Boolean);

    console.log(
      "💾 Saving Class Records:",
      JSON.stringify(validRecords, null, 2)
    );

    // ✅ Save class records
    await prisma.classRecord.createMany({
      data: validRecords,
      skipDuplicates: true,
    });

    // ✅ Mark students as promoted if it's Third Term
    if (TermName === "Third Term") {
      console.log("🔄 Marking students for promotion...");

      const promotedStudents = validRecords.filter(
        (r) => r.promotion === "PROMOTED"
      );

      console.log(promotedStudents);
    }

    return { success: true, message: "✅ Class records saved successfully!" };
  } catch (error) {
    console.error("❌ Error saving class record:", error.message);
    return { success: false, error: "❌ An unexpected error occurred." };
  }
};
// ..........................................................................................................................................
export async function allResults() {
  try {
    const results = await prisma.result.findMany({
      include: {
        student: {
          select: {
            id: true,
            name: true,
            surname: true,
            grade: { select: { id: true, name: true } },
          },
        },
        subject: { select: { id: true, name: true } },
        term: { select: { id: true, name: true } },
      },
    });

    return { success: true, data: results };
  } catch (error) {
    console.error("❌ Error Fetching Results:", error);
    return { success: false, error: "Failed to fetch results" };
  }
}
// ............................................................................................................................................
export const createAdmin = async (data) => {
  try {
    // Step 1: Check if the email already exists in Clerk
    const existingUsers = await clerkClient.users.getUserList({
      emailAddress: [data.email],
      limit: 1,
    });

    if (existingUsers.length > 0) {
      console.error("Error: Email already in Clerk.");
      return {
        success: false,
        error: "A user with this email already exists.",
      };
    }

    // Step 2: Create admin in Clerk
    const admin = await clerkClient.users.createUser({
      username: data.username,
      emailAddress: [data.email],
      password: data.password,
      publicMetadata: { role: "admin" }, // Setting role as admin
    });

    // Step 3: Save admin details in Prisma
    const newAdmin = await prisma.admin.create({
      data: {
        id: admin.id, // Clerk user ID as the primary key
        surname: data.surname,
        name: data.name,
        username: data.username,
        phone: data.phone,
        img: data.img || null, // Optional image
        email: data.email,
        password: data.password, // This should not be saved in production, usually Clerk handles this
        sex: data.sex,
        address: data.address || null,
      },
    });
    revalidatePath("/list/admin");

    return { success: true, message: "Admin added successfully!" };
  } catch (error) {
    console.error("Error Creating Admin:", error);
    if (error.status === 422) {
      return {
        success: false,
        error: "Invalid user data. Check email, password, and username.",
      };
    }

    return { success: false, error: "An unexpected error occurred." };
  }
};


export default async () => {};

export async function updateTermStatus(termId, sessionId) {
  console.log("🔄 Updating term status", { termId, sessionId });

  try {
    if (!termId || !sessionId) {
      return { success: false, message: "Invalid term selection." };
    }

    // ✅ Find the current active term
    const lastTerm = await prisma.term.findFirst({
      where: { sessionId, isCurrent: true },
    });

    if (!lastTerm || !lastTerm.id) {
      console.error("❌ No last active term found.");
      return { success: false, message: "No previous term found." };
    }

    // ✅ Fetch all students in the session
    const allStudents = await prisma.student.findMany({
      where: { sessionId, isDeleted: false },
      select: { id: true, paymentStatus: true },
    });

    if (allStudents.length === 0) {
      return { success: false, message: "No students found for this session." };
    }

    // ✅ Get students who already have payment history for this term
    const existingPaymentRecords = await prisma.paymentHistory.findMany({
      where: { sessionId, termId: lastTerm.id },
      select: { studentId: true },
    });

    const existingStudentIds = new Set(existingPaymentRecords.map((record) => record.studentId));

    // ✅ Filter students who do NOT already have payment history
    const newPaymentHistoryRecords = allStudents
      .filter((student) => !existingStudentIds.has(student.id))
      .map((student) => ({
        studentId: student.id,
        sessionId,
        termId: lastTerm.id,
        status: student.paymentStatus,
      }));

    if (newPaymentHistoryRecords.length > 0) {
      try {
        await prisma.paymentHistory.createMany({ data: newPaymentHistoryRecords });
      } catch (err) {
        console.error("❌ Error saving payment history:", err);
      }
    }

    // ✅ Deactivate all previous terms
    await prisma.term.updateMany({
      where: { sessionId },
      data: { isCurrent: false },
    });

    // ✅ Activate the new term
    const newTerm = await prisma.term.update({
      where: { id: termId },
      data: { isCurrent: true },
    });

    return { success: true, message: "Term updated successfully. Admin will handle student updates." };
  } catch (error) {
    console.error("❌ Error updating term status:", error);
    return { success: false, message: "An error occurred while updating the term." };
  }
}

















export const updateSession = async (sessionId, newName) => {
  try {
    if (!sessionId || !newName.trim()) {
      return { success: false, message: "Invalid session ID or name." };
    }
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return { success: false, message: "Session not found." };
    }
    const existingSession = await prisma.session.findFirst({
      where: { name: newName.trim() },
    });

    if (existingSession) {
      return { success: false, message: "Session name already exists." };
    }

    // Update session name
    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: { name: newName.trim() },
    });

    revalidatePath("/list/settings");
    revalidatePath("/list/classes");
    revalidatePath("/list/resultoverview");
    revalidatePath("/list/teachers");
    revalidatePath("/list/students");



    return { success: true, message: "Session updated successfully!", session: updatedSession };
  } catch (error) {
    return { success: false, message: "An error occurred while updating the session." };
  }
};



export const updatePaymentHistory = async ({ studentId, sessionId, termId, newStatus }) => {
  console.log(studentId, "1", sessionId, "2", termId, "3", newStatus, "4");
  
  try {
    if (!studentId || !sessionId || !termId || !newStatus) {
      return { success: false, message: "Missing required parameters" };
    }

    const existingRecord = await prisma.paymentHistory.findFirst({
      where: { studentId, sessionId, termId },
    });

    if (!existingRecord) {
      return { success: false, message: "Payment record not found" };
    }

    const updatedRecord = await prisma.paymentHistory.update({
      where: { id: existingRecord.id },
      data: { status: newStatus },
    });

    return { success: true, message: "Payment status updated successfully", data: updatedRecord };

  } catch (error) {
    return { success: false, message: error.message };
  }
};





