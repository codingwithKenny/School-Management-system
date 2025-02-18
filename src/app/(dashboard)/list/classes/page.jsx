import GradeComponent from "@/components/GradeComponent";
import { getUserId, getUserRole } from "@/lib/authUtils";

export default async function GradePage() {
  const role = await getUserRole(); 
  const userId = await getUserId()

 
  return <GradeComponent role={role} currentUser ={userId}/>;
}
