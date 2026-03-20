import axios from 'axios';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

// Models to try in order — first available wins
const MODELS = [
  'stepfun/step-3.5-flash:free',
  'openai/gpt-oss-20b:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'mistralai/mistral-7b-instruct:free',
];

const SYSTEM_PROMPT = `You are **TrustHut Assistant**, an AI accessibility advisor for the TrustHut community platform.

TrustHut is a social platform where users upload photos and videos of real-world locations and report accessibility conditions — helping elderly, wheelchair, and disabled users decide whether a place is safe to visit.

Your responsibilities:
1. **Answer accessibility questions** — safety of locations, wheelchair ramps, elevators, broken footpaths, parking, restrooms, etc.
2. **Interpret community reports** — When the user asks about a specific location, refer to any matching community reports provided in the context.
3. **Give practical advice** — Tips for elderly travelers, wheelchair users, and people with mobility issues.
4. **Guide platform usage** — How to create a report, read risk levels (Safe / Moderate / High Risk), and use the map.

Behavior rules:
- Be warm, helpful, and concise (3-5 sentences per answer).
- If community reports are available in context, reference them specifically.
- If no reports match, say so honestly and offer general advice.
- Use emojis sparingly to be friendly.
- Never make up safety claims — if unsure, recommend the user check in person or create a new report.
- You can suggest related locations or types of accessibility to search for.`;

/**
 * Fetch community reports from the backend to use as context for the chatbot.
 */
async function fetchRelevantPosts(query) {
  try {
    const { searchPosts, getPosts } = await import('./api');
    // Try keyword search first
    try {
      const searchRes = await searchPosts(query);
      const posts = searchRes.data?.data || [];
      if (posts.length > 0) return posts.slice(0, 5);
    } catch { /* search might fail, fall through */ }

    // Fall back to latest posts for general context
    const allRes = await getPosts();
    return (allRes.data?.data || []).slice(0, 5);
  } catch {
    return [];
  }
}

function formatPostsContext(posts) {
  if (!posts || posts.length === 0) return '';

  const lines = posts.map((p, i) =>
    `${i + 1}. "${p.title}" at ${p.location_name || 'unknown location'} — Risk: ${p.risk_level || 'unknown'}, Type: ${p.accessibility_type || 'general'}${p.description ? `. Details: ${p.description.slice(0, 150)}` : ''}`
  );

  return `\n\nHere are relevant community reports from TrustHut:\n${lines.join('\n')}`;
}

/**
 * Try calling OpenRouter with a specific model. Returns the response text or throws.
 */
async function callOpenRouter(model, messages) {
  const res = await axios.post(
    OPENROUTER_URL,
    { model, messages, max_tokens: 600, temperature: 0.7 },
    {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'TrustHut',
      },
      timeout: 30000, // 30 second timeout
    }
  );

  const reply = res.data?.choices?.[0]?.message?.content;
  if (!reply) throw new Error('Empty response');
  return reply;
}

export async function sendMessage(message, history = []) {
  // Fetch real community data for context
  const relevantPosts = await fetchRelevantPosts(message);
  const postsContext = formatPostsContext(relevantPosts);

  // Build messages array with conversation history
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT + postsContext },
    ...history.map(m => ({
      role: m.role === 'bot' ? 'assistant' : 'user',
      content: m.text,
    })),
    { role: 'user', content: message },
  ];

  // Try each model in sequence until one works
  for (const model of MODELS) {
    try {
      console.log(`Trying model: ${model}`);
      const reply = await callOpenRouter(model, messages);
      console.log(`Success with model: ${model}`);
      return reply;
    } catch (err) {
      console.warn(`Model ${model} failed:`, err?.response?.status || err.message);
      // Continue to next model
    }
  }

  // All OpenRouter models failed — fall back to backend keyword-matcher
  console.warn('All OpenRouter models failed, using backend fallback');
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
    return 'Sorry, I encountered an error connecting to the AI service. Please try again in a moment.';
  }
}
