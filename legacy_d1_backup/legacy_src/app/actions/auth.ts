'use server';

import { getDB } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Simple edge-compatible hashing (SHA-256) just for demo purposes.
// In a real production app, use bcrypt or Argon2 via an Edge-compatible library.
async function hashPassword(password: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function registerUser(formData: FormData) {
  const db = getDB();
  
  const id = crypto.randomUUID();
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const mobile = formData.get('mobile') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;
  const departmentId = formData.get('department_id') as string || null;

  if (!name || !email || !mobile || !password || !role) {
    return { error: 'Missing required fields' };
  }

  const hashedPassword = await hashPassword(password);

  try {
    const { success } = await db.prepare(
      `INSERT INTO users (id, name, email, mobile_number, password_hash, role, department_id, approval_status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')`
    ).bind(id, name, email, mobile, hashedPassword, role, departmentId).run();

    if (success) {
      // If student, insert into students table too
      if (role === 'STUDENT') {
        const admissionNo = formData.get('admission_no') as string;
        await db.prepare(
          `INSERT INTO students (admission_no, user_id) VALUES (?, ?)`
        ).bind(admissionNo || `ADM-${Date.now()}`, id).run();
      }
      return { success: true };
    }
    return { error: 'Database insertion failed' };
  } catch (error: any) {
    console.error('Registration Error:', error);
    return { error: error.message || 'An error occurred during registration' };
  }
}

export async function getPendingApprovals() {
  const db = getDB();
  try {
    const { results } = await db.prepare(
      `SELECT users.*, departments.name as department_name 
       FROM users 
       LEFT JOIN departments ON users.department_id = departments.id
       WHERE approval_status = 'PENDING'`
    ).all();
    return { success: true, users: results };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function approveUser(userId: string, approverId: string) {
  const db = getDB();
  try {
    await db.prepare(
      `UPDATE users SET approval_status = 'APPROVED', approved_by = ? WHERE id = ?`
    ).bind(approverId, userId).run();
    revalidatePath('/admin/approvals');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
