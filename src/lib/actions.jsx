"use server";
import { revalidatePath } from "next/cache";
import prisma from "./prisma";

// CREATE SUBJECT
export const createSubject = async (data) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
      },
    });
    console.log(data)
    revalidatePath("/list/subjects");
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
export const deleteSubject = async (id) => {
  try {
    console.log("Attempting to soft delete subject with ID:", id);

    const updatedSubject = await prisma.subject.update({
      where: { id },
      data: { deletedAt: new Date() }, // Soft delete by setting timestamp
    });

    console.log("Soft delete successful:", updatedSubject);
    
    revalidatePath("/list/subjects"); // Ensures UI updates
    return { success: true };
  } catch (error) {
    console.error("Error deleting subject:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
};


// upload result

export const createResult = async (data) => {
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

    if (existingResult) {
      return { success: false, error: "Result for this student already exists!" };
    }

    // If no existing result, create a new entry
    await prisma.result.create({
      data: {
        studentId: data.studentId,
        teacherId: data.teacherId,
        subjectId: data.subjectId,
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


