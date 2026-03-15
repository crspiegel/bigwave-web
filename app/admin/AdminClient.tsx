'use client';
import { useState, useCallback } from 'react';
import { createPost, updatePost, deletePost, getPosts, type Post } from './actions';

export default function AdminClient({ initialPosts }: { initialPosts: Post[] }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  const [posts, setPosts] = useState<Post[]>(initialPosts); // 서버 프리페치 데이터로 즉시 초기화

  // 수정 모드 상태
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // 제목 + 내용 모두 1글자 이상, 로딩 중 아닐 때만 활성화
  const isButtonEnabled = title.trim().length > 0 && content.trim().length > 0 && status !== 'loading';

  // 뮤테이션 후 목록 갱신 (deps 없는 순수 함수이므로 useCallback으로 안정화)
  const fetchPosts = useCallback(async () => {
    const data = await getPosts();
    setPosts(data);
  }, []);

  // 수정 모드 진입: 폼에 기존 값 채우기
  const handleEditClick = (post: Post) => {
    setIsEditing(true);
    setEditId(post.id);
    setTitle(post.title);
    setContent(post.content);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 수정 취소: 폼 초기화 후 작성 모드로 복귀
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditId(null);
    setTitle('');
    setContent('');
  };

  // 삭제: 재확인 후 서버 액션 호출
  const handleDeleteClick = async (id: number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    const result = await deletePost(id);
    if (result.success) {
      await fetchPosts();
    } else {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  // 폼 제출: isEditing 여부에 따라 수정/생성 분기
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isButtonEnabled) return; // 비활성 상태 원천 차단

    setStatus('loading');

    if (isEditing && editId !== null) {
      const result = await updatePost(editId, title.trim(), content.trim());
      if (result.success) {
        handleCancelEdit();
        await fetchPosts();
        alert('포스트가 성공적으로 수정되었습니다.');
      } else {
        alert('수정 중 오류가 발생했습니다. 다시 시도해 주세요.');
      }
    } else {
      const result = await createPost(title.trim(), content.trim());
      if (result.success) {
        setTitle('');
        setContent('');
        await fetchPosts();
        alert('포스트가 성공적으로 저장 및 발행되었습니다.');
      } else {
        alert('저장 중 오류가 발생했습니다. 다시 시도해 주세요.');
      }
    }

    setStatus('idle');
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <header className="mb-12 pt-10 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight">Admin</h1>
        <p className="text-neutral-400 mt-2 text-base">블로그 포스트 작성 및 발행</p>
      </header>

      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        {/* 포스트 작성 / 수정 폼 섹션 */}
        <div className={`border rounded-3xl p-8 transition-colors ${isEditing ? 'bg-neutral-900 border-blue-700' : 'bg-neutral-900 border-neutral-800'}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {isEditing ? '포스트 수정' : '새 포스트 작성'}
            </h2>
            {isEditing && (
              <span className="text-xs text-blue-400 bg-blue-900/30 border border-blue-800 px-3 py-1 rounded-full">
                수정 모드
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-neutral-400 font-medium">제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="포스트 제목을 입력하세요"
                className="p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white outline-none focus:border-blue-500 transition-colors placeholder:text-neutral-600"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-neutral-400 font-medium">내용</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="포스트 내용을 입력하세요"
                rows={12}
                className="p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white outline-none focus:border-blue-500 transition-colors resize-none placeholder:text-neutral-600"
              />
            </div>

            <div className="flex gap-3 mt-2">
              {/* 수정 모드일 때 취소 버튼 노출 */}
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 p-3 rounded-xl font-bold bg-neutral-800 text-neutral-300 border border-neutral-700 hover:bg-neutral-700 hover:text-white transition-all duration-200 cursor-pointer"
                >
                  취소
                </button>
              )}

              {/* 저장/수정 완료 버튼 — 활성화 조건 엄수 */}
              <button
                type="submit"
                disabled={!isButtonEnabled}
                className={`flex-1 p-3 rounded-xl font-bold transition-all duration-200 ${
                  isButtonEnabled
                    ? 'bg-blue-600 text-white cursor-pointer hover:bg-blue-500'
                    : 'bg-neutral-800 text-neutral-600 cursor-not-allowed border border-neutral-700'
                }`}
              >
                {status === 'loading'
                  ? '저장 중...'
                  : isEditing
                  ? '수정 완료'
                  : '저장 및 발행'}
              </button>
            </div>
          </form>
        </div>

        {/* 발행된 포스트 목록 섹션 */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">발행된 포스트 목록</h2>
            <span className="text-sm text-neutral-500">{posts.length}개</span>
          </div>

          {posts.length === 0 ? (
            <p className="text-neutral-600 text-sm text-center py-10">아직 발행된 포스트가 없습니다.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {posts.map((post) => (
                <li
                  key={post.id}
                  className={`bg-neutral-800 border rounded-2xl p-5 transition-colors ${
                    editId === post.id ? 'border-blue-700' : 'border-neutral-700 hover:border-neutral-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <h3 className="font-semibold text-white text-base truncate">{post.title}</h3>
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditClick(post)}
                        className="text-xs text-neutral-400 hover:text-blue-400 transition-colors cursor-pointer"
                      >
                        수정
                      </button>
                      <span className="text-neutral-700 text-xs">|</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(post.id)}
                        className="text-xs text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        삭제
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-500 mb-3">
                    {new Date(post.created_at).toLocaleString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="text-sm text-neutral-400 leading-relaxed line-clamp-2">{post.content}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
