require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));
app.use(express.json());

// ── HEALTH CHECK ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Scholara backend is running' });
});

async function callGoogleGemini(promptText, maxOutputTokens = 1200) {
  if (!GOOGLE_API_KEY) {
    throw new Error('Google API key is not configured. Set GOOGLE_API_KEY in .env');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta2/models/gemini-1.5-flash:generateText?key=${GOOGLE_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: {
          text: promptText
        },
        temperature: 0.2,
        maxOutputTokens
      })
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google API error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.output || '';
}

// ── GENERATE NOTES ──
app.post('/api/generate', async (req, res) => {
  try {
    const { topic, mode, length, grade, visuals, explanation_level } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const prompt = buildPrompt(topic, mode, length, grade, visuals, explanation_level);
    const content = await callGoogleGemini(prompt, 1200);

    res.json({
      success: true,
      content,
      topic,
      mode
    });
  } catch (error) {
    console.error('Generate error:', error);
    res.status(500).json({
      error: 'Failed to generate content',
      message: error.message
    });
  }
});

// ── GENERATE SIDEBAR ──
app.post('/api/sidebar', async (req, res) => {
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

    res.json({
      success: true,
      data: parsed
    });
  } catch (error) {
    console.error('Sidebar error:', error);
    res.status(500).json({
      error: 'Failed to generate sidebar',
      message: error.message
    });
  }
});

// ── BUILD PROMPT ──
function buildPrompt(topic, mode, len, grade, visuals, elevel) {
  const gradeNote = grade ? `Target level: ${grade}.` : '';
  const lenNote = {
    short: 'Keep it concise (300-400 words).',
    medium: 'Medium length (600-800 words).',
    detailed: 'Be thorough and detailed (900-1000 words).'
  }[len] || 'Medium length (600-800 words).';

  const visualNote = visuals
    ? 'Include ASCII diagrams, flowcharts, or structured visual aids where helpful. Use text art to show processes, cycles, or structures.'
    : '';

  const eLevelMap = {
    beginner:
      'Explain for a complete beginner with no prior knowledge. Use very simple words, everyday analogies, and relatable examples.',
    intermediate:
      'Explain for someone with basic knowledge. Build on fundamentals, introduce proper terminology with clear definitions.',
    advanced:
      'Explain at an advanced level. Use technical terminology, discuss nuances, complexities, and edge cases.',
    expert:
      'Explain at expert/academic level. Include theoretical depth, critical analysis, current research perspectives, and advanced applications.',
    analogy:
      'Explain entirely through clever analogies and metaphors. Make abstract concepts concrete through vivid real-world comparisons.',
    visual:
      'Explain using lots of visual structures: ASCII diagrams, flowcharts, tables, timelines, numbered processes, and structured layouts.'
  };

  const modePrompts = {
    study: `Create comprehensive study notes on "${topic}". Include key concepts, definitions, examples, and analogies. Use clear headings, bullet points, and examples.`,
    cheatsheet: `Create a concise cheat sheet on "${topic}". Include key formulas, facts, terms, and essential points in a scannable format.`,
    revision: `Create a quick revision summary of "${topic}" for someone about to take a test. Include most important points, memory tricks, and likely exam questions.`,
    deepdive: `Create expert-level deep dive notes on "${topic}". Include advanced concepts, nuances, edge cases, connections to related topics.`,
    explain: `Explain "${topic}". ${eLevelMap[elevel] || eLevelMap.beginner} Include real-world examples, applications, and if helpful, visual diagrams.`,
    essay: `Create essay research notes on "${topic}". Include key arguments, counterarguments, important thinkers/sources, evidence, and essay structure.`,
    eli5: `Explain "${topic}" like I'm 5 years old. Use very simple language, fun analogies, and examples a child would understand.`,
    cornell: `Create Cornell Notes for "${topic}". Format: Key Questions (left), Detailed Notes (right), Summary (bottom).`,
    lecture: `Create organized lecture-style notes for "${topic}". Structure with introduction, main topics, sub-points, examples, and summary.`
  };

  return `${modePrompts[mode] || modePrompts.study}

${gradeNote} ${lenNote} ${visualNote}

Use markdown formatting: ## for main headings, ### for sub-headings, **bold** for key terms, *italic* for emphasis, bullet points, and numbered lists where appropriate. Make it visually rich and easy to study from. Where relevant, include a practical example or real-world application section.`;
}

// ── ERROR HANDLING ──
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`🎓 Scholara backend running on http://localhost:${PORT}`);
  console.log(`📚 API available at http://localhost:${PORT}/api`);
  if (!GOOGLE_API_KEY) {
    console.error('⚠️  WARNING: GOOGLE_API_KEY not set in .env file');
  }
});
