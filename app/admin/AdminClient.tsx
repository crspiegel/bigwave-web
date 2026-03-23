'use client';
import { useState, useCallback } from 'react';
import { createPost, updatePost, deletePost, getPosts, type Post } from './actions';

function parseTagsInput(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export default function AdminClient({ initialPosts }: { initialPosts: Post[] }) {
  const [title, setTitle] = useState('');
  const [tagsInput, setTagsInput] = useState('');
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
    setTagsInput(post.tags?.length ? post.tags.join(', ') : '');
    setContent(post.content);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 수정 취소: 폼 초기화 후 작성 모드로 복귀
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditId(null);
    setTitle('');
    setTagsInput('');
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

    const tags = parseTagsInput(tagsInput);

    if (isEditing && editId !== null) {
      const result = await updatePost(editId, title.trim(), content.trim(), tags);
      if (result.success) {
        handleCancelEdit();
        await fetchPosts();
        alert('포스트가 성공적으로 수정되었습니다.');
      } else {
        alert('수정 중 오류가 발생했습니다. 다시 시도해 주세요.');
      }
    } else {
      const result = await createPost(title.trim(), content.trim(), tags);
      if (result.success) {
        setTitle('');
        setTagsInput('');
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
    <div className="min-h-screen bg-[#6BA354] p-8 font-sans text-white">
      <header className="mx-auto mb-12 max-w-3xl pt-10">
        <h1 className="font-serif text-4xl font-bold tracking-tight text-white">Admin</h1>
        <p className="mt-2 text-base text-white/80">블로그 포스트 작성 및 발행</p>
      </header>

      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        {/* 포스트 작성 / 수정 폼 섹션 */}
        <div
          className={`rounded-3xl border p-8 transition-colors ${
            isEditing ? 'border-black/25 bg-white/15' : 'border-black/15 bg-white/10'
          }`}
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold text-white">
              {isEditing ? '포스트 수정' : '새 포스트 작성'}
            </h2>
            {isEditing && (
              <span className="rounded-full border border-black/20 bg-black/15 px-3 py-1 text-xs text-white/95">
                수정 모드
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white/90">제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="포스트 제목을 입력하세요"
                className="rounded-xl border border-black/15 bg-white p-3 text-black outline-none transition-colors placeholder:text-black/45 focus:border-black/35 focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white/90">
                태그 (쉼표로 구분하여 입력, 예: AI, 자동화)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="AI, 자동화, 워크플로우"
                className="rounded-xl border border-black/15 bg-white p-3 text-black outline-none transition-colors placeholder:text-black/45 focus:border-black/35 focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white/90">내용</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="포스트 내용을 입력하세요"
                rows={12}
                className="resize-none rounded-xl border border-black/15 bg-white p-3 text-black outline-none transition-colors placeholder:text-black/45 focus:border-black/35 focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div className="mt-2 flex gap-3">
              {/* 수정 모드일 때 취소 버튼 노출 */}
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 cursor-pointer rounded-xl border border-black/20 bg-black/15 p-3 font-bold text-white transition-all duration-200 hover:border-black/30 hover:bg-black/25"
                >
                  취소
                </button>
              )}

              {/* 저장/수정 완료 버튼 — 활성화 조건 엄수 */}
              <button
                type="submit"
                disabled={!isButtonEnabled}
                className={`flex-1 rounded-xl p-3 font-bold transition-all duration-200 ${
                  isButtonEnabled
                    ? 'cursor-pointer bg-black text-white hover:bg-black/90'
                    : 'cursor-not-allowed border border-black/15 bg-white/25 text-black/45'
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
        <div className="rounded-3xl border border-black/15 bg-white/10 p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold text-white">발행된 포스트 목록</h2>
            <span className="text-sm text-white/70">{posts.length}개</span>
          </div>

          {posts.length === 0 ? (
            <p className="py-10 text-center text-sm text-white/60">아직 발행된 포스트가 없습니다.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {posts.map((post) => (
                <li
                  key={post.id}
                  className={`rounded-2xl border p-5 transition-colors ${
                    editId === post.id
                      ? 'border-black/35 bg-white/15'
                      : 'border-black/15 bg-white/5 hover:border-black/25'
                  }`}
                >
                  <div className="mb-1 flex items-start justify-between gap-4">
                    <h3 className="truncate font-serif text-base font-semibold text-white">{post.title}</h3>
                    <div className="flex shrink-0 items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleEditClick(post)}
                        className="cursor-pointer text-xs text-white/75 transition-colors hover:text-white"
                      >
                        수정
                      </button>
                      <span className="text-xs text-white/35">|</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(post.id)}
                        className="cursor-pointer text-xs text-white/75 transition-colors hover:text-red-200"
                      >
                        삭제
                      </button>
                    </div>
                  </div>

                  <p className="mb-3 text-xs text-white/65">
                    {new Date(post.created_at).toLocaleString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="line-clamp-2 text-sm leading-relaxed text-white/80">{post.content}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
