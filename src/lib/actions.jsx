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
      return surname + Math.floor(1000 + Math.random() * 9000) + "!"; 
    };
    
        const student = await clerkClient.users.createUser({
      username: data.username.trim(), 
      emailAddress: [data.email.trim()], 
      password: generatePassword(data.surname), 
      publicMetadata: { role: "student" }, 
    });
  
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
    console.log("subject successfully deleted")
    return { success: true };
  } catch (error) {
    console.error("Error deleting subject:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
};
// .........................................................................................................................







export const fetchSubjectById = async (subjectId) => {
  try {
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        teachers: {
          include: {
            teacher: true, // ✅ Fetch actual teacher details
          },
        },
      },
    });

    if (!subject) {
      return { success: false, error: "Subject not found." };
    }

    return { success: true, data: subject };
  } catch (error) {
    console.error("Error fetching subject:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
};









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

export const createResult = async (data) => {
  console.log(data,'check data')
  try {
    // Check if result already exists
    const existingResult = await prisma.result.findFirst({
      where: {
        studentId: data.studentId,
        teacherId: data.teacherId,
        subjectId: data.subjectId,
        termId: data.termId,
      },
    });
    console.log(existingResult,'available');

    if (existingResult) {
      return { success: false, error: "Result for this student already exists!" };
    }

    // If no existing result, create a new entry
    await prisma.result.create({
      data: {
        studentId: data.studentId,
        teacherId: data.teacherId,
        subjectId: data.subjectId,
        sessionId: data.sessionId,
        termId: data.termId,
        firstAssessment: parseFloat(data.firstAssessment) || 0,
        secondAssessment: parseFloat(data.secondAssessment) || 0,
        examScore: parseFloat(data.examScore) || 0,
        totalScore: 
          (parseFloat(data.firstAssessment) || 0) + 
          (parseFloat(data.secondAssessment) || 0) + 
          (parseFloat(data.examScore) || 0),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating result:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
};





export async function fetchSubjects() {
  return await prisma.subject.findMany({
    select: { id: true, name: true },
  });
}



