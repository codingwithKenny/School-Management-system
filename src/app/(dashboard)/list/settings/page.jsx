
import EditpayMent from "@/components/EditPayment";
import UpdateSessionCard from "@/components/UpdateSessioncard";
import { getUserId, getUserRole } from "@/lib/authUtils";

const settingPage = async() => {
  const role = await getUserRole(); 
    const userId = await getUserId();
  

    const session = await prisma.session.findFirst({
        where: {
          isCurrent: true,
        },
      });
     console.log(session)
    
  return (
    <div className="mt-10">
      <h1 className="text-center font-bold">SETTING PAGE</h1>
      <UpdateSessionCard session={session} />

      <div>
      </div>
      
    </div>
  );
};

export default settingPage;
