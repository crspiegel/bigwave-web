'use server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function submitContact(email: string, message: string) {
  try {
    await sql`INSERT INTO contacts (email, message) VALUES (${email}, ${message})`;
    return { success: true };
  } catch (error) {
    console.error('문의 전송 오류:', error);
    return { success: false };
  }
}
