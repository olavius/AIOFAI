import { useState, useEffect } from 'react';

const CATEGORIES = [
  { id: 'general', label: 'General', icon: '🌍' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
  { id: 'technology', label: 'Tech', icon: '💻' },
  { id: 'entertainment', label: 'Fun & Arts', icon: '🎬' },
  { id: 'science', label: 'Science', icon: '🔬' },
  { id: 'business', label: 'Business', icon: '💼' },
];

const AGE_GROUPS = [
  { id: 'kids', label: 'Kids', sub: 'Ages 6–12', icon: '🧒' },
  { id: 'teens', label: 'Teens', sub: 'Ages 13–17', icon: '🧑' },
  { id: 'adults', label: 'Adults', sub: 'Ages 18+', icon: '👩' },
];

// Convert a country code to a human-readable name using the Intl API
function countryName(code) {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code.toUpperCase()) || code;
  } catch {
    return code;
  }
}

// Reverse-geocode lat/lon to country code via a free API (no key needed)
async function reverseGeocode(lat, lon) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
    { headers: { 'Accept-Language': 'en' } }
  );
  const data = await res.json();
  return {
    city: data.address?.city || data.address?.town || data.address?.village || '',
    country: countryName(data.address?.country_code || ''),
    countryCode: data.address?.country_code || 'us',
  };
}

export default function Setup({ onQuizReady }) {
  const [location, setLocation] = useState(null);
  const [locStatus, setLocStatus] = useState('idle'); // idle | detecting | ok | error
  const [category, setCategory] = useState('general');
  const [ageGroup, setAgeGroup] = useState('adults');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    detectLocation();
  }, []);

  async function detectLocation() {
    if (!navigator.geolocation) {
      setLocStatus('error');
      setLocation({ city: '', country: 'United States', countryCode: 'us' });
      return;
    }

    setLocStatus('detecting');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const loc = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          setLocation(loc);
          setLocStatus('ok');
        } catch {
          setLocStatus('error');
          setLocation({ city: '', country: 'United States', countryCode: 'us' });
        }
      },
      () => {
        setLocStatus('error');
        setLocation({ city: '', country: 'United States', countryCode: 'us' });
      }
    );
  }

  async function handleStart() {
    if (!location) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country: location.countryCode,
          category,
          ageGroup,
          location,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Server error');
      }

      const quiz = await res.json();
      onQuizReady(quiz, { category, ageGroup, location });
    } catch (err) {
      setError(err.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const locationLabel = () => {
    if (locStatus === 'detecting') return 'Detecting your location…';
    if (locStatus === 'error') return 'Could not detect — using default (US)';
    if (location?.city) return `${location.city}, ${location.country}`;
    if (location?.country) return location.country;
    return 'Location unknown';
  };

  const dotClass = locStatus === 'ok' ? 'dot-green' : locStatus === 'detecting' ? 'dot-yellow' : 'dot-red';

  if (loading) {
    return (
      <div className="card">
        <div className="loading-wrap">
          <div className="spinner" />
          <p>Fetching local news &amp; crafting your quiz…</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.5 }}>This may take a few seconds</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      {/* Location */}
      <div className="section-label">📍 Your Location</div>
      <div className="location-status">
        <span className={`dot ${dotClass}`} />
        <span>{locationLabel()}</span>
        {locStatus !== 'detecting' && (
          <button
            className="btn btn-ghost"
            style={{ marginLeft: 'auto', padding: '0.25rem 0.6rem', fontSize: '0.78rem' }}
            onClick={detectLocation}
          >
            Retry
          </button>
        )}
      </div>

      {/* Category */}
      <div className="section-label">📂 Category</div>
      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            className={`chip ${category === c.id ? 'selected' : ''}`}
            onClick={() => setCategory(c.id)}
          >
            <span className="chip-icon">{c.icon}</span>
            {c.label}
          </button>
        ))}
      </div>

      {/* Age group */}
      <div className="section-label">🎯 Age Group</div>
      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        {AGE_GROUPS.map((a) => (
          <button
            key={a.id}
            className={`chip ${ageGroup === a.id ? 'selected' : ''}`}
            onClick={() => setAgeGroup(a.id)}
          >
            <span className="chip-icon">{a.icon}</span>
            {a.label}
            <span className="chip-label">{a.sub}</span>
          </button>
        ))}
      </div>

      {error && <div className="error-box">{error}</div>}

      <button
        className="btn btn-primary"
        onClick={handleStart}
        disabled={locStatus === 'detecting' || !location}
      >
        🎮 Start Quiz
      </button>
    </div>
  );
}
