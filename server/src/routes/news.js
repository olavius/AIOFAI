import { Router } from 'express';
import { fetchNews } from '../services/newsService.js';

const router = Router();

router.get('/', async (req, res) => {
  const { country, category } = req.query;

  try {
    const articles = await fetchNews({ country, category });
    res.json({ articles, count: articles.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

export default router;
