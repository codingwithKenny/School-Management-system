




// import FormModal from "@/components/FormModal";
// import Pagination from "@/components/Pagination";
// import Table from "@/components/Table";
// import TableSearch from "@/components/TableSearch";
// import prisma from "@/lib/prisma";
// import { ITEM_PER_PAGE } from "@/lib/settings";
// import Link from "next/link";
// import { currentUserId, role } from "@/lib/authUtils";
// import TeacherResultActions from "@/components/TeacherResultActions";

// const resultListPage = async ({ searchParams }) => {

//   if (!role || !currentUserId) {
//     throw new Error("Unauthorized access: missing role or user ID.");
//   }
//   const params = searchParams || {};
//   const page = params.page || 1;
//   const p = parseInt(page, 10);

//   const students = await prisma.student.findMany({
//     where: {
//       subjects: {
//         some: {
//           subject: {
//             teacherId: currentUserId, // Fetch students who take subjects taught by the teacher
//           },
//         },
//       },
//     },
//     select: {
//       id: true,
//       name: true,
//       surname: true,
//       grade: { select: { name: true } },
//     },
//   });
  

//   // Define role-based filtering
//   let query = {};
//   switch (role) {
//     case "admin":
//       break; // Admin sees all results
//     case "teacher":
//       query.teacherId = currentUserId; // Teachers see only their students' results
//       break;
//     case "student":
//       query.studentId = currentUserId; // Students see only their own results
//       break;
//     default:
//       throw new Error("Unauthorized access: invalid role.");
//   }
//   // Fetch data based on role
//   const [dataRes, count] = await prisma.$transaction([
//     prisma.result.findMany({
//       where: query,
//       include: {
//         student: {
//           select: {
//             name: true,
//             surname: true,
//             grade: { select: { name: true } },
//           },
//         },
//         subject: { select: { name: true } },
//         teacher: { select: { id: true, surname: true, name: true } },
//         term: { select: { name: true, session: { select: { name: true } } } },
//       },
//       take: ITEM_PER_PAGE,
//       skip: (p - 1) * ITEM_PER_PAGE,
//     }),
//     prisma.result.count({ where: query }),
//   ]);

//   // Map and sanitize data
//   const data = dataRes.map((item) => ({
//     id: item.id,
//     subject: item.subject?.name ?? "Unknown Subject",
//     student: item.student
//       ? `${item.student.surname ?? "Unknown"} ${item.student.name ?? "Unknown"}`
//       : "Unknown Student",
//     score: item.totalScore || "N/A",
//     assessmentScore: item.firstAssessment || "N/A",
//     examScore: item.examScore || "N/A",
//     teacher: item.teacher
//       ? `${item.teacher.surname ?? "Unknown"} ${item.teacher.name ?? "Unknown"}`
//       : "No Teacher Assigned",
//     term: `${item.term?.name ?? "Unknown Term"} (${
//       item.term?.session?.name ?? "Unknown Session"
//     })`,
//     date: item.createdAt
//       ? new Date(item.createdAt).toLocaleDateString()
//       : "Unknown Date",
//   }));

//   console.log("Mapped Data:", data);

//   // Define role-based table columns
//   const adminColumns = [
//     { header: "Subject", accessor: "subject" },
//     { header: "Student", accessor: "student" },
//     { header: "1st CA", accessor: "assessmentScore1" },
//     { header: "2nd CA", accessor: "assessmentScore2" },
//     { header: "Exam", accessor: "examScore" },
//     { header: "Teacher", accessor: "teacher" },
//     { header: "Term", accessor: "term" },
//     { header: "Date", accessor: "date" },
//     { header: "Actions", accessor: "actions" },
//   ];

//   const teacherColumns = [
//     { header: "Subject", accessor: "subject" },
//     { header: "Student", accessor: "student" },
//     { header: "Grade", accessor: "grade" },
//   ];

//   const studentColumns = [
//     { header: "Subject", accessor: "subject" },
//     { header: "Score", accessor: "score" },
//     { header: "CA", accessor: "assessmentScore" },
//     { header: "Exam", accessor: "examScore" },
//     { header: "Term", accessor: "term" },
//     { header: "Date", accessor: "date" },
//   ];

//   // Render rows dynamically
//   const renderRow = (result) => (
//     <tr
//       key={result.id}
//       className="text-xs border-b border-grey-200 even:bg-slate-50 hover:bg-[#F1F0FF]"
//     >
//       {role === "student" && (
//         <>
//           <td>{result.score}</td>
//           <td>{result.assessmentScore}</td>
//           <td>{result.examScore}</td>
//         </>
//       )}
//       {role === "admin" && (
//         <>
//           <td>{result.subject}</td>
//           <td>{result.student}</td>
//           <td>{result.assessmentScore1}</td>
//           <td>{result.assessmentScore2}</td>
//           <td>{result.exam}</td>
//           <td>{result.term}</td>
//           <td>
//             <div className="flex items-center gap-2">
//               <Link href={`/list/results/${result.id}`}>
//                 <FormModal type="update" table="result" />
//               </Link>
//               <FormModal type="delete" table="result" />
//             </div>
//           </td>
//         </>
//       )}

//       {role === "teacher" && (
//         <>
//           <td>{result.subject}</td>
//           <td>{result.student}</td>
//           <td>{student.grade}</td>
//         </>
//       )}
//     </tr>
//   );

//   return (
//     <div className="bg-white rounded-md p-4 flex-1 m-4 mt-0">
//       {/*TEACHER UI*/}
//       {role === "teacher" && (
//   <>
//     <TeacherResultActions data={data} />
//     <div className="mt-4">
//       <h2 className="text-lg font-semibold">My Students</h2>
//       <Table  
//       renderRow={renderRow}
//         data={students.map(student => ({
//           id: student.id,
//           student: `${student.surname} ${student.name}`,
//           grade: student.grade?.name ?? "No Grade Assigned",
//         }))}
//         column={teacherColumns}
//       />
//     </div>
//   </>
// )}


//       {/*ADMIN UI*/}
//       {role === "admin" && (
//         <>
//           <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
//             <TableSearch />
//             <div className="flex items-center gap-4 self-end">
//               <FormModal type="create" table="class" />
//             </div>
//           </div>
//           <Table renderRow={renderRow} data={data} column={adminColumns} />
//         </>
//       )}

//       {/* STUDENT UI */}
//       {role === "student" && (
//         <>
//           <h2 className="text-lg font-semibold">My Results</h2>
//           <Table renderRow={renderRow} data={data} column={studentColumns} />
//         </>
//       )}

//       {/* PAGINATION SECTION */}
//       <Pagination count={count} page={p} />
//     </div>
//   );
// };

// export default resultListPage;




// Initialize selected subjects when editing
// // useEffect(() => {
// //   if (data?.subjects) {
// //     setSelectedSubjects(data.subjects.map((s) => s.subjectId));
// //     setValue(
// //       "subjects",
// //       data.subjects.map((s) => s.subjectId)
// //     );
// //   }
// // }, [data, setValue]);













// export async function createSession(sessionName) {
//   try {
//     if (!sessionName || typeof sessionName !== "string" || sessionName.trim() === "") {
//       console.error("Invalid session name:", sessionName);
//       return { success: false, message: "Invalid session name." };
//     }
//     const existingSession = await prisma.session.findFirst({
//       where: { name: sessionName.trim() },
//     });
//     if (existingSession) {
//       console.error("Session already exists:", sessionName);
//       return { success: false, message: "Session already exists." };
//     }
//     await prisma.$transaction([
//       prisma.session.updateMany({
//         where: { isCurrent: true },
//         data: { isCurrent: false },
//       }),
//       prisma.session.create({
//         data: {
//           name: sessionName.trim(),
//           isCurrent: true,
//           isDeleted: false,
//         },
//       }),
//     ]);

//     const grades = ["JSS1", "JSS2", "JSS3", "SSS1", "SSS2", "SSS3"];
//     for (let grade of grades) {
//       const newGrade = await prisma.grade.create({
//         data: { name: grade, sessionId: newSession.id },
//       });

//       // Create two classes (A & B) for each grade
//       await prisma.class.createMany({
//         data: [
//           { name: `${grade} A`, gradeId: newGrade.id },
//           { name: `${grade} B`, gradeId: newGrade.id },
//         ],
//       });
//     }

//     console.log("✅ New session created with all grades and classes.");
//     return { success: true, message: "Session created successfully!", session: newSession };
//   } catch (error) {
//     return { success: false, message: "An error occurred while creating the session." };
//   }
// }








































// "use client";
// import { useUser } from "@clerk/nextjs";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";

// const WelcomePage = () => {
//   const { isLoaded, user } = useUser();
//   const router = useRouter();

//   useEffect(() => {
//     if (!isLoaded) return;

//     if (!user) {
//       console.log("User is not authenticated. Redirecting to /sign-in.");
//       router.push("/sign-in");
//       return;
//     }

//     console.log("Full User Data:", user);
//     const role = user?.publicMetadata?.role;
//     console.log("User Role:", role, typeof role);

//     // Normalize the role value: if it is the string "undefined" or empty, treat it as invalid.
//     const normalizedRole =
//       typeof role === "string" && role.trim() && role.trim().toLowerCase() !== "undefined"
//         ? role.trim()
//         : null;

//     const redirectPath = normalizedRole ? `/${normalizedRole}` : "/sign-in";
//     console.log("Redirecting to:", redirectPath);
//     router.push(redirectPath);
//   }, [isLoaded, user, router]);

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gray-100">
//       <div className="px-6 py-4 rounded-md shadow-lg bg-white">
//         <h1 className="text-2xl font-bold text-center text-purple-700">
//           Welcome, {user?.username || "User"}!
//         </h1>
//         <p className="text-gray-600 text-center mt-2">Redirecting...</p>
//       </div>
//     </div>
//   );
// };

// export default WelcomePage;
