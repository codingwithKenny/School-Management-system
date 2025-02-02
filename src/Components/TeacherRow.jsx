// "use client";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import FormModal from "./FormModal";

// const TeacherRow = ({ teacher, subjects, role }) => {
//   const router = useRouter();

//   return (
//     <tr
//       className="text-xs border-b border-grey-200 even:bg-slate-50 hover:bg-[#F1F0FF] cursor-pointer"
//       onClick={() => router.push(`/list/teachers/${teacher.id}`)} // ✅ Client-side navigation
//     >
//       <td className="flex items-center gap-4 p-4">
//         <Image
//           src={teacher.photo || "/noAvatar.png"}
//           alt="Profile"
//           width={40}
//           height={40}
//           className="md:hidden xl:block w-10 h-10 object-cover rounded-full"
//         />
//         <div className="flex flex-col">
//           <h3 className="font-semibold">{teacher.name}</h3>
//           <h4 className="text-gray-500 text-sm">{teacher.email}</h4>
//         </div>
//       </td>
//       <td className="hidden md:table-cell">{teacher.username}</td>
//       <td className="hidden md:table-cell">
//         {teacher.subjects.length > 0
//           ? teacher.subjects.map((ts) => ts.subject.name).join(", ")
//           : "No assigned subject"}
//       </td>
//       <td className="hidden md:table-cell">
//         {teacher.classes?.map((item) => item.name).join(", ") || "N/A"}
//       </td>
//       <td className="hidden md:table-cell">{teacher.phone || "N/A"}</td>
//       <td className="hidden md:table-cell">{teacher.address || "N/A"}</td>
      
//     </tr>
//   );
// };

// export default TeacherRow;
