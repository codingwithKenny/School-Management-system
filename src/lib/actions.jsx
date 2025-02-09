"use server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";



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
    
    const [existingSession, existingGrade, existingClass] = await Promise.all([
      prisma.session.findUnique({ where: { id: sessionId } }),
      prisma.grade.findUnique({ where: { id: gradeId } }),
      prisma.class.findUnique({ where: { id: classId } }),
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
    const existingStudent = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!existingStudent) {
      console.error("Error: Student Not Found.");
      return { success: false, error: "Student not found." };
    }
    if (data.email !== existingStudent.email || data.username !== existingStudent.username) {
      const duplicateStudent= await prisma.student.findFirst({
        where: {
          OR: [{ email: data.email }, { username: data.username }],
          NOT: { id: studentId },
        },
      });

      if (duplicateStudent) {
        if (duplicateStudent.email === data.email) {
          return { success: false, error: "A teacher with this email already exists." };
        }
        if (duplicateStudent.username === data.username) {
          console.error("Error: Duplicate Username Detected.");
          return { success: false, error: "A teacher with this username already exists." };
        }
      }
    }
    await clerkClient.users.updateUser(studentId, {
      emailAddress: [data.email],
      username: data.username,
    });

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        surname: data.surname,
        phone: data.phone,
        name: data.name,
        username: data.username,
        email: data.email,
        sex: data.sex,
        address: data.address || null,
      },
    });

    console.log("Teacher Updated:", updatedStudent);

    if (Array.isArray(data.subjects)) {
      console.log("Updating teacher subjects...");

      await prisma.studentSubject.deleteMany({
        where: { studentId },
      });

      if (data.subjects.length > 0) {
        const subjectData = data.subjects.map((subjectId) => ({
          studentId,
          subjectId: parseInt(subjectId, 10),
        }));

        await prisma.studentSubject.createMany({
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
export async function createSession(sessionName) {
  try {
    if (!sessionName || typeof sessionName !== "string" || sessionName.trim() === "") {
      return { success: false, message: "Invalid session name." };
    }

    console.log("🟡 Checking if any session is active...");
    const existingSession = await prisma.session.findFirst({
      where: { name: sessionName.trim() },
    });
    if (existingSession) {
      console.error("Session already exists:", sessionName);
      return { success: false, message: "Session already exists." };
    }

    // Create session and deactivate previous ones
    const [_, newSession] = await prisma.$transaction([
      // Deactivate any existing active session
      prisma.session.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false },
      }),
      // Create a new session
      prisma.session.create({
        data: {
          name: sessionName.trim(),
          isCurrent: true,
          isDeleted: false,
        },
      }),
    ]);

    if (!newSession?.id) {
      console.error("❌ Failed to create session.");
      return { success: false, message: "Failed to create a new session." };
    }

    console.log(`✅ New session '${sessionName}' created.`);

    // ✅ Auto-create Terms for the session
    const terms = ["First Term", "Second Term", "Third Term"];
    for (let term of terms) {
      await prisma.term.create({
        data: { name: term, sessionId: newSession.id },
      });
      console.log(`✅ ${term} created for session ${sessionName}.`);
    }

    // ✅ Auto-create predefined grades & classes
    const grades = ["JSS1", "JSS2", "JSS3", "SSS1", "SSS2", "SSS3"];
    for (let grade of grades) {
      const newGrade = await prisma.grade.create({
        data: { name: grade, sessionId: newSession.id },
      });

      console.log(`✅ Grade ${grade} created with sessionId ${newSession.id}`);

      await prisma.class.createMany({
        data: [
          { name: `${grade} A`, gradeId: newGrade.id },
          { name: `${grade} B`, gradeId: newGrade.id },
        ],
      });

      console.log(`✅ Classes ${grade} A & ${grade} B created.`);
    }

    console.log(`✅ New session '${sessionName}' created successfully with all terms, grades, and classes.`);
    return { success: true, message: "Session created successfully!", session: newSession };
  } catch (error) {
    console.error("❌ Error creating session:", error);
    return { success: false, message: "An error occurred while creating the session." };
  }
}

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
  console.log("🚀 Checking submitted results:", JSON.stringify(results, null, 2));

  try {
    // ✅ Ensure `results` is an array and not empty
    if (!Array.isArray(results) || results.length === 0) {
      console.error("❌ No results provided or invalid format:", JSON.stringify(results, null, 2));
      return { success: false, error: "❌ No results provided or invalid format." };
    }

    // ✅ Extract common fields for batch checking
    const { sessionId, termId, gradeId, classId, subjectId } = results[0];

    if (!sessionId || !termId || !gradeId || !classId || !subjectId) {
      console.error("❌ Missing required fields:", JSON.stringify(results, null, 2));
      return { success: false, error: "❌ Missing required fields." };
    }

    // ✅ Check if results already exist for this class, term, and subject
    const existingClassResults = await prisma.result.findMany({
      where: { sessionId, termId, gradeId, classId, subjectId },
      select: { studentId: true },
    });

    const existingStudentIds = new Set(existingClassResults.map((r) => r.studentId));

    // ✅ Validate and filter only new results (🚨 Removing `gradePerformance`)
    const validResults = results
      .filter((result) => {
        return (
          result.studentId &&
          result.teacherId &&
          result.subjectId &&
          result.termId &&
          result.sessionId &&
          result.gradeId &&
          result.classId &&
          typeof result.firstAssessment === "number" &&
          result.firstAssessment >= 0 &&
          typeof result.secondAssessment === "number" &&
          result.secondAssessment >= 0 &&
          typeof result.examScore === "number" &&
          result.examScore >= 0 &&
          !existingStudentIds.has(result.studentId) // Exclude students who already have a result
        );
      })
      .map(({ gradePerformance, ...result }) => ({
        studentId: result.studentId,
        teacherId: result.teacherId,
        subjectId: result.subjectId,
        termId: result.termId,
        sessionId: result.sessionId,
        gradeId: result.gradeId,
        classId: result.classId,
        firstAssessment: result.firstAssessment,
        secondAssessment: result.secondAssessment,
        examScore: result.examScore,
        totalScore: result.totalScore,
        status: "PENDING", // ✅ Ensure this field exists to match Prisma model
      }));

    // ✅ If no valid results, return error before calling Prisma
    if (validResults.length === 0) {
      console.error("❌ No valid results to insert:", JSON.stringify(results, null, 2));
      return { success: false, error: "❌ No new results to insert. All students already have results." };
    }

    console.log("✅ Valid Results to Save:", JSON.stringify(validResults, null, 2));

    // ✅ Insert results in batch using `createMany`
    const insertedResults = await prisma.result.createMany({ data: validResults });

    console.log("✅ Results successfully inserted!", insertedResults);
    return { success: true };
  } catch (error) {
    console.error("❌ Error creating results:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
};












































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
      surname:true,
      class: { select: { name: true } }, // ✅ Fetch class name for display
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



