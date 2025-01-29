"use server";

import { revalidatePath } from "next/cache";
import prisma from "./prisma";

export const createSubjectData = async (data) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name, // Insert subject name
      },
    });
    revalidatePath("/list/subjects");
    return { success: true }; 
  } catch (error) {
    // Detect duplicate subject creation
    if (error.code === "P2002") {
      // Prisma error
      return { success: false, error: "Subject already exists." };
    }
    console.error("Error creating subject:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
};
