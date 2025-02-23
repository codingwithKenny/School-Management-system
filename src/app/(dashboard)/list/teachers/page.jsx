import Image from "next/image";
import Link from "next/link";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { getUserRole } from "@/lib/authUtils";

export default async function TeacherListPage({ searchParams }) {
  const params = searchParams ? await searchParams : {};
  const role = await getUserRole();
  const page = parseInt(params.page) || 1;

  const query = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      switch (key) {
        case "classId":
          acc.lessons = { some: { classId: parseInt(value) } };
          break;
        case "search":
          acc.name = { contains: value, mode: "insensitive" };
          break;
      }
    }
    return acc;
  }, {});

  const [teachersData, count] = await Promise.all([
    prisma.teacher.findMany({
      where: { ...query, isDeleted: false },
      include: { subjects: { include: { subject: true } }, classes: true },
      take: ITEM_PER_PAGE,
      skip: (page - 1) * ITEM_PER_PAGE,
    }),
    prisma.teacher.count({ where: { ...query, isDeleted: false } }),
  ]);

  const columns = [
    { header: "Teacher", accessor: "info", className: "w-1/4" },
    { header: "Subject", accessor: "subjects", className: "hidden md:table-cell w-1/4" },
    { header: "Phone", accessor: "phone", className: "hidden lg:table-cell w-1/6" },
    { header: "Address", accessor: "address", className: "hidden lg:table-cell w-1/6" },
    ...(role === "admin" ? [{ header: "Actions", accessor: "actions", className: "w-1/6" }] : []),
  ];

  const renderRow = (teacher) => (
    <tr key={teacher.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
      <td className="p-4 flex items-center gap-4">
        <Link href={`/list/teachers/${teacher.id}`} className="flex items-center gap-4">
          <Image
            src={teacher.img || "/avatar.png"}
            alt="Profile"
            width={50}
            height={50}
            className="rounded-full w-12 h-12 object-cover border border-gray-300"
          />
          <div>
            <h3 className="font-medium text-gray-800">{teacher.name}</h3>
            <p className="text-gray-500 text-sm">{teacher.email}</p>
          </div>
        </Link>
      </td>
      <td className="hidden md:table-cell">
        {teacher.subjects.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {teacher.subjects.map((ts) => (
              <span key={ts.subject.id} className="bg-blue-200 text-blue-700 text-xs px-2 py-1 rounded-md">
                {ts.subject.name}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-500 text-sm">No assigned subjects</span>
        )}
      </td>
      <td className="hidden lg:table-cell text-gray-700">{teacher.phone || "N/A"}</td>
      <td className="hidden lg:table-cell text-gray-700">{teacher.address || "N/A"}</td>
      {role === "admin" && (
        <td>
          <div className="flex items-center gap-2">
            <FormModal type="update" table="teacher" data={teacher} />
            <FormModal type="delete" table="teacher" id={teacher.id} />
          </div>
        </td>
      )}
    </tr>
  );

  return (
    <div className="bg-white rounded-lg mt-10 p-6 shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-center pb-4 border-b">
        <h1 className="text-xl font-semibold text-gray-800">All Teachers</h1>
        <div className="flex items-center gap-3">
          <TableSearch />
          <button className="p-2 rounded-full bg-yellow-400 hover:bg-yellow-500 transition">
            <Image src="/filter.png" alt="Filter" width={16} height={16} />
          </button>
          <button className="p-2 rounded-full bg-yellow-400 hover:bg-yellow-500 transition">
            <Image src="/sort.png" alt="Sort" width={16} height={16} />
          </button>
          {role === "admin" && <FormModal type="create" table="teacher" />}
        </div>
      </div>
      <Table column={columns} renderRow={renderRow} data={teachersData || []} />
      <Pagination page={page} count={count} />
    </div>
  );
}
