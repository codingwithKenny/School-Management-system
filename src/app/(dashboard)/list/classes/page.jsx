import GradeComponent from "@/components/GradeComponent";
import { fetchGrades } from "@/lib/actions";
import { getUserId, getUserRole } from "@/lib/authUtils";

export default async function GradePage() {
  const role = await getUserRole(); // ✅ Fetching user role on server
  const userId = await getUserId()
  // const grades = await get(); // ✅ Fetch grades
 
  return <GradeComponent role={role} currentUser ={userId}/>;
}
