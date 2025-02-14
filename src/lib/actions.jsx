"use server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { PromotionStatus } from "@prisma/client";



export const createTeacher = async (data) => {
  try {
    const existingUsers = await clerkClient.users.getUserList({
      emailAddress: [data.email],
      limit: 1,
    });

    if (existingUsers.length > 0) {
      console.error("Error: Email already in Clerk.");
      return { success: false, error: "A user with this email already exists." };
    }
    const teacher = await clerkClient.users.createUser({
      username: data.username,
      emailAddress: [data.email],
      password: data.password, 
      publicMetadata: { role: "teacher" },
    })

    const newTeacher = await prisma.teacher.create({
      data: {
        id: teacher.id, 
        surname: data.surname,
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password, 
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
    return { success: true, message: "Teacher added successfully!" };

  } catch (error) {
    console.error("Error Creating Teacher:", error);
    if (error.status === 422) {
      return { success: false, error: "Invalid user data. Check email, password, and username." };
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
      console.error("Error: Teacher Not Found.");
      return { success: false, error: "Teacher not found." };
    }
    if (data.email !== existingTeacher.email || data.username !== existingTeacher.username) {
      const duplicateTeacher = await prisma.teacher.findFirst({
        where: {
          OR: [{ email: data.email }, { username: data.username }],
          NOT: { id: teacherId },
        },
      });

      if (duplicateTeacher) {
        if (duplicateTeacher.email === data.email) {
          return { success: false, error: "A teacher with this email already exists." };
        }
        if (duplicateTeacher.username === data.username) {
          console.error("Error: Duplicate Username Detected.");
          return { success: false, error: "A teacher with this username already exists." };
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

    console.log("Teacher Soft Deleted Successfully.");
    return { success: true, message: "Teacher soft deleted successfully!" };
  } catch (error) {
    console.error("Error Soft Deleting Teacher:", error);
    return { success: false, error: "An unexpted error occurred." };
  }
};
// ...............................................................................................................
export async function createStudent(data) {
  console.log(data, 'heyyyyyyyyyyyyyyyy')
  try {
    console.log("if student exists in Clerk and Prisma...");
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
    
    const [existingSession, existingGrade, existingClass] = await Promise.all([
      prisma.session.findUnique({ where: { id: sessionId } }),
      prisma.grade.findUnique({ where: { id: gradeId } }),
      prisma.class.findUnique({ where: { id: classId } }),
      prisma.term.findUnique({ where: { id: termId } }),
    ]);

    if (!existingSession) return { success: false, error: "Invalid session selected." };
    if (!existingGrade) return { success: false, error: "Invalid grade selected." };
    if (!existingClass) return { success: false, error: "Invalid class selected." };

    console.log("Checking if subjects exist...");

    if (!Array.isArray(data.subjects) || data.subjects.length === 0) {
      return { success: false, error: "At least one subject must be selected." };
    }

    const existingSubjects = await prisma.subject.findMany({
      where: { id: { in: data.subjects.map((id) => parseInt(id, 10)) } },
      select: { id: true },
    });

    const validSubjectIds = existingSubjects.map((sub) => sub.id);
    if (validSubjectIds.length !== data.subjects.length) {
      return { success: false, error: "One or more selected subjects are invalid." };
    }

    console.log("Creating Student in Clerk...");

    const generatePassword = (surname) => {
      return surname.toLowerCase() + "1234!";
    };

    const storedPassword = generatePassword(data.surname);
    
        const student = await clerkClient.users.createUser({
      username: data.username.trim(), 
      emailAddress: [data.email.trim()], 
      password: storedPassword, 
      publicMetadata: { role: "student" }, 
    });
        console.log(student.password)
    console.log("Clerk User Created:", student);
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
        subjects: {
          create: validSubjectIds.map((subjectId) => ({
            subject: { connect: { id: subjectId } },
          })),
        }, 
      },
    });
    revalidatePath("/list/students");
    return { success: true, message: "Student created successfully!" };
  }catch (error) {
    console.error("Error Creating Student in Clerk:", error);
  
    if (error.errors) {
      console.error("Clerk Validation Errors:", JSON.stringify(error.errors, null, 2));
    }
  
    return { success: false, error: "Failed to create student. Please check input values." };
  }
  
}
export const updateStudent = async (studentId, data) => {
  try {
    // Fetch existing student
    const existingStudent = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!existingStudent) return { success: false, error: "Student not found." };

    // Check for duplicate email/username
    if (data.email !== existingStudent.email || data.username !== existingStudent.username) {
      const duplicateStudent = await prisma.student.findFirst({
        where: {
          OR: [{ email: data.email }, { username: data.username }],
          NOT: { id: studentId },
        },
      });

      if (duplicateStudent) {
        return { success: false, error: "Email or username already taken." };
      }
    }

    // Validate classId and gradeId
    const classId = parseInt(data.classId, 10);
    const gradeId = parseInt(data.gradeId, 10);

    const [existingClass, existingGrade] = await Promise.all([
      prisma.class.findUnique({ where: { id: classId } }),
      prisma.grade.findUnique({ where: { id: gradeId } }),
    ]);

    if (!existingClass) return { success: false, error: "Invalid class selected." };
    if (!existingGrade) return { success: false, error: "Invalid grade selected." };

    // Update Clerk User
    await clerkClient.users.updateUser(studentId, {
      emailAddress: [data.email.trim()],
      username: data.username.trim(),
    });

    // Update Prisma Student
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
        gradeId,
      },
    });

    console.log("Student Updated:", updatedStudent);

    // Update subjects only if provided
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

        console.log("Subjects Updated:", data.subjects);
      }
    }

    revalidatePath("/list/students");
    return { success: true, message: "Student updated successfully!" };

  } catch (error) {
    console.error("Error Updating Student:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
};



export const deleteStudent= async (studentId) => {
  try {
    console.log(`Deleting Student ID: ${studentId}...`);

    const existingStudent = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!existingStudent) {
      console.error("Error: Student Not Found.");
      return { success: false, error: "Teacher not found." };
    }
    await prisma.student.update({
      where: { id: studentId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    console.log("student Soft Deleted Successfully.");
    return { success: true, message: "student soft deleted successfully!" };
  } catch (error) {
    console.error("Error Soft Deleting student:", error);
    return { success: false, error: "An unexpted error occurred." };
  }
};
// ...................................................................................................................
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
    revalidateTag("subjects");

    return { success: true, message: "Subject created successfully!" };

  } catch (error) {
    console.error("Error Creating Subject:", error);

    return { success: false, error: "An unexpected error occurred while creating the subject." };
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
    console.error("Error updating subject:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
};

export const deleteSubject = async (id) => {
  try {
    const existingSubject = await prisma.subject.findUnique({
      where:{id}
    })

    if (!existingSubject) {
      return { success: false, error: "Subject not found." };
    }
    await prisma.subject.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    })
    revalidateTag("subjects");
    return { success: true };
  } catch (error) {
    console.error("Error deleting subject:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
};
// .........................................................................................................................
// export async function createSession(sessionName) {
//   try {
//     if (!sessionName || typeof sessionName !== "string" || sessionName.trim() === "") {
//       return { success: false, message: "Invalid session name." };
//     }

//     console.log("🟡 Checking if any session is active...");
//     const existingSession = await prisma.session.findFirst({
//       where: { name: sessionName.trim() },
//     });
//     if (existingSession) {
//       console.error("Session already exists:", sessionName);
//       return { success: false, message: "Session already exists." };
//     }

//     // Use a transaction to ensure atomicity
//     const [_, newSession] = await prisma.$transaction([
//       // Deactivate any existing active session
//       prisma.session.updateMany({
//         where: { isCurrent: true },
//         data: { isCurrent: false },
//       }),
//       // Create a new session
//       prisma.session.create({
//         data: {
//           name: sessionName.trim(),
//           isCurrent: true,
//           isDeleted: false,
//         },
//       }),
//     ]);

//     if (!newSession?.id) {
//       console.error("❌ Failed to create session.");
//       return { success: false, message: "Failed to create a new session." };
//     }

//     console.log(`✅ New session '${sessionName}' created.`);

//     // Auto-create Terms for the session
//     const terms = ["First Term", "Second Term", "Third Term"];
//     for (let term of terms) {
//       await prisma.term.create({
//         data: { name: term, sessionId: newSession.id },
//       });
//       console.log(`✅ ${term} created for session ${sessionName}.`);
//     }

//     // Auto-create predefined grades & classes
//     const grades = ["JSS1", "JSS2", "JSS3", "SSS1", "SSS2", "SSS3"];

//     for (let grade of grades) {
//       const newGrade = await prisma.grade.create({
//         data: { name: grade, sessionId: newSession.id },
//       });
    
//       console.log(`✅ Grade ${grade} created with sessionId ${newSession.id}`);
    
//       let classes = [
//         { name: `${grade} A`, gradeId: newGrade.id },
//         { name: `${grade} B`, gradeId: newGrade.id },
//       ];
    
//       // Add C section for Senior Secondary (SSS)
//       if (grade.startsWith("SSS")) {
//         classes.push({ name: `${grade} C`, gradeId: newGrade.id });
//       }
    
//       await prisma.class.createMany({
//         data: classes,
//       });
    
//       console.log(`✅ Classes created: ${classes.map(cls => cls.name).join(", ")}`);
//     }
    
//     console.log(`✅ New session '${sessionName}' created successfully with all terms, grades, and classes.`);

//     // Trigger promotion handling and move students to the next class
//     const promotionResult = await handlePromotionAndMoveToNewClass();

//     if (!promotionResult.success) {
//       console.log("❌ Error handling promotion:", promotionResult.message);
//     } else {
//       console.log("✅ Promotion and class progression handled successfully.");
//     }

//     return { success: true, message: "Session created successfully!", session: newSession };
//   } catch (error) {
//     console.error("❌ Error creating session:", error);
//     return { success: false, message: "An error occurred while creating the session." };
//   }
// }



// ............................................................................................................................
export async function assignClassTeacher({ classId, teacherId }) {
  console.log("📌 Assigning Teacher:", classId, teacherId);

  try {
    if (!classId || !teacherId) {
      return { success: false, error: "Missing required fields" };
    }

    const classIdNum = Number(classId);

    await prisma.$transaction(async (prisma) => {
      // ✅ Fetch class details including the session
      const existingClass = await prisma.class.findUnique({
        where: { id: classIdNum },
        include: { grade: { include: { session: true } } }, // Include session
      });

      if (!existingClass) {
        throw new Error("Class not found");
      }

      const sessionId = existingClass.grade.sessionId;

      // ✅ Check if the teacher is already assigned in the same session
      const existingAssignment = await prisma.class.findFirst({
        where: {
          grade: {
            sessionId: sessionId, // Ensure it's within the same session
          },
          supervisorId: teacherId,
          NOT: { id: classIdNum }, // Exclude the current class
        },
      });

      if (existingAssignment) {
        throw new Error("This teacher is already assigned to another class in this session.");
      }

      // ✅ Assign teacher to class
      await prisma.class.update({
        where: { id: classIdNum },
        data: { supervisorId: teacherId },
      });
    });

    console.log("✅ Teacher assigned successfully");
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
      return { success: false, error: "❌ This class already has submitted results." };
    }

    // ✅ Validate student results
    const validResults = results.map((result) => {
      if (
        !result.studentId || !result.teacherId || !result.firstAssessment ||
        !result.secondAssessment || !result.examScore
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
        totalScore: parseFloat(result.firstAssessment) + parseFloat(result.secondAssessment) + parseFloat(result.examScore),
      };
    }).filter(Boolean);

    if (validResults.length === 0) {
      return { success: false, error: "❌ Some results are invalid. Fix them before submission." };
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
      return { success: false, error: "❌ Missing required fields: sessionId, termId, classId, or teacherId." };
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
      return { success: false, error: "❌ This class already has submitted records for this term." };
    }

    // ✅ Validate records and include `preferredClass` for JSS3 students
    const validRecords = records
  .map((record, index) => {
    if (!record.studentId || !record.teacherId || !record.remark) {
      console.warn(`⚠️ Skipping invalid record at index ${index}:`, record);
      return null;
    }

    // ✅ Directly use preferredClass if provided (frontend ensures only JSS3 students have it)
    const preferredClass = record.preferredClass?.toUpperCase() || null;

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
      promotion: TermName === "Third Term" ? "PROMOTED" : "REPEAT",
      preferredClass, // ✅ Automatically included if available, else null
    };
  })
  .filter(Boolean);

  
  console.log("💾 Saving Class Records:", JSON.stringify(validRecords, null, 2));
  

    // ✅ Save class records
    await prisma.classRecord.createMany({
      data: validRecords,
      skipDuplicates: true,
    });

    // ✅ Mark students as promoted if it's Third Term
    if (TermName === "Third Term") {
      console.log("🔄 Marking students for promotion...");

      const promotedStudents = validRecords.filter((r) => r.promotion === "PROMOTED");

      console.log(promotedStudents);
    }

    return { success: true, message: "✅ Class records saved successfully!" };
  } catch (error) {
    console.error("❌ Error saving class record:", error.message);
    return { success: false, error: "❌ An unexpected error occurred." };
  }
};































export async function createSession(sessionName) {
  try {
    if (!sessionName || typeof sessionName !== "string" || sessionName.trim() === "") {
      return { success: false, message: "Invalid session name." };
    }

    console.log("🟡 Checking current active session...");
    
    // ✅ Get the last active session before deactivating it
    const lastSession = await prisma.session.findFirst({
      where: { isCurrent: true },
    });

    console.log(lastSession, "📌 Last active session before deactivation");

    // ✅ Ensure no duplicate session name
    const existingSession = await prisma.session.findFirst({
      where: { name: sessionName.trim() },
    });
    if (existingSession) {
      console.error("❌ Session already exists:", sessionName);
      return { success: false, message: "Session already exists." };
    }

    // ✅ Deactivate old session
    if (lastSession) {
      await prisma.session.update({
        where: { id: lastSession.id },
        data: { isCurrent: false },
      });
    }

    // ✅ Create new session
    const newSession = await prisma.session.create({
      data: { name: sessionName.trim(), isCurrent: true, isDeleted: false },
    });

    if (!newSession?.id) {
      console.error("❌ Failed to create session.");
      return { success: false, message: "Failed to create a new session." };
    }

    console.log(`✅ New session '${sessionName}' created.`);

    // ✅ Auto-create Terms
    const terms = ["First Term", "Second Term", "Third Term"];
    await prisma.term.createMany({
      data: terms.map(term => ({ name: term, sessionId: newSession.id })),
    });

    console.log(`✅ Terms created: ${terms.join(", ")}`);

    // ✅ Auto-create Grades and Classes
    const grades = ["JSS1", "JSS2", "JSS3", "SSS1", "SSS2", "SSS3"];

    for (let grade of grades) {
      const newGrade = await prisma.grade.create({
        data: { name: grade, sessionId: newSession.id },
      });

      console.log(`✅ Grade ${grade} created`);

      let classes = [
        { name: `${grade} A`, gradeId: newGrade.id },
        { name: `${grade} B`, gradeId: newGrade.id },
      ];

      if (grade.startsWith("SSS")) {
        classes.push({ name: `${grade} C`, gradeId: newGrade.id });
      }

      await prisma.class.createMany({ data: classes });
      console.log(`✅ Classes created: ${classes.map(cls => cls.name).join(", ")}`);
    }

    console.log(`✅ Session '${sessionName}' fully set up.`);

    // 🔄 Pass `lastSession.id` to promotion function
    if (lastSession?.id) {
      console.log("🔄 Initiating student promotion process...", "from last session", lastSession.id, "to new session", newSession.id);
      const promotionResult = await handlePromotionAndMoveToNewClass(lastSession.id, newSession.id);

      if (!promotionResult.success) {
        console.log("❌ Error handling promotion:", promotionResult.message);
      } else {
        console.log("✅ Promotion and class progression handled successfully.");
      }
    } else {
      console.log("⚠️ No last session found, skipping promotion.");
    }

    return { success: true, message: "Session created successfully!", session: newSession };

  } catch (error) {
    console.error("❌ Error creating session:", error);
    return { success: false, message: "An error occurred while creating the session." };
  }
}


const classPromotionMap = {
  "JSS1A": "JSS2A",
  "JSS1B": "JSS2B",
  "JSS2A": "JSS3A",
  "JSS2B": "JSS3B",
  "JSS3A": null, // No auto-promotion
  "JSS3B": null, // No auto-promotion
  "SSS1A": "SSS2A",
  "SSS1B": "SSS2B",
  "SSS1C": "SSS2C",
  "SSS2A": "SSS3A",
  "SSS2B": "SSS3B",
  "SSS2C": "SSS3C",
};



async function handlePromotionAndMoveToNewClass(lastSessionId, newSessionId) {
  try {
    // Fetch the new session details
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

    if (!newSession) return { success: false, message: "No active session found." };

    // Create class ID mapping with consistent formatting
    const classIdMap = {};
    const gradeIdMap = {};
    newSession.grades.forEach((grade) => {
      grade.classes.forEach((cls) => {
        const formattedClassName = cls.name.replace(/\s+/g, "").toUpperCase();
        classIdMap[formattedClassName] = cls.id;
        gradeIdMap[formattedClassName] = grade.id;
      });
    });

    console.log(classIdMap, "📌 New Session Class ID Map");
    console.log(gradeIdMap, "📌 New Session Grade ID Map");

    // Fetch promoted students
    const promotedStudents = await prisma.classRecord.findMany({
      where: { sessionId: lastSessionId, promotion: "PROMOTED" },
      select: { studentId: true, class: { select: { name: true } }, preferredClass: true },
    });

    if (promotedStudents.length === 0) {
      return { success: false, message: "No promoted students found in the last session." };
    }

    // Prepare student updates
    const updatePromises = promotedStudents.map(async (record) => {
      const formattedCurrentClass = record.class?.name?.replace(/\s+/g, "").toUpperCase();
      console.log(formattedCurrentClass, "🔍 Current Class");


      const studentId = record.studentId;

      // Fetch all results for this student in the last session
      const studentResults = await prisma.result.findMany({
        where: { studentId, sessionId: lastSessionId },
      });
    
      // Find the student's class record for linking
      const studentClassRecord = await prisma.classRecord.findFirst({
        where: { studentId, sessionId: lastSessionId },
      });
    
      // Insert history before updating student class
      await prisma.studentHistory.create({
        data: {
          studentId,
          sessionId: lastSessionId,
          classId: classIdMap[formattedCurrentClass],
          gradeId: gradeIdMap[formattedCurrentClass],
          classRecordId: studentClassRecord?.id || null, // Store remarks, promotion status, position
          results: { connect: studentResults.map((r) => ({ id: r.id })) }, // Link past results
        },
      });
    
      console.log(`📌 Student history recorded for ${studentId}`);
      // Handle JSS3 to SSS1 Promotion (Preferred Class)
      if (formattedCurrentClass.startsWith("JSS3")) {
        const formattedPreferredClass = record.preferredClass?.replace(/\s+/g, "").toUpperCase();
        console.log(`Preferred Class for ${record.studentId}: ${formattedPreferredClass || "None Specified"}`);

        if (!formattedPreferredClass) {
          console.warn(`⚠️ Student ${record.studentId} has no preferred class. Manual selection required.`);
          return null;
        }

        // Ensure lookup uses formatted names
        const preferredClassId = classIdMap[formattedPreferredClass];
        const preferredGradeId = gradeIdMap[formattedPreferredClass];

        if (!preferredClassId || !preferredGradeId) {
          console.error(`❌ Preferred class ${formattedPreferredClass} not found for student ${record.studentId}.`);
          return null;
        }

        console.log(`✅ Assigning JSS3 student ${record.studentId} to ${formattedPreferredClass}`);

        return prisma.student.update({
          where: { id: record.studentId },
          data: {
            classId: preferredClassId,
            sessionId: newSessionId,
            gradeId: preferredGradeId,
          },
        });
      }

      // Normal Promotion for Other Classes
      const nextClassName = classPromotionMap[formattedCurrentClass];
      console.log(nextClassName, "🔄 Next Class");

      if (!nextClassName) {
        console.warn(`⚠️ No promotion mapping found for ${formattedCurrentClass}`);
        return null;
      }

      const newClassId = classIdMap[nextClassName.replace(/\s+/g, "").toUpperCase()];
      const newGradeId = gradeIdMap[nextClassName.replace(/\s+/g, "").toUpperCase()];

      console.log(newClassId, "✅ New Class ID");
      console.log(newGradeId, "✅ New Grade ID");

      if (!newClassId || !newGradeId) {
        console.warn(`⚠️ No class ID or grade ID found for ${nextClassName} in new session`);
        return null;
      }

      console.log("Before Update:", record.studentId, formattedCurrentClass, newClassId, newGradeId);

      return prisma.student.update({
        where: { id: record.studentId },
        data: {
          classId: newClassId,
          sessionId: newSessionId,
          gradeId: newGradeId,
        },
      });
    });

    // Wait for all updates to complete
    const updatedStudents = await Promise.all(updatePromises.filter(Boolean));

    console.log("Updated Students:", updatedStudents);
    console.log("✅ Students successfully moved to new class");
    return { success: true, message: "Students moved to the next class", updatedStudents };
  } catch (error) {
    console.error("❌ Error moving students:", error);
    return { success: false, message: "Error occurred while moving students" };
  }
}
































// export async function fetchSessions() {
//   try {
//     const sessions = await prisma.session.findMany({
//       orderBy: { id: "desc" }, // Get the most recent session first
//     });
//     return sessions;
//   } catch (error) {
//     console.error("❌ Error fetching sessions:", error);
//     return [];
//   }
// }






















export async function fetchTerms(sessionId) {
  if (!sessionId || isNaN(parseInt(sessionId, 10))) {
    console.warn("⚠️ sessionId is missing or invalid in fetchTerms()");
    return [];
  }

  try {
    return await prisma.term.findMany({
      where: { sessionId: parseInt(sessionId, 10) },
      select: { id: true, name: true },
    });
  } catch (error) {
    console.error("❌ Error fetching terms:", error);
    return [];
  }
}


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
        sessionId: parseInt(sessionId, 10), // ✅ Check session through grade relation
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
    console.warn("⚠️ sessionId, gradeId, or classId is missing in fetchStudents()");
    return [];
  }

  return await prisma.student.findMany({
    where: {
      sessionId: parseInt(sessionId, 10),
      gradeId: parseInt(gradeId, 10),
      classId: parseInt(classId, 10),
    },
    select: {
      id: true,
      name: true,
      username: true,
      surname: true,
      class: { select: { name: true } }, // ✅ Fetch class name
      session: { select: { name: true } }, // ✅ Fetch session name
      term: { select: { name: true } },
      subjects: { 
        select: { subject: { select: { name: true } } } // ✅ Fetch subjects
      }
    },
  });
}











// GET ALL THE RESULT 
export async function allResults() {
  try {
    const results = await prisma.result.findMany({
      include: {
        student: {
          select: { id: true, name: true, surname: true, grade: { select: { id: true, name: true } } }
        },
        subject: { select: { id: true, name: true } },
        term: { select: { id: true, name: true } },
      },
    });

    return { success: true, data: results };
  } catch (error) {
    console.error('❌ Error Fetching Results:', error);
    return { success: false, error: 'Failed to fetch results' };
  }
}

// upload result







export async function fetchSubjects() {
  return await prisma.subject.findMany({
    select: { id: true, name: true },
  });
}



