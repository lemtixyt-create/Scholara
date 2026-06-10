require('dotenv').config();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_MODEL = process.env.GOOGLE_MODEL || 'gemini-1.5-flash';


async function callGoogleGemini(promptText, maxOutputTokens = 1200) {
  if (!GOOGLE_API_KEY) {
    throw new Error('Google API key is not configured. Set GOOGLE_API_KEY in Vercel or .env');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta1/models/${GOOGLE_MODEL}:generateContent?key=${GOOGLE_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: promptText
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens
        }
      })
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google API error ${response.status}: ${text}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

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

module.exports = { callGoogleGemini, buildPrompt };
