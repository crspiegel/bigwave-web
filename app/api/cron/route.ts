import { GoogleGenerativeAI } from '@google/generative-ai';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { IT_IMAGE_FALLBACK_POOL } from '@/lib/itImageFallbackPool';

const sql = neon(process.env.DATABASE_URL!);

const rssParser = new Parser({
  timeout: 20000,
  headers: { 'User-Agent': 'BigWave-Cron/1.0' },
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: true }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: true }],
    ],
  },
});

type CronRssItem = Parser.Item & {
  mediaContent?: unknown;
  mediaThumbnail?: unknown;
};

type RssArticle = {
  title: string;
  description: string;
  link: string;
  imageUrl: string;
};

function looksLikeImageUrl(url: string): boolean {
  const u = url.toLowerCase();
  return (
    u.startsWith('http') &&
    (/\.(jpe?g|png|gif|webp|avif)(\?|$)/i.test(u) || u.includes('image') || u.includes('/img'))
  );
}

function pickUrlFromMediaNode(node: unknown): string | null {
  if (node == null) return null;
  if (typeof node === 'string') {
    const t = node.trim();
    return t.startsWith('http') ? t : null;
  }
  if (Array.isArray(node)) {
    for (const n of node) {
      const u = pickUrlFromMediaNode(n);
      if (u) return u;
    }
    return null;
  }
  if (typeof node === 'object') {
    const o = node as Record<string, unknown>;
    if (typeof o.url === 'string' && o.url.startsWith('http')) return o.url.trim();
    if (typeof o.href === 'string' && o.href.startsWith('http')) return o.href.trim();
    const inner = o.$;
    if (inner && typeof inner === 'object') {
      const bag = inner as Record<string, unknown>;
      for (const k of ['url', 'href'] as const) {
        const v = bag[k];
        if (typeof v === 'string' && v.startsWith('http')) return v.trim();
      }
    }
  }
  return null;
}

/** RSS 항목에서 원문 썸네일·미디어 URL 추출 (없으면 빈 문자열) */
function extractRssItemImageUrl(item: CronRssItem): string {
  const enc = item.enclosure;
  if (enc?.url) {
    const type = (enc.type ?? '').toLowerCase();
    if (type.startsWith('image/') || looksLikeImageUrl(enc.url)) {
      return enc.url.trim();
    }
  }

  const fromMedia =
    pickUrlFromMediaNode(item.mediaContent) ?? pickUrlFromMediaNode(item.mediaThumbnail);
  if (fromMedia) return fromMedia;

  const legacy = item as Record<string, unknown>;
  const mc = legacy['media:content'];
  const mt = legacy['media:thumbnail'];
  const fromLegacy = pickUrlFromMediaNode(mc) ?? pickUrlFromMediaNode(mt);
  if (fromLegacy) return fromLegacy;

  const itunes = legacy['itunes:image'];
  const fromItunes = pickUrlFromMediaNode(itunes);
  if (fromItunes) return fromItunes;

  const html = typeof item.content === 'string' ? item.content : '';
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch?.[1]?.startsWith('http')) {
    return imgMatch[1].trim();
  }

  return '';
}

/** rss-parser로 최신 기사 상위 최대 5건 수집(종합 포스트용) */
async function fetchAiNewsRssItems(): Promise<RssArticle[]> {
  const feedUrl =
    process.env.CRON_RSS_URL ?? 'https://hnrss.org/newest?q=Cybersecurity';

  try {
    const feed = await rssParser.parseURL(feedUrl);
    const raw = (feed.items ?? []).slice(0, 5);

    return raw
      .map((item) => {
        const it = item as CronRssItem;
        const title = (it.title ?? '').trim();
        const description = (
          it.contentSnippet ??
          it.summary ??
          (typeof it.content === 'string' ? it.content : '') ??
          ''
        )
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        const link = (it.link ?? '').trim();
        if (!title) return null;
        const imageUrl = extractRssItemImageUrl(it);
        return { title, description: description || title, link, imageUrl };
      })
      .filter((x): x is RssArticle => x !== null);
  } catch (e) {
    console.error('[cron] RSS parseURL:', e);
    return [];
  }
}

type ParsedBlog = { title: string; markdown: string; tags: string[] };

function normalizeTagsFromPayload(tags: unknown): string[] {
  if (Array.isArray(tags)) {
    return tags
      .map((t) => String(t).trim())
      .filter((t) => t.length > 0 && t !== '자동발행');
  }
  if (typeof tags === 'string') {
    const s = tags.trim();
    if (s.startsWith('[')) {
      try {
        const parsed = JSON.parse(s) as unknown;
        if (Array.isArray(parsed)) {
          return parsed
            .map((t) => String(t).trim())
            .filter((t) => t.length > 0 && t !== '자동발행');
        }
      } catch {
        /* fall through */
      }
    }
    return s
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && t !== '자동발행');
  }
  return [];
}

/** Gemini 응답에서 JSON 블록 추출 → title, markdown, tags */
function parseGeminiBlogPayload(raw: string): ParsedBlog {
  const cleanText = raw.trim().replace(/```json/gi, '').replace(/```/g, '').trim();
  const text = cleanText;

  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end < start) {
    throw new Error('No JSON object in Gemini response');
  }

  const json = text.slice(start, end + 1);
  let o: { title?: string; markdown?: string; tags?: unknown };
  try {
    o = JSON.parse(json) as { title?: string; markdown?: string; tags?: unknown };
  } catch (e) {
    console.error('[cron] JSON.parse failed after fence strip', {
      snippet: json.slice(0, 400),
      cause: e instanceof Error ? e.message : String(e),
    });
    throw e;
  }

  const tags = normalizeTagsFromPayload(o.tags);

  const title = (o.title ?? '').trim();
  const markdown = (o.markdown ?? '').trim();

  if (!title || !markdown) {
    throw new Error('Parsed JSON missing title or markdown');
  }

  return {
    title,
    markdown,
    tags:
      tags.length > 0
        ? tags
        : ['IT', '기술인사이트', '산업동향', '디지털', '분석'],
  };
}

/** 수집 기사들을 Gemini에 넘길 JSON 번들 문자열 */
function buildArticlesBundleForPrompt(articles: RssArticle[]): string {
  const rows = articles.map((a) => ({
    title: a.title,
    contentSnippet: a.description,
    link: a.link,
    imageUrl: a.imageUrl,
  }));
  return JSON.stringify(rows, null, 2);
}

/** 다중 RSS 기사 → 단일 종합 포스트 (Gemini 1회 호출) */
async function synthesizeMultiArticleBlogWithGemini(articles: RssArticle[]): Promise<ParsedBlog> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const bundleJson = buildArticlesBundleForPrompt(articles);

  const prompt = `당신은 대중에게 AI 트렌드를 쉽고 명확하게 설명해 주는 '최상급 전문 IT 칼럼니스트'입니다. 일반인도 편안하게 읽을 수 있도록 평이한 단어를 사용하되, 유치하거나 아동을 대하는 듯한 표현(~해요, ~죠, 안녕! 등)은 절대 사용하지 마십시오. 문장은 반드시 '~습니다/입니다' 형태의 정돈된 경어체를 사용하고, 정보의 핵심을 예리하고 통찰력 있게 짚어주십시오. AEO(답변 엔진 최적화)와 일반 검색(SEO/GEO)에 잘 드러나도록 구조를 갖추십시오.

[여러 개의 최신 기사 데이터]
${bundleJson}

다음 규칙을 엄격히 지켜 하나의 마크다운 포스트를 작성하십시오.

- [이모지·아이콘 금지]: 본문의 문단 제목(\`##\`, \`###\` 등) 앞에는 🚨, 📉 등 **어떠한 이모지나 아이콘 문자도 쓰지 마십시오.** JSON \`title\` 필드에도 이모지·장식용 기호를 넣지 마십시오.
- **[형식 규칙]:** 본문(마크다운)의 최상단에 포스트 제목(\`## 제목\` 또는 \`# 제목\`)을 **절대 포함하지 마십시오.** 제목은 이미 페이지 상단에 표시됩니다.
- **[요약 규칙]:** 본문 최상단에 \`요약\`이라는 제목·단어·헤딩(\`####\` 등)을 **절대 쓰지 말고**, 곧바로 핵심 요약 3~4줄을 불릿 포인트(\`*\`)로만 시작하십시오.
- [가독성 높은 구조]: \`##\`, \`###\` 제목으로 문단을 나누고, 핵심 용어와 메시지는 **볼드체**로 강조하십시오. 서론–본론–결론 흐름을 유지하십시오.
- [구조화된 데이터]: 본문 중간에 여러 기사의 기술·동향·장단점을 비교하는 **마크다운 표(GFM 파이프 표)** 를 반드시 1개 이상 넣으십시오.
- [독창적 인사이트]: 단순 번역·나열이 아니라, 기사들을 관통하는 **종합(Synthesis)** 과 미래 전망을 논리적으로 쓰십시오.
- [독자 맞춤형 Q&A]: 본문 **하단**(결론 아래)에 질문과 답변(FAQ) **2~3개**를 배치하되, **반드시 질문(Q:) 문장이 끝난 뒤 빈 줄을 한 줄 넣은 다음(마크다운에서 이중 줄바꿈), 답변(A:)이 그 다음 줄에서 새로 시작**하도록 구조화하십시오. 질문 블록과 답변 블록 사이에 시각적으로 구분되는 공백 줄이 들어가야 합니다.
- [시각 자료]: 원본 데이터에 \`imageUrl\`이 **비어 있지 않으면 반드시** 본문 문맥에 맞게 \`![원본이미지 또는 설명](imageUrl)\`로 삽입하고, **바로 다음 줄**에 \`*출처: [기사 원문 제목](link)*\`(데이터의 title·link와 일치)를 붙이십시오. \`imageUrl\`이 빈 문자열인 기사는 이미지로 넣지 마십시오. **추가 시각 자료가 필요한 경우 외부 이미지 URL을 직접 쓰지 말고**, 반드시 \`[IMG: english-keyword]\` 자리 표시자만 사용하십시오. (예: \`[IMG: cyber-security]\`). 게시 파이프라인에서 사전 검증된 IT 이미지 풀 URL로 치환됩니다. 키워드는 영문·숫자·하이픈(\`-\`)·언더스코어(\`_\`)만 사용하십시오. 본문의 문맥에 맞춰 \`[IMG: english-keyword]\` 태그를 **본문 전체에 걸쳐 최소 3개 이상** 반드시 분산 삽입하십시오. 본문에 \`[IMG: ...]\`를 넣을 때 각 태그의 키워드(예: \`[IMG: data-center-cooling]\`, \`[IMG: ai-chips]\`)는 **본문 서로 다른 측면을 반영하도록 반복·중복되지 않게** 작성하십시오.
- [태그 규칙]: 본문 내용과 관련된 구체적인 핵심 기술/트렌드 키워드를 **최소 5개 이상** 추출하여 반드시 JSON 문자열 배열 형식으로 출력하십시오. (예: \`["클라우드", "데이터센터", "비용최적화", "AI인프라", "기술트렌드"]\`). \`자동발행\`과 같은 무의미한 더미 태그는 절대 사용하지 마십시오. 쉼표로 이어 붙인 단일 문자열이나 한 덩어리 태그는 금지입니다.
- [출처·인용성]: 글 말미(FAQ 이후)에 참고한 모든 기사를 마크다운 링크 리스트로 정리하십시오. OpenAI·Google·Anthropic 등 관련 맥락이 있으면 신뢰 가능한 언급을 넣어도 됩니다.

**[출력 형식 절대 규칙]**: 응답은 반드시 \`title\`, \`markdown\`, \`tags\` 키를 가진 **단일 JSON 객체**로만 출력하십시오. 마크다운 코드 블록(\`\`\`json)이나 부연 설명은 절대 넣지 마십시오. \`markdown\` 값 안의 따옴표·줄바꿈·역슬래시는 JSON 규칙에 맞게 이스케이프하십시오.

파싱용 스키마 예시(형식만 참고, 내용은 직접 작성):
{"title":"한글 제목 한 줄","markdown":"…","tags":["클라우드","데이터센터","비용최적화","AI인프라","기술트렌드"]}`;

  let rawText: string;
  try {
    const result = await model.generateContent(prompt);
    rawText = result.response.text();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status =
      e && typeof e === 'object' && 'status' in e && typeof (e as { status: unknown }).status === 'number'
        ? (e as { status: number }).status
        : undefined;
    const is429 =
      status === 429 ||
      msg.includes('429') ||
      /too many requests|resource exhausted|quota|rate limit/i.test(msg);
    console.error('[cron] Gemini generateContent failed (multi-article synthesis)', {
      articleCount: articles.length,
      message: msg,
      httpStatus: status,
      likelyRateLimitOrQuota: is429,
    });
    throw new Error(
      is429 ? `Gemini rate limit/quota (429): ${msg}` : `Gemini generateContent failed: ${msg}`,
    );
  }

  return parseGeminiBlogPayload(rawText);
}

/** `[IMG: …]` → 풀에서 글마다 사용한 URL은 Set으로 추적, 동일 URL 재사용 금지(소진 시 풀 리셋) */
function expandImgTagsToMarkdown(content: string): string {
  const pool = [...IT_IMAGE_FALLBACK_POOL] as string[];
  const usedImages = new Set<string>();
  return content.replace(/\[IMG:\s*([a-zA-Z0-9-_]+)\]/gi, () => {
    let available = pool.filter((img) => !usedImages.has(img));
    if (available.length === 0) {
      usedImages.clear();
      available = [...pool];
    }
    const randomImg = available[Math.floor(Math.random() * available.length)];
    usedImages.add(randomImg);
    return `![AI Concept Image](${randomImg})`;
  });
}

/** Neon posts 적재 */
async function insertCronPost(title: string, content: string, tags: string[]) {
  await sql`INSERT INTO posts (title, content, tags) VALUES (${title}, ${content}, ${tags})`;
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization') ?? '';
  const expected = secret ? `Bearer ${secret}` : '';

  if (!secret || auth !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 503 });
  }

  try {
    const items = await fetchAiNewsRssItems();
    if (items.length === 0) {
      return NextResponse.json({ ok: true, message: 'No RSS items to process', inserted: 0 });
    }

    const parsed = await synthesizeMultiArticleBlogWithGemini(items);
    let finalMarkdown = parsed.markdown;
    finalMarkdown = finalMarkdown.replace(/^\s*(#\s+.*?(\n|$))/m, '');
    finalMarkdown = expandImgTagsToMarkdown(finalMarkdown);
    await insertCronPost(parsed.title, finalMarkdown, parsed.tags);

    return NextResponse.json({
      ok: true,
      inserted: 1,
      titles: [parsed.title],
      sourceArticleCount: items.length,
    });
  } catch (error) {
    console.error("[CRON FATAL ERROR]:", error);
    console.error('[cron] pipeline:', error);
    return NextResponse.json({ error: 'Cron pipeline failed' }, { status: 500 });
  }
}
