import { useState } from 'react';
import Setup from './components/Setup.jsx';
import Quiz from './components/Quiz.jsx';
import Scoreboard from './components/Scoreboard.jsx';

const VIEWS = { SETUP: 'setup', QUIZ: 'quiz', SCORE: 'score' };

export default function App() {
  const [view, setView] = useState(VIEWS.SETUP);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [config, setConfig] = useState(null);

  function handleQuizReady(quizData, cfg) {
    setQuiz(quizData);
    setConfig(cfg);
    setAnswers([]);
    setView(VIEWS.QUIZ);
  }

  function handleQuizFinish(finalAnswers) {
    setAnswers(finalAnswers);
    setView(VIEWS.SCORE);
  }

  function handlePlayAgain() {
    setQuiz(null);
    setAnswers([]);
    setConfig(null);
    setView(VIEWS.SETUP);
  }

  return (
    <div className="app">
      <header className="header">
        <h1>📰 NewsQuiz</h1>
        <p>Last week's news, turned into a game</p>
      </header>

      {view === VIEWS.SETUP && (
        <Setup onQuizReady={handleQuizReady} />
      )}

      {view === VIEWS.QUIZ && quiz && (
        <Quiz quiz={quiz} onFinish={handleQuizFinish} />
      )}

      {view === VIEWS.SCORE && quiz && (
        <Scoreboard
          quiz={quiz}
          answers={answers}
          config={config}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}
