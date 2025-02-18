import AdminResultAction from "@/components/AdminResultAction";
import { allResults, fetchSubjects } from "@/lib/actions";
import { getCurrentUser } from "@/lib/authUtils";
import prisma from "@/lib/prisma";
import React from "react";

const ResultOverview = async () => {
  const { role, userId } = await getCurrentUser();
  console.log(userId, "current user");

  const sessions = await prisma.session.findMany({
    include: {
      terms: true,
    },
  });

  //  GET ALL RESULT
  const allResult = await allResults();
  console.log(allResult, "all results");
  // GET SUBJECT
  const subject = await fetchSubjects();
  console.log(subject);

  return (
    <div>
      <h1 className="text-center">RESULT</h1>
      {role == "admin" && (
        <AdminResultAction
          allResult={allResult}
          sessions={sessions}
          subject={subject}
        />
      )}
    </div>
  );
};

export default ResultOverview;
