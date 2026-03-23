export default function PostTagBadges({ tags }: { tags?: string[] | null }) {
  const list = Array.isArray(tags) ? tags.filter((t) => typeof t === 'string' && t.trim().length > 0) : [];
  if (list.length === 0) return null;

  return (
    <div className="mb-3 flex flex-wrap">
      {list.map((tag, i) => (
        <span
          key={`${tag}-${i}`}
          className="mb-2 mr-2 inline-block rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-black/70"
        >
          {tag.trim()}
        </span>
      ))}
    </div>
  );
}
