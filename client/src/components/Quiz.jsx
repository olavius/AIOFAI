import { useState } from 'react';

const LETTERS = ['A', 'B', 'C', 'D'];

export default function Quiz({ quiz, onFinish }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);

  const questions = quiz.questions || [];
  const q = questions[current];
  const total = questions.length;

  function handleSelect(idx) {
    if (selected !== null) return;
    setSelected(idx);
  }

  function handleNext() {
    const newAnswers = [...answers, { questionId: q.id, selected, correct: q.correctIndex }];

    if (current + 1 >= total) {
      onFinish(newAnswers);
    } else {
      setAnswers(newAnswers);
      setSelected(null);
      setCurrent((c) => c + 1);
    }
  }

  if (!q) return null;

  const answered = selected !== null;
  const progress = ((current) / total) * 100;

  return (
    <div className="card">
      <div className="quiz-header">
        <div className="quiz-title">{quiz.title}</div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="question-counter">
          Question {current + 1} of {total}
        </div>
      </div>

      <div className="question-text">{q.question}</div>

      <div className="options-list">
        {q.options.map((opt, idx) => {
          let cls = 'option-btn';
          if (answered) {
            if (idx === q.correctIndex) cls += ' correct';
            else if (idx === selected) cls += ' wrong';
          }

          return (
            <button
              key={idx}
              className={cls}
              onClick={() => handleSelect(idx)}
              disabled={answered}
            >
              <span className="option-letter">{LETTERS[idx]}</span>
              {opt}
            </button>
          );
        })}
      </div>

      {answered && q.explanation && (
        <div className="explanation">
          💡 {q.explanation}
        </div>
      )}

      {answered && (
        <div className="next-btn-wrap">
          <button className="btn btn-primary" onClick={handleNext}>
            {current + 1 < total ? 'Next Question →' : 'See Results 🏆'}
          </button>
        </div>
      )}
    </div>
  );
}
