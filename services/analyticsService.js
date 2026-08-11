const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions';

export const isAnalyticsConfigured = !!API_KEY;

// IMPORTANT: this does NOT return real Instagram/Twitter data.
//
// The task spec asks for live social metrics via the platforms' own APIs, but
// Instagram's Graph API requires Meta Business Verification and X's API
// requires a paid tier — neither is reachable for an individual student
// project (see the README).
//
// What this does instead: calls the Gemini API at runtime to generate a fresh
// set of plausible sample metrics plus a written performance analysis, so the
// dashboard is genuinely dynamic and driven by a real network call. The UI
// labels these as AI-generated sample figures, not live platform data.
//
// To swap in real data later, replace the body of fetchSocialStats() with:
//   Instagram: GET https://graph.instagram.com/me/insights (needs a long-lived
//     token from a verified Meta app + an Instagram Business/Creator account)
//   Twitter/X: GET https://api.x.com/2/users/:id?user.fields=public_metrics
//     (needs a Bearer token; public_metrics needs Elevated/paid access)
// The screen consumes whatever shape this function returns, so nothing else
// needs to change.

const STATIC_FALLBACK = {
  instagram: [
    { label: 'Followers', value: '12.4K' },
    { label: 'Posts', value: '186' },
    { label: 'Engagement', value: '4.8%' },
  ],
  twitter: [
    { label: 'Followers', value: '3.9K' },
    { label: 'Tweets', value: '742' },
    { label: 'Engagement', value: '2.1%' },
  ],
  insight: null,
  generated: false,
};

const PROMPT = `You are generating sample data for a social media analytics dashboard demo.
Return ONLY raw JSON, no markdown fences, matching exactly this shape:
{
  "instagram": [{"label":"Followers","value":"..."},{"label":"Posts","value":"..."},{"label":"Engagement","value":"..."}],
  "twitter": [{"label":"Followers","value":"..."},{"label":"Tweets","value":"..."},{"label":"Engagement","value":"..."}],
  "insight": "..."
}
Use realistic values for a small tech brand (followers abbreviated like "12.4K", engagement as a percentage).
Vary the numbers rather than reusing round defaults. The "insight" field must be exactly two sentences of
plain-language analysis of those specific numbers, covering growth and engagement.`;

function parseJsonLoosely(raw) {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/, '')
    .trim();
  return JSON.parse(cleaned);
}

export async function fetchSocialStats() {
  if (!API_KEY) return STATIC_FALLBACK;

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': API_KEY,
      },
      body: JSON.stringify({ model: 'gemini-3.6-flash', input: PROMPT }),
    });

    // 20 requests a minute on the free tier; surface that rather than quietly
    // showing stale numbers as though nothing happened.
    if (response.status === 429) return { ...STATIC_FALLBACK, rateLimited: true };
    if (!response.ok) return STATIC_FALLBACK;

    const data = await response.json();
    const text = data?.steps
      ?.find((step) => step.type === 'model_output')
      ?.content?.find((part) => part.type === 'text')?.text;

    if (!text) return STATIC_FALLBACK;

    const parsed = parseJsonLoosely(text);
    if (!Array.isArray(parsed?.instagram) || !Array.isArray(parsed?.twitter)) {
      return STATIC_FALLBACK;
    }

    return {
      instagram: parsed.instagram,
      twitter: parsed.twitter,
      insight: parsed.insight ?? null,
      generated: true,
    };
  } catch (e) {
    return STATIC_FALLBACK;
  }
}
