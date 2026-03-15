'use server';
import { neon } from '@neondatabase/serverless';

export async function submitWaitlist(email: string) {
  try {
    // .env.local에 동기화된 환경 변수를 통해 DB에 안전하게 연결합니다.
    const sql = neon(process.env.DATABASE_URL!);
    
    // 이메일 데이터를 waitlist 테이블에 삽입합니다.
    await sql`INSERT INTO waitlist (email) VALUES (${email})`;
    
    return { success: true };
  } catch (error) {
    console.error('DB 전송 오류:', error);
    return { success: false };
  }
}