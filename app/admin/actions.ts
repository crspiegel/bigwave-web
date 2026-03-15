'use server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export type Post = {
  id: number;
  title: string;
  content: string;
  created_at: string;
};

export async function createPost(title: string, content: string) {
  try {
    await sql`INSERT INTO posts (title, content) VALUES (${title}, ${content})`;
    return { success: true };
  } catch (error) {
    console.error('포스트 저장 오류:', error);
    return { success: false };
  }
}

export async function getPosts(): Promise<Post[]> {
  try {
    const rows = await sql`SELECT id, title, content, created_at FROM posts ORDER BY created_at DESC`;
    return rows as Post[];
  } catch (error) {
    console.error('포스트 조회 오류:', error);
    return [];
  }
}

export async function getPostById(id: number): Promise<Post | null> {
  try {
    const rows = await sql`SELECT id, title, content, created_at FROM posts WHERE id = ${id} LIMIT 1`;
    return rows.length > 0 ? (rows[0] as Post) : null;
  } catch (error) {
    console.error('포스트 단건 조회 오류:', error);
    return null;
  }
}

export async function updatePost(id: number, title: string, content: string) {
  try {
    await sql`UPDATE posts SET title = ${title}, content = ${content} WHERE id = ${id}`;
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
