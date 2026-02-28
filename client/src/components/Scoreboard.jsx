const MEDALS = ['🥇', '🥈', '🥉'];

function getMessage(score, total, ageGroup) {
  const pct = score / total;
  if (ageGroup === 'kids') {
    if (pct === 1) return { msg: 'Perfect score! You\'re a news superstar! ⭐', sub: 'Amazing job — you got every single one right!' };
    if (pct >= 0.7) return { msg: 'Great job! 🌟', sub: 'You really paid attention to the news this week!' };
    if (pct >= 0.4) return { msg: 'Nice try! 👍', sub: 'Keep reading the news and you\'ll be a quiz champ!' };
    return { msg: 'Good effort! 💪', sub: 'Everyone starts somewhere — try again and learn something new!' };
  }
  if (ageGroup === 'teens') {
    if (pct === 1) return { msg: 'Flawless! 🔥', sub: 'You\'re basically a walking newspaper. Legendary.' };
    if (pct >= 0.7) return { msg: 'Solid score! 👏', sub: 'You\'re clearly keeping up with the news.' };
    if (pct >= 0.4) return { msg: 'Not bad!', sub: 'Catch up on the weekly highlights and crush it next time.' };
    return { msg: 'Room to grow 📈', sub: 'Try skimming the headlines each day — it adds up!' };
  }
  if (pct === 1) return { msg: 'Perfect! Outstanding! 🏆', sub: 'A flawless performance. You\'re impressively well-informed.' };
  if (pct >= 0.8) return { msg: 'Excellent! 🌟', sub: 'You\'ve got a great grasp of this week\'s news.' };
  if (pct >= 0.6) return { msg: 'Good effort! 👍', sub: 'Solid knowledge — a few slipped past you this week.' };
  if (pct >= 0.4) return { msg: 'Decent attempt', sub: 'The news moves fast. Keep up and try again!' };
  return { msg: 'Better luck next week!', sub: 'Maybe it was a quieter news week for you. Come back soon!' };
}

function scoreColor(pct) {
  if (pct >= 0.8) return 'var(--green)';
  if (pct >= 0.5) return '#facc15';
  return 'var(--red)';
}

export default function Scoreboard({ quiz, answers, config, onPlayAgain }) {
  const correct = answers.filter((a) => a.selected === a.correct).length;
  const total = answers.length;
  const pct = total > 0 ? correct / total : 0;
  const { msg, sub } = getMessage(correct, total, config?.ageGroup || 'adults');
  const color = scoreColor(pct);
  const questions = quiz.questions || [];

  return (
    <div className="card">
      <div
        className="score-circle"
        style={{ borderColor: color, color }}
      >
        <span className="score-number">{correct}</span>
        <span className="score-total">/ {total}</span>
      </div>

      <div className="score-message">{msg}</div>
      <div className="score-sub">{sub}</div>

      <div className="section-label" style={{ marginBottom: '0.75rem' }}>Answers Review</div>
      <div className="answers-review">
        {answers.map((a, i) => {
          const isCorrect = a.selected === a.correct;
          const q = questions.find((q) => q.id === a.questionId) || questions[i];
          return (
            <div key={i} className="review-item">
              <span className="review-icon">{isCorrect ? '✅' : '❌'}</span>
              <span className="review-q">
                {q?.question || `Question ${i + 1}`}
                {!isCorrect && q && (
                  <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--muted)', marginTop: '2px' }}>
                    Correct: {q.options[q.correctIndex]}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      <div className="action-row">
        <button className="btn btn-primary" onClick={onPlayAgain}>
          🔄 Play Again
        </button>
      </div>
    </div>
  );
}
