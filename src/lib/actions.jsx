"use server";
import { clerkClient } from "@clerk/clerk-sdk-node"; // ✅ Correct Clerk import
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const createTeacher = async (data) => {
  console.log("🟡 Creating user in Clerk...");

  try {
    // ✅ Step 1: Check if Email or Username Already Exists in Clerk
    const existingUsers = await clerkClient.users.getUserList({
      emailAddress: [data.email],
      limit: 1,
    });

    if (existingUsers.length > 0) {
      console.error("❌ Error: Email already registered in Clerk.");
      return { success: false, error: "A user with this email already exists." };
    }

    // ✅ Step 2: Create a User in Clerk
    const teacher = await clerkClient.users.createUser({
      username: data.username,
      emailAddress: [data.email],
      password: data.password, // ✅ Ensure password meets security standards
      publicMetadata: { role: "teacher" }, // ✅ Store user role in Clerk
    });

    console.log("🟢 Clerk User Created:", teacher);

    // ✅ Step 3: Store Teacher in Prisma using Clerk's userId
    const formattedSex = data.sex.toUpperCase(); // Ensure ENUM format

    const newTeacher = await prisma.teacher.create({
      data: {
        id: teacher.id, // ✅ Use Clerk's userId
        surname: data.surname,
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password, // Consider storing only in Clerk
        sex: formattedSex,
        address: data.address || null,
      },
    });

    console.log("✅ Teacher Created in Prisma:", newTeacher);

    // ✅ Step 4: Assign Subjects (If provided)
    if (Array.isArray(data.subjects) && data.subjects.length > 0) {
      console.log("🟡 Assigning Subjects:", data.subjects);

      const subjectData = data.subjects.map((subjectId) => ({
        teacherId: newTeacher.id,
        subjectId: parseInt(subjectId, 10),
      }));

      await prisma.teacherSubject.createMany({
        data: subjectData,
        skipDuplicates: true,
      });

      console.log("✅ Subjects Assigned:", subjectData);
    } else {
      console.warn("⚠️ No subjects provided.");
    }

    // ✅ Refresh UI
    revalidatePath("/list/teachers");
    return { success: true, message: "Teacher added successfully!" };

  } catch (error) {
    console.error("❌ Error Creating Teacher:", error);

    // ✅ Handle Clerk API errors
    if (error.status === 422) {
      return { success: false, error: "Invalid user data. Check email, password, and username." };
    }

    return { success: false, error: "An unexpected error occurred." };
  }
};
// / UPDATE TEACHER
export const updateTeacher = async (teacherId, data) => {
  console.log("🟢 Received Data for Update:", { teacherId, ...data });

  try {
    // ✅ Convert sex to match ENUM case
    const formattedSex = data.sex.toUpperCase();

    // ✅ Step 1: Check if Teacher Exists
    console.log("🟡 Checking if teacher exists...");
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!existingTeacher) {
      console.error("❌ Error: Teacher Not Found.");
      return { success: false, error: "Teacher not found." };
    }

    // ✅ Step 2: Check for Duplicate Email or Username (Excluding Current Teacher)
    console.log("🟡 Checking for duplicate email/username...");
    if (data.email !== existingTeacher.email || data.username !== existingTeacher.username) {
      const duplicateTeacher = await prisma.teacher.findFirst({
        where: {
          OR: [{ email: data.email }, { username: data.username }],
          NOT: { id: teacherId }, // ✅ Exclude the current teacher from check
        },
      });

      if (duplicateTeacher) {
        if (duplicateTeacher.email === data.email) {
          console.error("❌ Error: Duplicate Email Detected.");
          return { success: false, error: "A teacher with this email already exists." };
        }
        if (duplicateTeacher.username === data.username) {
          console.error("❌ Error: Duplicate Username Detected.");
          return { success: false, error: "A teacher with this username already exists." };
        }
      }
    }

    // ✅ Step 3: Update Teacher Details in Clerk
    console.log("🟡 Syncing with Clerk...");
    await clerkClient.users.updateUser(teacherId, {
      emailAddress: [data.email],
      username: data.username,
    });

    // ✅ Step 4: Update Teacher Details in Prisma
    console.log("🟡 Updating teacher details in Prisma...");
    const updatedTeacher = await prisma.teacher.update({
      where: { id: teacherId },
      data: {
        surname: data.surname,
        name: data.name,
        username: data.username,
        email: data.email,
        sex: formattedSex,
        address: data.address || null,
      },
    });

    console.log("✅ Teacher Updated:", updatedTeacher);

    // ✅ Step 5: Update Teacher's Subjects
    if (Array.isArray(data.subjects)) {
      console.log("🟡 Updating teacher subjects...");

      // ✅ Remove old subjects
      await prisma.teacherSubject.deleteMany({
        where: { teacherId },
      });

      if (data.subjects.length > 0) {
        // ✅ Add new subjects
        const subjectData = data.subjects.map((subjectId) => ({
          teacherId,
          subjectId: parseInt(subjectId, 10),
        }));

        await prisma.teacherSubject.createMany({
          data: subjectData,
          skipDuplicates: true,
        });

        console.log("✅ Subjects Updated:", subjectData);
      } else {
        console.warn("⚠️ No subjects provided.");
      }
    }

    // ✅ Refresh UI
    revalidatePath("/list/teachers");
    return { success: true, message: "Teacher updated successfully!" };

  } catch (error) {
    console.error("❌ Error Updating Teacher:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
};
//Soft Delete Function
export const deleteTeacher = async (teacherId) => {
  try {
    console.log(`🟡 Soft Deleting Teacher ID: ${teacherId}...`);

    // ✅ Step 1: Check if Teacher Exists
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!existingTeacher) {
      console.error("❌ Error: Teacher Not Found.");
      return { success: false, error: "Teacher not found." };
    }

    // ✅ Step 2: Update `isDeleted` to `true` and set `deletedAt`
    await prisma.teacher.update({
      where: { id: teacherId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    console.log("✅ Teacher Soft Deleted Successfully.");
    return { success: true, message: "Teacher soft deleted successfully!" };
  } catch (error) {
    console.error("❌ Error Soft Deleting Teacher:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
};



export async function createStudent(data) {
  try {
    console.log("🟡 Checking if student exists in Clerk and Prisma...");

    // Check if username exists in Prisma
    const existingStudent = await prisma.student.findUnique({
      where: { username: data.username },
    });

    if (existingStudent) {
      return { success: false, error: "Username is already taken." };
    }

    // Check if email exists in Clerk
    const existingUsers = await clerkClient.users.getUserList({
      emailAddress: [data.email],
      limit: 1,
    });

    if (existingUsers.length > 0) {
      return { success: false, error: "Email already registered." };
    }

    console.log("🟢 Creating Student in Clerk...");

    // Create user in Clerk for authentication
    const studentUser = await clerkClient.users.createUser({
      username: data.username,
      emailAddress: [data.email],
      password: data.password, // Students need passwords to log in
      publicMetadata: { role: "student" }, // Assign student role
    });

    console.log("🟢 Creating Student in Prisma...");

    // Convert IDs to integers
    const sessionId = parseInt(data.sessionId, 10);
    const gradeId = parseInt(data.gradeId, 10);
    const classId = parseInt(data.classId, 10);

    // Create student in Prisma with Clerk's userId
    const newStudent = await prisma.student.create({
      data: {
        id: studentUser.id, // Use Clerk's user ID
        surname: data.surname,
        name: data.name,
        username: data.username,
        email: data.email,
        sex: data.sex.toUpperCase(),
        img: data.img || null,
        address: data.address || null,
        sessionId,
        gradeId,
        classId,
        parentId: data.parentId,
      },
    });

    console.log("✅ Student Created:", newStudent);

    // Refresh UI
    revalidatePath("/list/students");
    return { success: true, message: "Student created successfully!" };
  } catch (error) {
    console.error("❌ Error Creating Student:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}






















// CREATE SUBJECT WITH TEACHER ASSIGNMENT
export const createSubject = async (data) => {
  try {
    // Step 1: Create Subject
    const newSubject = await prisma.subject.create({
      data: {
        name: data.name,
      },
    });

    console.log("Created Subject:", newSubject);

    // Step 2: Assign Teacher to Subject (if provided)
    if (data.teacherId) {
      await prisma.teacherSubject.create({
        data: {
          teacherId: data.teacherId,
          subjectId: newSubject.id,
        },
      });

      console.log(`✅ Assigned Teacher ${data.teacherId} to Subject ${newSubject.id}`);
    }

    revalidatePath("/list/subjects"); // Refresh UI
    return { success: true };
  } catch (error) {
    if (error.code === "P2002") {
      return { success: false, error: "Subject already exists." };
    }
    console.error("Error creating subject:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
};


// UPDATE SUBJECT
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

// DELETE SUBJECT

// SOFT DELETE SUBJECT


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



