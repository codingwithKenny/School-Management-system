"use server";

import { getDatabaseData } from "@/app/actions/getDatabaseData";


export async function GET() {
  try {
    console.log("🟡 Fetching database data...");
    const data = await getDatabaseData();
    console.log("✅ Data fetched successfully:", data);

    // Convert BigInt values to strings for serialization.
    const safeData = JSON.parse(
      JSON.stringify(data, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    return Response.json(safeData, { status: 200 });
  } catch (error) {
    console.error("❌ Server Error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}




// prisma.classRecord.findMany({
//   include: {
//     student: true,
//     class: true,
//     term: true,
//     session: true,
//     teacher: true,
//     histories: true,
//   },
// }),