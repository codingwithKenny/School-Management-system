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
    
      let classes = [
        { name: `${grade} A`, gradeId: newGrade.id },
        { name: `${grade} B`, gradeId: newGrade.id },
      ];
    
      // ✅ Add C section for Senior Secondary (SSS)
      if (grade.startsWith("SSS")) {
        classes.push({ name: `${grade} C`, gradeId: newGrade.id });
      }
    
      await prisma.class.createMany({
        data: classes,
      });
    
      console.log(`✅ Classes created: ${classes.map(cls => cls.name).join(", ")}`);
    }
    

    console.log(`✅ New session '${sessionName}' created successfully with all terms, grades, and classes.`);
    return { success: true, message: "Session created successfully!", session: newSession };
  } catch (error) {
    console.error("❌ Error creating session:", error);
    return { success: false, message: "An error occurred while creating the session." };
  }
}


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

    // Create a class ID mapping for the new session
    const classIdMap = {};
    const gradeIdMap = {};
    newSession.grades.forEach((grade) => {
      grade.classes.forEach((cls) => {
        classIdMap[cls.name.toUpperCase()] = cls.id;
        gradeIdMap[cls.name.toUpperCase()] = grade.id; // Map class names to grade IDs
      });
    });

    console.log(classIdMap, "📌 New Session Class ID Map");
    console.log(gradeIdMap, "📌 New Session Grade ID Map");

    // Fetch promoted students from the just-concluded session
    const promotedStudents = await prisma.classRecord.findMany({
      where: {
        sessionId: lastSessionId, // Only get students from the just-concluded session
        promotion: "PROMOTED",
      },
      select: {
        studentId: true,
        class: { select: { name: true } }, // Fetch class name
      },
    });

    if (promotedStudents.length === 0) {
      return { success: false, message: "No promoted students found in the last session." };
    }

    // Prepare student updates
    const updatePromises = promotedStudents.map(async (record) => {
      const currentClassName = record.class?.name?.trim().toUpperCase();
      console.log(currentClassName, "🔍 Current Class");

      const nextClassName = classPromotionMap[currentClassName]; // Get next class
      console.log(nextClassName, "🔄 Next Class");

      if (nextClassName === null) {
        console.log(`⏳ JSS3 students need to choose a new class manually: ${record.studentId}`);
        return null; // Skip JSS3 students
      }

      if (!nextClassName) {
        console.warn(`⚠️ No promotion mapping found for ${currentClassName}`);
        return null;
      }

      const newClassId = classIdMap[nextClassName]; // Get new class ID
      const newGradeId = gradeIdMap[nextClassName]; // Get new grade ID

      console.log(newClassId, "✅ New Class ID");
      console.log(newGradeId, "✅ New Grade ID");

      if (!newClassId || !newGradeId) {
        console.warn(`⚠️ No class ID or grade ID found for ${nextClassName} in new session`);
        return null;
      }

      console.log("Before Update:", record.studentId, currentClassName, newClassId, newGradeId);

      // Update the student record in the database
      const updatedStudent = await prisma.student.update({
        where: { id: record.studentId },
        data: {
          classId: newClassId,
          sessionId: newSessionId,
          gradeId: newGradeId,
        },
      });
      console.log("Updated Student:", updatedStudent);
      
      // Return updated student after update
      return updatedStudent;
    });

    // Wait for all updates to complete
    const updatedStudents = await Promise.all(updatePromises.filter(Boolean));

    console.log("Updated Students:", updatedStudents); // Log the updated student records

    console.log("✅ Students successfully moved to new class");
    return { success: true, message: "Students moved to the next class", updatedStudents };

  } catch (error) {
    console.error("❌ Error moving students:", error);
    return { success: false, message: "Error occurred while moving students" };
  }
}





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

    // Create a class ID mapping for the new session
    const classIdMap = {};
    const gradeIdMap = {};
    newSession.grades.forEach((grade) => {
      grade.classes.forEach((cls) => {
        classIdMap[cls.name.toUpperCase()] = cls.id;
        gradeIdMap[cls.name.toUpperCase()] = grade.id; // Map class names to grade IDs
      });
    });

    console.log(classIdMap, "📌 New Session Class ID Map");
    console.log(gradeIdMap, "📌 New Session Grade ID Map");

    // Fetch promoted students from the just-concluded session
    const promotedStudents = await prisma.classRecord.findMany({
      where: {
        sessionId: lastSessionId, // Only get students from the just-concluded session
        promotion: "PROMOTED",
      },
      select: {
        studentId: true,
        class: { select: { name: true } }, // Fetch class name
        student: { select: { preferredClass: true } }, // Assuming 'preferredClass' field exists
      },
    });
      console.log(promotedStudents, "checkingggggggggggg")
    if (promotedStudents.length === 0) {
      return { success: false, message: "No promoted students found in the last session." };
    }

    // Prepare student updates
    const updatePromises = promotedStudents.map(async (record) => {
      const currentClassName = record.class?.name?.trim().toUpperCase();
      console.log(currentClassName, "🔍 Current Class");

      const nextClassName = classPromotionMap[currentClassName]; // Get next class
      console.log(nextClassName, "🔄 Next Class");
      console.log(currentClassName, "chechingggggggggggggg1")
      console.log(nextClassName, "chechingggggggggggggg2222222222")

      // Handle automatic progression (e.g., JSS1 → JSS2)
      if (nextClassName) {
        const newClassId = classIdMap[nextClassName]; // Get new class ID
        const newGradeId = gradeIdMap[nextClassName]; // Get new grade ID

        if (!newClassId || !newGradeId) {
          console.warn(`⚠️ No class ID or grade ID found for ${nextClassName} in new session`);
          return null;
        }

        // Update student for automatic class progression
        console.log("Before Update (Automatic Promotion):", record.studentId, currentClassName, newClassId, newGradeId);
        const updatedStudent = await prisma.student.update({
          where: { id: record.studentId },
          data: {
            classId: newClassId,
            sessionId: newSessionId,
            gradeId: newGradeId,
          },
        });
        console.log("Updated Student (Automatic Promotion):", updatedStudent);
        return updatedStudent;
      }

      // Handle JSS3 to SSS1 with preferred class
      if (currentClassName.startsWith("JSS3")) {
        const preferredClass = record.student?.preferredClass?.toUpperCase() || "SSS1 A"; // Default to SSS1 A if no preference
        console.log(`Preferred Class: ${preferredClass}`);

        // Check if preferred class exists in new session
        const preferredClassId = classIdMap[preferredClass];
        const preferredGradeId = gradeIdMap[preferredClass];

        if (preferredClassId && preferredGradeId) {
          // Assign student to preferred class
          console.log(`Assigning student ${record.studentId} to ${preferredClass}`);
          const updatedStudent = await prisma.student.update({
            where: { id: record.studentId },
            data: {
              classId: preferredClassId,
              sessionId: newSessionId,
              gradeId: preferredGradeId,
            },
          });
          console.log("Updated Student (Preferred Class):", updatedStudent);
          return updatedStudent;
        } else {
          console.warn(`⚠️ Preferred class ${preferredClass} not found in new session for student ${record.studentId}`);
        }
      }

      // Fallback if no promotion rules match
      console.warn(`⚠️ No valid promotion mapping for ${currentClassName}`);
      return null;
    });

    // Wait for all updates to complete
    const updatedStudents = await Promise.all(updatePromises.filter(Boolean));

    console.log("Updated Students:", updatedStudents); // Log the updated student records

    console.log("✅ Students successfully moved to new class");
    return { success: true, message: "Students moved to the next class", updatedStudents };

  } catch (error) {
    console.error("❌ Error moving students:", error);
    return { success: false, message: "Error occurred while moving students" };
  }
}