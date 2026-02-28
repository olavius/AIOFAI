import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import newsRouter from './routes/news.js';
import quizRouter from './routes/quiz.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/news', newsRouter);
app.use('/api/quiz', quizRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`NewsQuiz server running on http://localhost:${PORT}`);
});
