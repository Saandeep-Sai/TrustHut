import axios from 'axios';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

const SYSTEM_PROMPT = `You are TrustHut accessibility assistant. You help users understand accessibility reports, check if locations are safe for elderly or wheelchair users, and provide practical guidance.

TrustHut is a community platform where people post accessibility reports about real-world locations — covering wheelchair ramps, elevators, broken footpaths, parking, and more.

Rules:
- Only answer accessibility, safety, and platform-related questions.
- Keep answers short and helpful (3-5 sentences).
- If community reports are provided in context, reference them.
- If no data is available, say so honestly and give general advice.
- Use emojis sparingly to be friendly.
- Never fabricate safety claims.`;

/**
 * Fetch community reports from the backend to enrich AI context.
 */
async function fetchRelevantPosts(query) {
  try {
    const { searchPosts, getPosts } = await import('./api');
    try {
      const res = await searchPosts(query);
      const posts = res.data?.data || [];
      if (posts.length > 0) return posts.slice(0, 5);
    } catch { /* search may fail, fall through */ }
    const allRes = await getPosts();
    return (allRes.data?.data || []).slice(0, 5);
  } catch {
    return [];
  }
}

function formatPostsContext(posts) {
  if (!posts || posts.length === 0) return '';
  const lines = posts.map((p, i) =>
    `${i + 1}. "${p.title}" at ${p.location_name || 'unknown'} — Risk: ${p.risk_level || 'unknown'}, Type: ${p.accessibility_type || 'general'}${p.description ? `. ${p.description.slice(0, 120)}` : ''}`
  );
  return `\n\nCommunity reports:\n${lines.join('\n')}`;
}

export async function sendMessage(message, history = []) {
  // Fetch real community data for context
  const posts = await fetchRelevantPosts(message);
  const context = formatPostsContext(posts);

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT + context },
    ...history.filter(m => m.role !== 'system').map(m => ({
      role: m.role === 'bot' ? 'assistant' : 'user',
      content: m.text,
    })),
    { role: 'user', content: message },
  ];

  try {
    const res = await axios.post(
      OPENROUTER_URL,
      {
        model: 'openrouter/auto',
        messages,
        max_tokens: 500,
        temperature: 0.3,
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'TrustHut',
        },
        timeout: 30000,
      }
    );

    const reply = res.data?.choices?.[0]?.message?.content;
    if (!reply) throw new Error('Empty response');
    return reply;
  } catch (err) {
    console.error('OpenRouter error:', err?.response?.data || err.message);

    // Fallback to backend keyword-matcher
    try {
      const { chatbotQuery } = await import('./api');
      const fallback = await chatbotQuery(message);
      const data = fallback.data.data;
      let text = data.answer;
      if (data.related_posts?.length > 0) {
        text += '\n\n📍 Related reports:';
        data.related_posts.forEach((p, i) => {
          text += `\n${i + 1}. ${p.title} — ${p.risk_level} (${p.location_name})`;
        });
      }
      return text;
    } catch {
      return 'Assistant temporarily unavailable. Please try again in a moment.';
    }
  }
}
