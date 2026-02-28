import axios from 'axios';

const BASE_URL = 'https://newsapi.org/v2';

// Map broad category names to NewsAPI categories
const CATEGORY_MAP = {
  general: 'general',
  sports: 'sports',
  technology: 'technology',
  entertainment: 'entertainment',
  science: 'science',
  business: 'business',
};

function getLastWeekDate() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().split('T')[0];
}

export async function fetchNews({ country, category = 'general' }) {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey || apiKey === 'your_newsapi_key_here') {
    // Return mock articles so the app works without a key
    return getMockArticles(category);
  }

  const newsCategory = CATEGORY_MAP[category] || 'general';
  const from = getLastWeekDate();

  try {
    // Try top-headlines with country filter first
    const response = await axios.get(`${BASE_URL}/top-headlines`, {
      params: {
        country: country || 'us',
        category: newsCategory,
        pageSize: 20,
        apiKey,
      },
    });

    const articles = response.data.articles.filter(
      (a) => a.title && a.description && a.title !== '[Removed]'
    );

    if (articles.length >= 5) return articles;

    // Fall back to everything search with location keyword
    const fallback = await axios.get(`${BASE_URL}/everything`, {
      params: {
        q: country || 'world',
        from,
        sortBy: 'publishedAt',
        language: 'en',
        pageSize: 20,
        apiKey,
      },
    });

    return fallback.data.articles.filter(
      (a) => a.title && a.description && a.title !== '[Removed]'
    );
  } catch (err) {
    console.error('NewsAPI error:', err.message);
    return getMockArticles(category);
  }
}

function getMockArticles(category) {
  const mocks = {
    sports: [
      { title: 'Local Team Wins Championship After Dramatic Final', description: 'The home team clinched the regional championship title in an overtime thriller, defeating their rivals 3-2 in the final minutes of the game.' },
      { title: 'Star Athlete Sets New National Record at Weekend Meet', description: 'A young athlete shattered the national record in the 400m sprint, finishing with a time that surprised even the most experienced coaches.' },
      { title: 'City Marathon Draws Record 25,000 Participants', description: 'This year\'s city marathon saw participation numbers hit an all-time high, with runners from over 40 countries taking part in the event.' },
      { title: 'Youth Soccer Program Receives Major Funding Boost', description: 'A local nonprofit announced a significant grant to expand youth soccer programs, aiming to reach underserved communities across the region.' },
      { title: 'Tennis Open Produces Shocking Upsets in Early Rounds', description: 'Several top-seeded players were eliminated in early rounds of the regional tennis open, leaving the bracket wide open for emerging talent.' },
    ],
    technology: [
      { title: 'City Launches Free Public Wi-Fi in Downtown Districts', description: 'The municipal government unveiled a new initiative to provide free high-speed internet across the central business district and major parks.' },
      { title: 'Local Startup Raises $10M to Develop AI-Powered Health App', description: 'A homegrown tech startup secured major funding to build an artificial intelligence platform that helps patients track chronic conditions.' },
      { title: 'Schools Pilot New Coding Curriculum for Elementary Students', description: 'Several primary schools began testing a new computer science curriculum designed to introduce basic programming concepts to children as young as six.' },
      { title: 'Electric Vehicle Charging Stations Installed Across Region', description: 'Dozens of new EV charging points went live this week as part of a government push to support the transition to electric transportation.' },
      { title: 'Cybersecurity Alert Issued for Popular Local Business Software', description: 'Authorities warned businesses using a widely adopted accounting platform to update their systems after a vulnerability was discovered.' },
    ],
    entertainment: [
      { title: 'Blockbuster Film Breaks Opening Weekend Box Office Records', description: 'The latest superhero sequel shattered domestic box office records, earning over $200 million in its opening weekend alone.' },
      { title: 'Music Festival Announces Surprise Headliner for Summer Event', description: 'Organizers of the annual summer music festival revealed a surprise headline act, sending ticket sales soaring within hours of the announcement.' },
      { title: 'Local Theater Company Wins Regional Arts Award', description: 'A community theater celebrated a prestigious regional arts prize for their innovative adaptation of a classic play set in a futuristic world.' },
      { title: 'Streaming Platform Releases Most-Watched Series of the Year', description: 'A new drama series broke streaming records in its first week, attracting millions of viewers across more than 60 countries simultaneously.' },
      { title: 'Celebrity Couple Announces Surprise Wedding', description: 'Two well-known entertainers surprised fans by announcing they had quietly married in a private ceremony over the weekend.' },
    ],
    science: [
      { title: 'Researchers Discover New Species of Deep-Sea Fish', description: 'Marine biologists announced the discovery of a previously unknown species of bioluminescent fish found at depths exceeding 3,000 meters.' },
      { title: 'Climate Study Shows Regional Temperatures Rising Faster Than Average', description: 'A new report from climate scientists indicates that average temperatures in the region have increased at twice the global average rate over the past decade.' },
      { title: 'University Team Develops Biodegradable Plastic Alternative', description: 'Scientists at a local university unveiled a new plant-based material that degrades in weeks rather than centuries, offering a potential solution to plastic pollution.' },
      { title: 'Solar Eclipse Visible Across Region Next Month', description: 'Astronomers are reminding residents to prepare for a partial solar eclipse that will be visible from most of the region on a clear day next month.' },
      { title: 'Breakthrough in Battery Technology Could Double EV Range', description: 'A research team announced a new battery chemistry that could significantly increase the driving range of electric vehicles at a lower manufacturing cost.' },
    ],
    business: [
      { title: 'Major Retailer Opens Flagship Store in City Center', description: 'A global retail brand officially opened its largest regional outlet, creating hundreds of local jobs and expected to boost foot traffic downtown.' },
      { title: 'Unemployment Rate Hits Five-Year Low in Monthly Report', description: 'The latest government figures show the unemployment rate dropped to its lowest level in five years, driven by growth in technology and services sectors.' },
      { title: 'Local Farmers Market Expands to New Neighborhoods', description: 'The popular weekly farmers market announced it will open two additional locations, giving more residents access to locally grown produce and artisan goods.' },
      { title: 'Housing Prices Continue to Rise Despite Higher Interest Rates', description: 'Property values climbed for the eighth consecutive month, frustrating first-time buyers even as mortgage rates remain at their highest levels in years.' },
      { title: 'Small Business Grants Program Receives Record Applications', description: 'A government small business support fund received three times as many applications as last year, reflecting strong entrepreneurial activity in the region.' },
    ],
    general: [
      { title: 'City Council Approves New Green Space Development Plan', description: 'Local government voted to approve a landmark urban greening project that will add 15 new parks and expand existing green corridors across the city.' },
      { title: 'Community Volunteers Break Record for Annual Food Drive', description: 'This year\'s food drive collected more than 50,000 cans and packages, surpassing the previous record and ensuring supplies for local food banks through winter.' },
      { title: 'New Public Library Branch Opens in Underserved Neighborhood', description: 'A state-of-the-art library facility opened its doors, offering digital resources, meeting rooms, and after-school programs to thousands of nearby residents.' },
      { title: 'Road Reconstruction Project to Begin on Main Corridor', description: 'Authorities announced a major infrastructure overhaul of the city\'s busiest road, which is expected to last six months and significantly improve traffic flow.' },
      { title: 'Local Schools Report Improved Standardized Test Scores', description: 'Annual education data shows measurable gains in literacy and numeracy across public schools, attributed to new teaching support programs introduced last year.' },
    ],
  };

  return (mocks[category] || mocks.general).map((a) => ({
    ...a,
    publishedAt: new Date().toISOString(),
    source: { name: 'Demo News' },
  }));
}
