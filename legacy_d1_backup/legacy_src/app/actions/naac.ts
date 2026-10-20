'use server';

import { getDB } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * Fetches all NAAC Categories
 */
export async function getNaacCategories() {
  const db = getDB();
  try {
    const { results } = await db.prepare(`SELECT * FROM naac_categories ORDER BY criteria_number ASC`).all<any>();
    return { success: true, categories: results };
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Submits a new NAAC Achievement/Record for a Faculty member
 */
export async function submitNaacRecord(formData: FormData) {
  const db = getDB();
  try {
    const id = crypto.randomUUID();
    const facultyId = formData.get('faculty_id') as string;
    const categoryId = formData.get('category_id') as string;
    const title = formData.get('title') as string;
    const date = formData.get('date') as string;
    const description = formData.get('description') as string;
    const evidenceLink = formData.get('evidence_link') as string;

    if (!facultyId || !categoryId || !title || !date) {
      throw new Error('Missing required fields');
    }

    await db.prepare(
      `INSERT INTO naac_submissions (id, faculty_id, category_id, title, date, description, evidence_link)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, facultyId, categoryId, title, date, description, evidenceLink).run();

    revalidatePath('/admin/naac');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Fetches all consolidated NAAC records for IQAC/Admin reporting
 */
export async function getConsolidatedNaacReport() {
  const db = getDB();
  try {
    const { results } = await db.prepare(
      `SELECT s.*, c.criteria_number, c.name as category_name, u.name as faculty_name, d.name as department_name
       FROM naac_submissions s
       JOIN naac_categories c ON s.category_id = c.id
       JOIN users u ON s.faculty_id = u.id
       LEFT JOIN departments d ON u.department_id = d.id
       ORDER BY s.date DESC`
    ).all<any>();
    return { success: true, records: results };
  } catch (error: any) {
    return { error: error.message };
  }
}
