import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const AGE_INSTRUCTIONS = {
  kids: 'The players are children aged 6-12. Use very simple language, short sentences, fun and friendly tone. Avoid any scary, violent, or adult topics. Focus on the fun and positive aspects of the news.',
  teens: 'The players are teenagers aged 13-17. Use clear, engaging language. You can reference pop culture and current events directly. Keep it interesting and thought-provoking without being condescending.',
  adults: 'The players are adults aged 18+. Use normal journalistic language. Questions can be nuanced and require genuine recall or reasoning about the news stories.',
};

export async function generateQuiz({ articles, category, ageGroup, location }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
    return generateMockQuiz(articles, ageGroup);
  }

  const articleSummaries = articles
    .slice(0, 10)
    .map((a, i) => `${i + 1}. HEADLINE: ${a.title}\n   SUMMARY: ${a.description}`)
    .join('\n\n');

  const ageInstruction = AGE_INSTRUCTIONS[ageGroup] || AGE_INSTRUCTIONS.adults;
  const locationLabel = location?.city || location?.country || 'your area';

  const prompt = `You are creating a fun, engaging news quiz about recent ${category} news from ${locationLabel}.

${ageInstruction}

Here are the recent news stories to base questions on:

${articleSummaries}

Create exactly 10 multiple-choice quiz questions based on these news stories. Each question must:
- Have exactly 4 answer options (A, B, C, D)
- Have exactly one correct answer
- Be directly based on information in the provided articles
- Be appropriate for the age group described above

Return ONLY valid JSON in this exact format, no other text:
{
  "title": "A fun quiz title mentioning the location and category",
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Brief explanation of why this is correct, referencing the news story."
    }
  ]
}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].text.trim();

  // Extract JSON if wrapped in code blocks
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, text];
  const jsonString = jsonMatch[1] || text;

  return JSON.parse(jsonString);
}

function generateMockQuiz(articles, ageGroup) {
  const questions = articles.slice(0, 10).map((article, i) => {
    const words = article.title.split(' ');
    const keyWord = words[words.length - 1].replace(/[^a-zA-Z]/g, '') || 'event';

    return {
      id: i + 1,
      question: ageGroup === 'kids'
        ? `What happened in this news story? "${article.title}"`
        : `Which of the following best describes this recent news story?`,
      options: [
        article.description?.slice(0, 80) + '...' || article.title,
        'A completely unrelated event happened instead',
        'The story was later found to be incorrect',
        `No news was reported about ${keyWord} this week`,
      ],
      correctIndex: 0,
      explanation: `The correct answer is based on the story: "${article.title}". ${article.description || ''}`,
    };
  });

  return {
    title: `This Week\'s News Quiz (Demo Mode)`,
    questions,
  };
}
