const { callGoogleGemini } = require('./lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const sidePrompt = `Based on this topic: "${topic}"

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "terms": [
    {"word": "Term1", "def": "Short definition"},
    {"word": "Term2", "def": "Short definition"},
    {"word": "Term3", "def": "Short definition"},
    {"word": "Term4", "def": "Short definition"}
  ],
  "facts": [
    "Interesting fact 1 about this topic",
    "Interesting fact 2 about this topic",
    "Interesting fact 3 about this topic"
  ],
  "related": ["Related Topic 1", "Related Topic 2", "Related Topic 3", "Related Topic 4", "Related Topic 5"]
}`;

    const raw = await callGoogleGemini(sidePrompt, 800);
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    res.status(200).json({ success: true, data: parsed });
  } catch (error) {
    console.error('sidebar error:', error);
    res.status(500).json({ error: 'Failed to generate sidebar', message: error.message });
  }
};
