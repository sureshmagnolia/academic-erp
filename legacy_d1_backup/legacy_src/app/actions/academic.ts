'use server';

import { getDB } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * Gets the timetable for a specific faculty member on a given day.
 */
export async function getFacultyTimetable(facultyId: string, dayOfWeek: number) {
  const db = getDB();
  try {
    const { results } = await db.prepare(
      `SELECT t.id as timetable_id, t.hour_slot, b.name as batch_name, c.name as course_name
       FROM timetable t
       JOIN batches b ON t.batch_id = b.id
       JOIN courses c ON t.course_id = c.id
       WHERE t.faculty_id = ? AND t.day_of_week = ?
       ORDER BY t.hour_slot ASC`
    ).bind(facultyId, dayOfWeek).all<any>();
    
    return { success: true, timetable: results };
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Gets students for a specific timetable slot to mark attendance.
 */
export async function getStudentsForAttendance(timetableId: string, dateStr: string) {
  const db = getDB();
  try {
    // 1. Get the batch ID for this timetable
    const { results: ttResults } = await db.prepare(
      `SELECT batch_id FROM timetable WHERE id = ?`
    ).bind(timetableId).all<any>();

    if (!ttResults || ttResults.length === 0) throw new Error('Timetable not found');
    const batchId = ttResults[0].batch_id;

    // 2. Get students in that batch
    const { results: studentResults } = await db.prepare(
      `SELECT u.id, u.name, s.admission_no
       FROM student_batches sb
       JOIN users u ON sb.student_id = u.id
       JOIN students s ON u.id = s.user_id
       WHERE sb.batch_id = ?
       ORDER BY s.admission_no ASC`
    ).bind(batchId).all<any>();

    // 3. Check if attendance is already marked for this date + timetable slot
    const { results: existingAttendance } = await db.prepare(
      `SELECT student_id, status FROM attendance 
       WHERE timetable_id = ? AND date = ?`
    ).bind(timetableId, dateStr).all<any>();

    return { 
      success: true, 
      students: studentResults, 
      existingAttendance: existingAttendance 
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Submits the attendance for a class.
 */
export async function submitAttendance(
  timetableId: string, 
  dateStr: string, 
  facultyId: string, 
  attendanceData: { student_id: string, status: string }[]
) {
  const db = getDB();
  try {
    // Basic implementation: Delete existing for this date/slot, then insert new.
    // In D1, we can use a transaction or execute sequentially.
    
    await db.prepare(
      `DELETE FROM attendance WHERE timetable_id = ? AND date = ?`
    ).bind(timetableId, dateStr).run();

    // D1 batches limits to 100 per statement usually, but we can prepare statements.
    // D1 client supports batch execution.
    const stmts = attendanceData.map(record => {
      const id = crypto.randomUUID();
      return db.prepare(
        `INSERT INTO attendance (id, timetable_id, date, student_id, status, marked_by) VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(id, timetableId, dateStr, record.student_id, record.status, facultyId);
    });

    if (stmts.length > 0) {
      await db.batch(stmts);
    }

    revalidatePath('/faculty/attendance');
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
}
