import { getPosts } from './actions';
import AdminClient from './AdminClient';

export default async function AdminPage() {
  const initialPosts = await getPosts();
  return <AdminClient initialPosts={initialPosts} />;
}
