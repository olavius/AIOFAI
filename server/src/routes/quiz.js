import { Router } from 'express';
import { fetchNews } from '../services/newsService.js';
import { generateQuiz } from '../services/quizService.js';

const router = Router();

router.post('/generate', async (req, res) => {
  const { country, category = 'general', ageGroup = 'adults', location } = req.body;

  if (!country && !location) {
    return res.status(400).json({ error: 'country or location is required' });
  }

  try {
    const articles = await fetchNews({ country, category });

    if (articles.length === 0) {
      return res.status(404).json({ error: 'No articles found for this location/category' });
    }

    const quiz = await generateQuiz({ articles, category, ageGroup, location });
    res.json(quiz);
  } catch (err) {
    console.error('Quiz generation error:', err);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

export default router;
