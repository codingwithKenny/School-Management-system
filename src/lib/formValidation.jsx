const { z } = require("zod");


const subjectSchema = z.object({
  id: z.number().optional(),
  name: z
    .string()
    .min(3, { message: "Subject must be at least 3 characters!" }),
});


module.exports = { subjectSchema };

const teacherSchema = z.object({
  id: z.string().optional(), // Optional for new teachers
  surname: z.string().min(2, { message: "Surname must be at least 5 characters!" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters!" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters!" }),
  email: z.string().email({ message: "Invalid email format!" }),
  password: z.string().min(9, { message: "Password must be at least 9 characters!" }),
  sex: z.enum(["Male", "Female"]),
  address: z.string().optional(),
  subjects: z
    .array(z.number()) // ✅ Validate subjects as an array of subject IDs
    .nonempty({ message: "At least one subject must be selected!" }),
});

module.exports = { teacherSchema };


const studentSchema = z.object({
  surname: z.string().min(2, "Surname is required"),
  name: z.string().min(2, "Name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  sex: z.enum(["male", "female"], { message: "Select your gender" }),
  img: z.instanceof(File).optional(),
  address: z.string().optional(),
  sessionId: z.string().min(1, "Session is required"),
  gradeId: z.string().min(1, "Grade is required"),
  classId: z.string().min(1, "Class is required"),
  parentId: z.string().min(1, "Parent ID is required"),
});

module.exports = { studentSchema };


