// Chat gets its own key so it doesn't share a daily quota with the analytics
// dashboard; falls back to the shared key if only one is configured.
const API_KEY =
  process.env.EXPO_PUBLIC_GEMINI_CHAT_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions';

export const isAIConfigured = !!API_KEY;

const CANNED_REPLIES = [
  "That's a great question — based on what you've shared, I'd recommend breaking it into smaller steps first.",
  "Here's a quick tip: keep your components focused on one responsibility, it makes debugging much easier.",
  "I'd suggest checking the official docs for the latest API — things move fast in this ecosystem.",
  "Good progress! Try testing that on a real device once you're happy with the logic.",
];

function mockReply() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(CANNED_REPLIES[Math.floor(Math.random() * CANNED_REPLIES.length)]);
    }, 1500);
  });
}

// Wired for the Gemini API (generativelanguage.googleapis.com). Falls back to a
// canned reply whenever EXPO_PUBLIC_GEMINI_API_KEY isn't set, so the app works
// with zero configuration and upgrades to real answers the moment a key is added.
export async function getAIResponse(userMessage) {
  if (!API_KEY) return mockReply();

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': API_KEY,
    },
    body: JSON.stringify({
      model: 'gemini-3.6-flash',
      input: `Answer in plain conversational text with no markdown formatting, asterisks, or bullet points. Keep it under four sentences.\n\nQuestion: ${userMessage}`,
    }),
  });

  // The free tier allows 20 requests a minute, so 429 is the error you're most
  // likely to hit. Say so plainly instead of blaming the network.
  if (response.status === 429) {
    const err = new Error('rate limited');
    err.rateLimited = true;
    throw err;
  }

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.steps
    ?.find((step) => step.type === 'model_output')
    ?.content?.find((part) => part.type === 'text')?.text;

  // The chat bubbles render plain text, so strip any markdown that slips
  // through rather than showing literal asterisks.
  const plain = text
    ?.replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/(^|\s)\*(\S.*?\S)\*(?=\s|$)/g, '$1$2')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/`{1,3}/g, '')
    .trim();

  return plain || "I couldn't generate a response for that. Try rewording it.";
}
