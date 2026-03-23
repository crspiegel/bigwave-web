'use server';
import { cookies } from 'next/headers';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function loginAdmin(password: string): Promise<{ success: boolean }> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || password !== expected) {
    return { success: false };
  }

  const cookieStore = await cookies();
  cookieStore.set('admin_token', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/admin',
    maxAge: 60 * 60 * 24 * 7,
  });

  return { success: true };
}

export type Post = {
  id: number;
  title: string;
  content: string;
  created_at: string;
  tags?: string[];
};

export async function createPost(title: string, content: string, tags: string[] = []) {
  try {
    await sql`INSERT INTO posts (title, content, tags) VALUES (${title}, ${content}, ${tags})`;
    return { success: true };
  } catch (error) {
    console.error('포스트 저장 오류:', error);
    return { success: false };
  }
}

export async function getPosts(): Promise<Post[]> {
  try {
    const rows =
      await sql`SELECT id, title, content, created_at, tags FROM posts ORDER BY created_at DESC`;
    return rows as Post[];
  } catch (error) {
    console.error('포스트 조회 오류:', error);
    return [];
  }
}

export async function getPostById(id: number): Promise<Post | null> {
  try {
    const rows =
      await sql`SELECT id, title, content, created_at, tags FROM posts WHERE id = ${id} LIMIT 1`;
    return rows.length > 0 ? (rows[0] as Post) : null;
  } catch (error) {
    console.error('포스트 단건 조회 오류:', error);
    return null;
  }
}

export async function updatePost(id: number, title: string, content: string, tags: string[] = []) {
  try {
    await sql`UPDATE posts SET title = ${title}, content = ${content}, tags = ${tags} WHERE id = ${id}`;
    return { success: true };
  } catch (error) {
    console.error('포스트 수정 오류:', error);
    return { success: false };
  }
}

export async function deletePost(id: number) {
  try {
    await sql`DELETE FROM posts WHERE id = ${id}`;
    return { success: true };
  } catch (error) {
    console.error('포스트 삭제 오류:', error);
    return { success: false };
  }
}
