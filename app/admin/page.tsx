import { cookies } from 'next/headers';
import { getPosts } from './actions';
import AdminClient from './AdminClient';
import AdminLoginForm from './AdminLoginForm';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const authed = cookieStore.get('admin_token')?.value === 'true';

  if (!authed) {
    return <AdminLoginForm />;
  }

  const initialPosts = await getPosts();
  return <AdminClient initialPosts={initialPosts} />;
}
