'use server';

import { getDB } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * Gets students and their existing marks for a specific exam.
 */
export async function getStudentsForExam(examId: string) {
  const db = getDB();
  try {
    // 1. Get Exam Details
    const { results: examResults } = await db.prepare(
      `SELECT e.*, c.name as course_name, b.name as batch_name
       FROM exams e
       JOIN courses c ON e.course_id = c.id
       JOIN batches b ON e.batch_id = b.id
       WHERE e.id = ?`
    ).bind(examId).all<any>();

    if (!examResults || examResults.length === 0) throw new Error('Exam not found');
    const exam = examResults[0];

    // 2. Get Students mapped to that batch
    const { results: studentResults } = await db.prepare(
      `SELECT u.id, u.name, s.admission_no
       FROM student_batches sb
       JOIN users u ON sb.student_id = u.id
       JOIN students s ON u.id = s.user_id
       WHERE sb.batch_id = ?
       ORDER BY s.admission_no ASC`
    ).bind(exam.batch_id).all<any>();

    // 3. Get existing marks if any
    const { results: existingMarks } = await db.prepare(
      `SELECT student_id, marks_obtained FROM exam_marks WHERE exam_id = ?`
    ).bind(examId).all<any>();

    return { 
      success: true, 
      exam, 
      students: studentResults, 
      existingMarks 
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Submits the marks for an exam.
 */
export async function submitExamMarks(
  examId: string, 
  marksData: { student_id: string, marks_obtained: number }[]
) {
  const db = getDB();
  try {
    // Basic implementation: Delete existing marks, then insert new.
    await db.prepare(
      `DELETE FROM exam_marks WHERE exam_id = ?`
    ).bind(examId).run();

    const stmts = marksData.map(record => {
      return db.prepare(
        `INSERT INTO exam_marks (exam_id, student_id, marks_obtained) VALUES (?, ?, ?)`
      ).bind(examId, record.student_id, record.marks_obtained);
    });

    if (stmts.length > 0) {
      await db.batch(stmts);
    }

    revalidatePath(`/faculty/exams/${examId}`);
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
}
