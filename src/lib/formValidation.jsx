const { z } = require("zod");

const subjectSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(3, { message: "Subject must be at least 3 characters!" }),
});

const teacherSchema = z.object({
  id: z.string().optional(), // Optional for new teachers
  surname: z.string().min(5, { message: "Surname must be at least 5 characters!" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters!" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters!" }),
  email: z.string().email({ message: "Invalid email format!" }),
  img: z.string().optional(),
  phone: z.string().regex(/^\d{7,15}$/, "Enter a valid phone number (7-15 digits)") .optional(),
  password: z.string().min(9, { message: "Password must be at least 9 characters!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Select your gender" }),
  address: z.string().optional(),
  subjects: z.array(z.union([z.string(), z.number()])).min(1, { message: "At least one subject must be selected" }).transform((arr) => arr.map(Number)),
});


const studentSchema = z.object({
  id: z.string().optional(),
  surname: z.string().min(2, { message: "Surname is required" }),
  firstname: z.string().min(2, { message: "Name is required" }),
  admission: z.string().min(3, { message: "Admission number is required" }),
  // email: z
  // .string()
  // .email({ message: "Invalid email address" })
  // .optional()
  // .refine(val => val === "" || val === undefined || z.string().email().safeParse(val).success, {
  //   message: "Invalid email address",
  // }),

  sex: z.enum(["MALE", "FEMALE"], { message: "Select your gender" }),
  img: z.string().optional(),
  phone: z.string().regex(/^\d{7,15}$/, "Enter a valid phone number (7-15 digits)").optional(),
  address: z.string().optional(),
  sessionId: z.union([z.string(), z.number()]).transform((val) => Number(val)),
  termId: z.union([z.string(), z.number()]).transform((val) => Number(val)),
  gradeId: z.union([z.string(), z.number()]).transform((val) => Number(val)),
  classId: z.union([z.string(), z.number()]).transform((val) => Number(val)),
  paymentStatus: z.enum(["PAID", "NOT_PAID", "PARTIALLY_PAID"], { message: "Select payment status" }),
  subjects: z.array(z.union([z.string(), z.number()])).min(1, { message: "At least one subject must be selected" }).transform((arr) => arr.map(Number)),
});



const recordSchema = z.object({
  studentId: z.string().nonempty("Student ID is required"),
  teacherId: z.string().nonempty("Teacher ID is required"),
  termId: z.number().min(1, "Term is required"),
  sessionId: z.number().min(1, "Session is required"),
  classId: z.number().min(1, "Class is required"),
  remark: z.string().trim().min(1, "Remark cannot be empty"),
  position: z.number().min(1, "Position must be greater than 0"),
  promotion: z.string().optional(),
});

// ✅ Export all schemas in a single object
module.exports = { studentSchema, teacherSchema, subjectSchema,recordSchema };
