const { callGoogleGemini, buildPrompt } = require('./lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { topic, mode, length, grade, visuals, explanation_level } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const prompt = buildPrompt(topic, mode, length, grade, visuals, explanation_level);
    const content = await callGoogleGemini(prompt, 1200);

    res.status(200).json({
      success: true,
      content,
      topic,
      mode
    });
  } catch (error) {
    console.error('generate error:', error);
    res.status(500).json({ error: 'Failed to generate content', message: error.message });
  }
};
