
import { useDatabase } from "@/app/context/DatabaseProvider";
import GradeComponent from "@/components/GradeComponent";
import { fetchGrades } from "@/lib/actions";
import { getUserRole } from "@/lib/authUtils";

export default async function GradePage() {
  const role = await getUserRole(); // ✅ Fetching user role on server
  const grades = await fetchGrades(); // ✅ Fetch grades
 
  return <GradeComponent role={role} grades={grades} />;
}
