# 📰 NewsQuiz

A fun quiz game that turns last week's local news into trivia — tailored by location, category, and age group.

## How It Works

1. **Detect location** — The app uses your browser's GPS to find your city/country
2. **Pick a category** — General, Sports, Tech, Entertainment, Science, or Business
3. **Pick an age group** — Kids (6–12), Teens (13–17), or Adults (18+)
4. **Play!** — 10 multiple-choice questions generated from real local headlines by Claude AI

## Setup

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure environment variables

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and add:

| Variable | Where to get it |
|---|---|
| `NEWS_API_KEY` | [newsapi.org/register](https://newsapi.org/register) — free tier |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com/) |

> **No keys?** The app runs in demo mode with sample articles and mock quizzes.

### 3. Start development servers

```bash
# Terminal 1 — backend
npm run dev:server

# Terminal 2 — frontend
npm run dev:client
```

Then open **http://localhost:5173**

## Project Structure

```
├── client/          # React + Vite frontend
│   └── src/
│       ├── components/
│       │   ├── Setup.jsx        # Location, category & age selection
│       │   ├── Quiz.jsx         # Question display & answer logic
│       │   └── Scoreboard.jsx   # Results & review
│       └── styles/global.css
├── server/          # Express backend
│   └── src/
│       ├── routes/
│       │   ├── news.js          # GET /api/news
│       │   └── quiz.js          # POST /api/quiz/generate
│       └── services/
│           ├── newsService.js   # NewsAPI integration + mock fallback
│           └── quizService.js   # Claude AI quiz generation + mock fallback
└── package.json     # Root convenience scripts
```

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **News**: [NewsAPI](https://newsapi.org)
- **AI**: [Claude API](https://anthropic.com) (claude-sonnet-4-6)
- **Geocoding**: OpenStreetMap Nominatim (free, no key needed)
