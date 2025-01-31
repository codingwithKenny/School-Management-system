import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { currentUserId, role } from '@/lib/authUtils';

export async function GET(req) {
  try {
    if (!currentUserId || role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log("Fetching sessions, terms, and students for:", currentUserId);

    // Fetch Sessions
    const sessions = await prisma.session.findMany({
      where: { isDeleted: false },
      select: { id: true, name: true }
    });

    // Fetch Terms
    const terms = await prisma.term.findMany({
      where: { isDeleted: false },
      select: { id: true, name: true, sessionId: true }
    });

    // Fetch Students Assigned to the Teacher's Subjects, Grouped by Grade
    const studentsByGrade = await prisma.grade.findMany({
      where: {
        students: {
          some: {
            subjects: {
              some: {
                subject: {
                  teacherId: currentUserId
                }
              }
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        students: {
          select: {
            id: true,
            name: true,
            surname: true,
          }
        }
      }
    });

    return NextResponse.json({ sessions, terms, studentsByGrade }, { status: 200 });
  } catch (error) {
    console.error("API Fetch Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
