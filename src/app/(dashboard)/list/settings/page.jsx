
import EditUnpaidStudent from "@/components/EditPayment";
import UpdateSessionCard from "@/components/UpdateSessioncard";
import prisma from "@/lib/prisma";

const settingPage = async() => {
  

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
      <h1>UPDATE DEFAULTER</h1>
        <EditUnpaidStudent />
      </div>
      
    </div>
  );
};

export default settingPage;
