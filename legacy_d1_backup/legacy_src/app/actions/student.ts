'use server';

import { getDB } from '@/lib/db';

export async function getStudentDashboardData(studentId: string) {
  const db = getDB();
  try {
    // 1. Get total attendance stats
    const { results: attendanceStats } = await db.prepare(
      `SELECT status, COUNT(*) as count 
       FROM attendance 
       WHERE student_id = ?
       GROUP BY status`
    ).bind(studentId).all<any>();

    let present = 0;
    let total = 0;
    
    if (attendanceStats) {
      attendanceStats.forEach((row: any) => {
        total += row.count;
        if (row.status === 'PRESENT' || row.status === 'DUTY_LEAVE') {
          present += row.count;
        }
      });
    }

    const attendancePercentage = total > 0 ? ((present / total) * 100).toFixed(1) : 'N/A';

    // 2. Get Recent Exam Marks
    const { results: recentMarks } = await db.prepare(
      `SELECT em.marks_obtained, e.name as exam_name, e.max_marks, c.name as course_name
       FROM exam_marks em
       JOIN exams e ON em.exam_id = e.id
       JOIN courses c ON e.course_id = c.id
       WHERE em.student_id = ?
       ORDER BY e.date DESC
       LIMIT 5`
    ).bind(studentId).all<any>();

    return { 
      success: true, 
      attendance: { present, total, percentage: attendancePercentage },
      recentMarks 
    };
  } catch (error: any) {
    return { error: error.message };
  }
}
