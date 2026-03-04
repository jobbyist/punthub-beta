import { useState, useEffect, useRef } from "react";
import {
  fetchPolymarketEvents,
  fetchPolymarketP2PScenarios,
  rollForwardDate } from "./services/polymarket.js";

// ─── SVG LOGO ────────────────────────────────────────────────────────────────
const PuntHubLogo = ({ size = 40, showText = true }) => (
  <svg viewBox="0 0 200 52" height={size} style={{ display: "block" }} xmlns="http://www.w3.org/2000/svg">
    {/* Icon - dartboard-style target */}
    <circle cx="26" cy="26" r="24" fill="#4361EE" />
    <circle cx="26" cy="26" r="16" fill="rgba(0,0,0,0.25)" />
    <circle cx="26" cy="26" r="9" fill="rgba(255,255,255,0.2)" />
    <circle cx="26" cy="26" r="4" fill="#fff" />
    {/* Arrow */}
    <line x1="38" y1="14" x2="26" y2="26" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
    <polygon points="40,11 34,13 38,17" fill="#fff"/>
    {showText && <>
      {/* punt - medium */}
      <text x="56" y="36" fontFamily="'Inter', sans-serif" fontWeight="600" fontSize="26" fill="#4361EE" letterSpacing="0.5">punt</text>
      {/* hub - bold */}
      <text x="101" y="36" fontFamily="'Inter', sans-serif" fontWeight="800" fontSize="26" fill="#0A0A2E" letterSpacing="0.5">hub</text>
    </>}
  </svg>
);

const PuntHubLogoDark = ({ size = 40, showText = true }) => (
  <svg viewBox="0 0 200 52" height={size} style={{ display: "block" }} xmlns="http://www.w3.org/2000/svg">
    <circle cx="26" cy="26" r="24" fill="#4361EE" />
    <circle cx="26" cy="26" r="16" fill="rgba(0,0,0,0.25)" />
    <circle cx="26" cy="26" r="9" fill="rgba(255,255,255,0.2)" />
    <circle cx="26" cy="26" r="4" fill="#fff" />
    <line x1="38" y1="14" x2="26" y2="26" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
    <polygon points="40,11 34,13 38,17" fill="#fff"/>
    {showText && <>
      <text x="56" y="36" fontFamily="'Inter', sans-serif" fontWeight="600" fontSize="26" fill="rgba(255,255,255,0.7)" letterSpacing="0.5">punt</text>
      <text x="101" y="36" fontFamily="'Inter', sans-serif" fontWeight="800" fontSize="26" fill="#fff" letterSpacing="0.5">hub</text>
    </>}
  </svg>
);

// ─── DATA ────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "sports", label: "Sports", icon: "⚽", color: "#00E5FF" },
  { id: "politics", label: "Politics", icon: "🏛️", color: "#E84855" },
  { id: "crypto", label: "Crypto", icon: "₿", color: "#FFD700" },
  { id: "tech", label: "Tech", icon: "🤖", color: "#A855F7" },
  { id: "music", label: "Music", icon: "🎵", color: "#EC4899" },
  { id: "celebrity", label: "Celebrity", icon: "⭐", color: "#F59E0B" },
  { id: "weather", label: "Weather", icon: "🌩️", color: "#38BDF8" },
  { id: "trivia", label: "Trivia", icon: "🧠", color: "#34D399" },
  { id: "history", label: "History", icon: "📜", color: "#FB7185" },
  { id: "markets", label: "Markets", icon: "📈", color: "#10B981" },
  { id: "trending", label: "Trending", icon: "🔥", color: "#FF4444" },
  { id: "breaking", label: "Breaking News", icon: "📰", color: "#FF8C00" },
  { id: "popcult", label: "Pop Culture", icon: "🎭", color: "#FF69B4" },
  { id: "movies", label: "Movies & TV", icon: "🎬", color: "#9B59B6" },
  { id: "gaming", label: "Gaming", icon: "🕹️", color: "#2ECC71" },
  { id: "science", label: "Science", icon: "🔬", color: "#1ABC9C" },
];

const EVENTS = [
  { id: 1, cat: "sports", title: "Champions League Final Winner 2025", desc: "Which team lifts the trophy in Munich?", options: ["Real Madrid", "Man City", "Arsenal", "Bayern Munich"], points: 800, ends: "2025-05-31", difficulty: "Hard", votes: [4200, 3100, 1800, 2900], trending: true },
  { id: 2, cat: "sports", title: "NBA MVP 2024-25 Season", desc: "Who takes home the Most Valuable Player award?", options: ["Nikola Jokić", "Shai G-A", "Jayson Tatum", "LeBron James"], points: 600, ends: "2025-06-15", difficulty: "Medium", votes: [5100, 4300, 2200, 1800], trending: true },
  { id: 3, cat: "sports", title: "Wimbledon Men's Singles Champion", desc: "Who wins on the grass courts?", options: ["Alcaraz", "Djokovic", "Sinner", "Zverev"], points: 500, ends: "2025-07-13", difficulty: "Medium", votes: [3800, 2900, 3200, 1400] },
  { id: 4, cat: "sports", title: "Super Bowl LX Winner", desc: "Predict the 2026 Super Bowl champion", options: ["KC Chiefs", "Eagles", "Lions", "49ers"], points: 1000, ends: "2026-02-01", difficulty: "Hard", votes: [6200, 4100, 2800, 3500], trending: true },
  { id: 5, cat: "politics", title: "2025 Australian Federal Election", desc: "Which party wins majority in the House?", options: ["Labor", "Liberal-National", "Greens", "Hung Parliament"], points: 700, ends: "2025-05-03", difficulty: "Medium", votes: [4800, 4200, 1200, 2100] },
  { id: 6, cat: "politics", title: "Germany Federal Chancellor 2025", desc: "Who leads Germany's new government?", options: ["Friedrich Merz", "Olaf Scholz", "Robert Habeck", "Coalition Deal"], points: 600, ends: "2025-04-30", difficulty: "Medium", votes: [5200, 1800, 2100, 1500] },
  { id: 7, cat: "politics", title: "UN AI Regulation Resolution", desc: "Will the UN pass binding AI regulation by end of 2025?", options: ["Yes, binding", "Non-binding only", "No resolution", "Postponed to 2026"], points: 900, ends: "2025-12-31", difficulty: "Hard", votes: [2100, 3800, 2900, 1200] },
  { id: 8, cat: "crypto", title: "Bitcoin Price End of 2025", desc: "What price range will BTC close Q4 2025?", options: ["$150k-$200k", "$100k-$150k", "$200k+", "Below $100k"], points: 1200, ends: "2025-12-31", difficulty: "Hard", votes: [4200, 5100, 2800, 1900], trending: true },
  { id: 9, cat: "crypto", title: "Ethereum ETF Daily Inflows Peak", desc: "Will ETH ETF daily inflows exceed $1B in 2025?", options: ["Yes, before June", "Yes, in H2 2025", "No, under $1B", "ETF revoked"], points: 800, ends: "2025-12-31", difficulty: "Hard", votes: [2900, 3400, 2200, 400] },
  { id: 10, cat: "markets", title: "S&P 500 End of Year 2025", desc: "Where does the S&P 500 close in December 2025?", options: ["Above 6,500", "5,500-6,500", "4,500-5,500", "Below 4,500"], points: 700, ends: "2025-12-31", difficulty: "Medium", votes: [3100, 4200, 2800, 900] },
  { id: 11, cat: "markets", title: "Gold Price Hits $3,500/oz?", desc: "Will gold breach the $3,500 per ounce milestone?", options: ["Yes, before July", "Yes, in H2", "Touches but retreats", "No"], points: 600, ends: "2025-12-31", difficulty: "Medium", votes: [2400, 3100, 1800, 2900] },
  { id: 12, cat: "tech", title: "First AGI Announcement", desc: "Which company officially claims AGI first?", options: ["OpenAI", "Google DeepMind", "Anthropic", "None in 2025"], points: 1500, ends: "2025-12-31", difficulty: "Hard", votes: [5800, 4200, 3100, 6900], trending: true },
  { id: 13, cat: "tech", title: "Apple's First Foldable Device", desc: "When does Apple launch its first foldable?", options: ["Late 2025", "Early 2026", "Mid 2026", "Not before 2027"], points: 700, ends: "2025-12-31", difficulty: "Medium", votes: [2100, 3800, 2900, 4200] },
  { id: 14, cat: "tech", title: "Biggest Tech IPO of 2025", desc: "Which company will have the largest tech IPO?", options: ["Stripe", "SpaceX", "OpenAI", "Databricks"], points: 800, ends: "2025-12-31", difficulty: "Hard", votes: [3200, 5100, 4800, 2100] },
  { id: 15, cat: "music", title: "Grammy Album of the Year 2026", desc: "Which album takes the top Grammy prize?", options: ["Kendrick Lamar", "Beyoncé", "Taylor Swift", "Billie Eilish"], points: 600, ends: "2026-02-01", difficulty: "Medium", votes: [4800, 3900, 5200, 2800], trending: true },
  { id: 16, cat: "music", title: "Coachella 2026 Headliner", desc: "Who tops the Coachella 2026 lineup?", options: ["Drake", "The Weeknd", "Bad Bunny", "Kanye West"], points: 500, ends: "2025-09-30", difficulty: "Medium", votes: [3100, 4200, 3800, 2900] },
  { id: 17, cat: "celebrity", title: "Met Gala 2025 Best Dressed", desc: "Who wins the internet with the most iconic look?", options: ["Zendaya", "Rihanna", "Kim Kardashian", "Dua Lipa"], points: 400, ends: "2025-05-05", difficulty: "Easy", votes: [6200, 5100, 3800, 4900], trending: true },
  { id: 18, cat: "celebrity", title: "Next James Bond Actor", desc: "Who will be officially announced as the next 007?", options: ["Aaron Taylor-Johnson", "Regé-Jean Page", "Tom Hardy", "Idris Elba"], points: 700, ends: "2025-12-31", difficulty: "Medium", votes: [4800, 3200, 3900, 2800] },
  { id: 19, cat: "weather", title: "2025 Atlantic Hurricane Season", desc: "How many Category 4+ hurricanes hit US mainland?", options: ["0", "1-2", "3-4", "5+"], points: 600, ends: "2025-11-30", difficulty: "Hard", votes: [1800, 4200, 3100, 1400] },
  { id: 20, cat: "weather", title: "Summer 2025 UK Heatwave", desc: "Will the UK record a temp above 40°C this summer?", options: ["Yes, before August", "Yes, in August", "No, under 38°C", "42°C+"], points: 500, ends: "2025-09-01", difficulty: "Medium", votes: [2100, 2800, 4200, 900] },
  { id: 21, cat: "trivia", title: "Which planet has the most moons?", desc: "As of current astronomical records", options: ["Saturn", "Jupiter", "Uranus", "Neptune"], points: 200, ends: "2025-06-30", difficulty: "Easy", votes: [8200, 6100, 2800, 1900] },
  { id: 22, cat: "trivia", title: "Oldest capital city in the world?", desc: "Which city holds the record as oldest continuously inhabited capital?", options: ["Damascus", "Athens", "Cairo", "Jerusalem"], points: 300, ends: "2025-06-30", difficulty: "Medium", votes: [4200, 2900, 3800, 2100] },
  { id: 23, cat: "history", title: "What ended the Cold War?", desc: "Which event is historically considered the definitive end?", options: ["Berlin Wall (1989)", "USSR Dissolved (1991)", "German Reunification", "Malta Summit (1989)"], points: 350, ends: "2025-06-30", difficulty: "Medium", votes: [5800, 7200, 3100, 1400] },
  { id: 24, cat: "history", title: "Next UNESCO World Heritage Site", desc: "Which site receives UNESCO status in 2025's announcement?", options: ["Babylon, Iraq", "Inca Qhapaq Ñan", "Silk Road extension", "Surprise nomination"], points: 400, ends: "2025-07-31", difficulty: "Hard", votes: [1800, 2100, 1400, 2800] },
  { id: 25, cat: "trending", title: "Most Viral Moment of 2025", desc: "What will dominate social media timelines in 2025?", options: ["AI deepfake scandal", "Sports upset", "Celebrity feud", "Political gaffe"], points: 500, ends: "2025-12-31", difficulty: "Medium", votes: [3200, 4100, 5800, 2900], trending: true },
  { id: 26, cat: "trending", title: "Next Platform to Surpass 1B Users", desc: "Which platform hits 1 billion monthly users next?", options: ["Threads", "Bluesky", "Mastodon", "BeReal"], points: 700, ends: "2025-12-31", difficulty: "Hard", votes: [5200, 3100, 1400, 900], trending: true },
  { id: 27, cat: "breaking", title: "Next G7 Emergency Summit Topic", desc: "What crisis will force an emergency G7 meeting in 2025?", options: ["AI Regulation", "Middle East Escalation", "Global Recession", "Climate Disaster"], points: 900, ends: "2025-12-31", difficulty: "Hard", votes: [4100, 5800, 3200, 2900] },
  { id: 28, cat: "breaking", title: "Next Major Cyber Attack Target", desc: "Which sector faces the largest cyberattack of 2025?", options: ["Financial System", "Power Grid", "Healthcare", "Government"], points: 800, ends: "2025-12-31", difficulty: "Hard", votes: [5100, 2800, 3900, 4200] },
  { id: 29, cat: "popcult", title: "Biggest Fashion Trend of 2025", desc: "What dominates street style and runways in 2025?", options: ["Y2K revival", "Gorpcore 2.0", "Quiet luxury", "Maximalism"], points: 400, ends: "2025-12-31", difficulty: "Easy", votes: [4800, 2100, 5900, 3200], trending: true },
  { id: 30, cat: "popcult", title: "Most Followed New Celebrity of 2025", desc: "Who becomes the breakout social media star of the year?", options: ["AI-generated influencer", "Sports rookie", "Reality TV star", "Indie musician"], points: 500, ends: "2025-12-31", difficulty: "Medium", votes: [3900, 4200, 5100, 2800] },
  { id: 31, cat: "movies", title: "Highest Grossing Film 2025", desc: "Which film tops the global box office in 2025?", options: ["Avatar 3", "Marvel Phase 6", "Mission Impossible 8", "Minecraft Movie"], points: 600, ends: "2025-12-31", difficulty: "Medium", votes: [4200, 5800, 2100, 3900], trending: true },
  { id: 32, cat: "movies", title: "Oscar Best Picture 2026", desc: "Which 2025 release wins Best Picture at the 2026 Oscars?", options: ["A24 Drama", "Christopher Nolan Epic", "International Film", "Biographical Film"], points: 800, ends: "2026-03-01", difficulty: "Hard", votes: [4800, 6200, 3100, 2900] },
  { id: 33, cat: "movies", title: "Next Big Netflix Original", desc: "What genre dominates Netflix's biggest hit of 2025?", options: ["True Crime", "Fantasy Epic", "Political Thriller", "Sci-Fi Series"], points: 500, ends: "2025-12-31", difficulty: "Medium", votes: [3200, 5100, 4200, 3800] },
  { id: 34, cat: "gaming", title: "Game of the Year 2025", desc: "Which game wins the most prestigious GOTY award?", options: ["GTA VI", "Elder Scrolls VI", "Fable Reboot", "Metroid Prime 4"], points: 900, ends: "2025-12-31", difficulty: "Hard", votes: [8200, 3100, 2800, 4200], trending: true },
  { id: 35, cat: "gaming", title: "Next Console War Winner", desc: "Which console leads in sales by end of 2025?", options: ["PS5 Pro", "Xbox Series X2", "Nintendo Switch 2", "Steam Deck 2"], points: 700, ends: "2025-12-31", difficulty: "Medium", votes: [4200, 2100, 7800, 1900] },
  { id: 36, cat: "science", title: "First Human Mars Mission Date", desc: "When will the first crewed Mars mission launch?", options: ["2026", "2027-2028", "2029-2030", "After 2030"], points: 1000, ends: "2025-12-31", difficulty: "Hard", votes: [1800, 3200, 4900, 5100] },
  { id: 37, cat: "science", title: "Breakthrough Cancer Treatment 2025", desc: "Which therapy achieves the biggest clinical milestone?", options: ["mRNA Vaccines", "CAR-T Cell", "CRISPR Gene Edit", "AI-designed Drug"], points: 800, ends: "2025-12-31", difficulty: "Hard", votes: [4200, 3800, 5100, 4900] },
];

const P2P_SCENARIOS = [
  { q: "Who will win this coin flip?", options: ["Heads", "Tails"] },
  { q: "Which team wins the next Champions League match tonight?", options: ["Home Team", "Away Team"] },
  { q: "Will Bitcoin be above $100k at midnight UTC tonight?", options: ["Yes", "No"] },
  { q: "Who gets eliminated next on the current reality TV season?", options: ["Contestant A", "Contestant B"] },
  { q: "Will the stock market close up or down today?", options: ["Up", "Down"] },
  { q: "Who scores first in the next major football match?", options: ["Player A", "Player B"] },
  { q: "Will there be major breaking news in the next 24h?", options: ["Yes", "No"] },
  { q: "Who wins the next award show's biggest prize?", options: ["Favorite", "Underdog"] },
  { q: "Which crypto gains more % today?", options: ["Bitcoin", "Ethereum"] },
  { q: "Will the weather forecast be correct tomorrow?", options: ["Yes, accurate", "No, surprise weather"] },
  { q: "Who wins the next tennis grand slam match?", options: ["Top Seed", "Underdog"] },
  { q: "Will the next viral meme be about a person or an animal?", options: ["Person", "Animal"] },
];

const FORUM_POSTS = [
  { id: 1, cat: "crypto", author: "CryptoKing88", avatar: "₿", title: "Bitcoin $200k by EOY - realistic or hopium?", body: "With ETF inflows at record highs and halving in the rear view, $200k is on the table. Change my mind.", upvotes: 847, comments: 234, time: "2h ago", flair: "Analysis" },
  { id: 2, cat: "sports", author: "FootballNerd", avatar: "⚽", title: "Champions League predictions megathread 🏆", body: "Drop your winner predictions here. I'll start: Real Madrid in a rematch against Man City. Los Blancos always find a way.", upvotes: 1203, comments: 567, time: "4h ago", flair: "Megathread" },
  { id: 3, cat: "tech", author: "AIWatcher", avatar: "🤖", title: "The AGI race is getting wild - who's actually closest?", body: "Anthropic's latest models are genuinely shocking. But Google's infrastructure is unmatched. No clear winner yet.", upvotes: 624, comments: 189, time: "6h ago", flair: "Discussion" },
  { id: 4, cat: "celebrity", author: "PopCultureQueen", avatar: "⭐", title: "The Zendaya effect on Met Gala predictions 📈", body: "Every time she shows up it breaks the internet. The betting markets have her at -150 favorite already.", upvotes: 432, comments: 98, time: "8h ago", flair: "Hot Take" },
  { id: 5, cat: "politics", author: "PolSciProf", avatar: "🏛️", title: "German election aftermath - coalition math explained", body: "Breaking down all possible coalition scenarios and what each means for EU policy, defense spending and the economy.", upvotes: 918, comments: 312, time: "12h ago", flair: "Deep Dive" },
  { id: 6, cat: "markets", author: "GoldBull2025", avatar: "🥇", title: "Gold $3500 incoming or dead cat bounce?", body: "Geopolitical tensions, dollar weakness, central bank buying. All signals point up but the RSI is screaming overbought.", upvotes: 521, comments: 143, time: "1d ago", flair: "Technical Analysis" },
];

const REWARDS = [
  { id: 1, name: "Amazon Gift Card $25", points: 2500, category: "Gift Cards", icon: "🛒", stock: 50, sponsor: "Amazon" },
  { id: 2, name: "Netflix 3-Month Premium", points: 3500, category: "Streaming", icon: "🎬", stock: 30, sponsor: "Netflix" },
  { id: 3, name: "PuntHub Exclusive Hoodie", points: 5000, category: "Merch", icon: "👕", stock: 100, sponsor: "PuntHub" },
  { id: 4, name: "Spotify Premium 6 Months", points: 4000, category: "Music", icon: "🎵", stock: 25, sponsor: "Spotify" },
  { id: 5, name: "iPhone 16 Pro (Giveaway)", points: 15000, category: "Electronics", icon: "📱", stock: 5, sponsor: "Sponsored", giveaway: true },
  { id: 6, name: "PlayStation 5 (Raffle Entry)", points: 8000, category: "Gaming", icon: "🎮", stock: 10, sponsor: "Sponsored", giveaway: true },
  { id: 7, name: "Crypto $50 USDT", points: 6000, category: "Crypto", icon: "₿", stock: 20, sponsor: "Binance" },
  { id: 8, name: "Steam Gift Card $20", points: 2000, category: "Gaming", icon: "🎮", stock: 75, sponsor: "Steam" },
];

const LEADERBOARD = [
  { rank: 1, name: "PuntMaster_X", points: 48200, wins: 234, avatar: "🔥" },
  { rank: 2, name: "CryptoOracle", points: 41800, wins: 198, avatar: "₿" },
  { rank: 3, name: "SportsProphet", points: 38500, wins: 187, avatar: "⚽" },
  { rank: 4, name: "TechSeer99", points: 31200, wins: 156, avatar: "🤖" },
  { rank: 5, name: "MarketWizard", points: 28900, wins: 143, avatar: "📈" },
  { rank: 6, name: "GoldFinger007", points: 24100, wins: 128, avatar: "🥇" },
  { rank: 7, name: "PopCultureQ", points: 21800, wins: 119, avatar: "⭐" },
  { rank: 8, name: "NewsHound", points: 19200, wins: 98, avatar: "📰" },
  { rank: 9, name: "DataDrivenDan", points: 16700, wins: 87, avatar: "📊" },
  { rank: 10, name: "You", points: 4750, wins: 23, avatar: "😎", isUser: true },
];

const SOCIAL_TASKS = [
  { id: "instagram", label: "Follow us on Instagram", icon: "📸", platform: "Instagram", points: 150 },
  { id: "facebook", label: "Join our Facebook Group", icon: "👥", platform: "Facebook", points: 200 },
  { id: "twitter", label: "Follow us on X (Twitter)", icon: "𝕏", platform: "Twitter/X", points: 150 },
  { id: "tiktok", label: "Follow us on TikTok", icon: "🎵", platform: "TikTok", points: 150 },
  { id: "whatsapp", label: "Subscribe to WhatsApp Channel", icon: "💬", platform: "WhatsApp", points: 100 },
  { id: "share", label: "Share & Invite Friends", icon: "🔗", platform: "Share", points: 500 },
];

// ─── PREDICTION CARD ──────────────────────────────────────────────────────────
function PredictionCard({ event, onPredict, userPredictions }) {
  const [selected, setSelected] = useState(userPredictions[event.id] ?? null);
  const [showVotes, setShowVotes] = useState(userPredictions[event.id] !== undefined);
  const cat = CATEGORIES.find(c => c.id === event.cat);
  const totalVotes = event.votes.reduce((a, b) => a + b, 0);
  const diffColor = { Easy: "#34D399", Medium: "#FFD700", Hard: "#4361EE" }[event.difficulty];
  const daysLeft = Math.ceil((new Date(event.ends) - new Date()) / 86400000);

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 14,
      padding: "16px",
      position: "relative",
      overflow: "hidden",
      transition: "transform 0.2s, box-shadow 0.2s" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${cat.color}, transparent)` }} />
      {event.trending && (
        <div style={{ position: "absolute", top: 10, right: 10, background: "#4361EE", color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 20, letterSpacing: 1 }}>🔥 TRENDING</div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, paddingRight: event.trending ? 80 : 0 }}>
        <span style={{ fontSize: 16 }}>{cat.icon}</span>
        <span style={{ color: cat.color, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{cat.label}</span>
        <span style={{ marginLeft: "auto", color: diffColor, fontSize: 9, fontWeight: 700, border: `1px solid ${diffColor}44`, padding: "2px 7px", borderRadius: 20 }}>{event.difficulty}</span>
      </div>
      <h3 style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 5, lineHeight: 1.3, letterSpacing: 0.5 }}>{event.title}</h3>
      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 12, lineHeight: 1.5 }}>{event.desc}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
        {event.options.map((opt, i) => {
          const pct = Math.round(event.votes[i] / totalVotes * 100);
          const isSelected = selected === i;
          return (
            <button key={i} onClick={() => {
              if (selected === null) { setSelected(i); setShowVotes(true); onPredict(event.id, i, event.points); }
            }} style={{
              background: isSelected ? `${cat.color}22` : "rgba(255,255,255,0.03)",
              border: `1px solid ${isSelected ? cat.color : "rgba(255,255,255,0.1)"}`,
              borderRadius: 8, padding: "8px 10px",
              color: isSelected ? cat.color : "rgba(255,255,255,0.7)",
              fontSize: 11, fontWeight: 700,
              cursor: selected !== null ? "default" : "pointer",
              textAlign: "left", position: "relative", overflow: "hidden",
              transition: "all 0.2s" }}>
              {showVotes && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, background: `${cat.color}18`, width: `${pct}%`, transition: "width 0.8s ease" }} />}
              <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", gap: 4 }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{opt}</span>
                {showVotes && <span style={{ color: isSelected ? cat.color : "rgba(255,255,255,0.4)", flexShrink: 0 }}>{pct}%</span>}
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>⏰ {daysLeft}d left</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>👥 {(totalVotes / 1000).toFixed(1)}k</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 20, padding: "3px 10px" }}>
          <span style={{ fontSize: 11 }}>🏆</span>
          <span style={{ color: "#FFD700", fontWeight: 800, fontSize: 13 }}>{event.points.toLocaleString()} PP</span>
        </div>
      </div>
    </div>
  );
}

// ─── FORUM POST ───────────────────────────────────────────────────────────────
function ForumPost({ post }) {
  const [upvoted, setUpvoted] = useState(false);
  const cat = CATEGORIES.find(c => c.id === post.cat);
  return (
    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px 16px", display: "flex", gap: 12 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 36 }}>
        <button onClick={() => setUpvoted(!upvoted)} style={{ background: "none", border: "none", color: upvoted ? "#4361EE" : "rgba(255,255,255,0.3)", fontSize: 16, cursor: "pointer", padding: 0 }}>▲</button>
        <span style={{ color: upvoted ? "#4361EE" : "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 700 }}>{(post.upvotes + (upvoted ? 1 : 0)).toLocaleString()}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14 }}>{post.avatar}</span>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>u/{post.author}</span>
          <span style={{ color: cat?.color, fontSize: 9, fontWeight: 700, border: `1px solid ${cat?.color}44`, padding: "1px 6px", borderRadius: 20 }}>{post.flair}</span>
          <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, marginLeft: "auto" }}>{post.time}</span>
        </div>
        <h4 style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 5, letterSpacing: 0.3, lineHeight: 1.3 }}>{post.title}</h4>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{post.body}</p>
        <div style={{ marginTop: 8, display: "flex", gap: 12 }}>
          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10 }}>💬 {post.comments}</span>
          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, cursor: "pointer" }}>🔗 Share</span>
          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, cursor: "pointer" }}>🔖 Save</span>
        </div>
      </div>
    </div>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
const LANDING_STATS = [
  ["80+", "Live Events"],
  ["10k+", "Community Members"],
  ["500+", "Rewards Redeemed"],
  ["#1", "SA Prediction Hub"],
];

function LandingPage({ onStart }) {
  return (
    <div style={{ minHeight: "100vh", minHeight: "100dvh", background: "#f4f5f7", fontFamily: "'Inter', sans-serif", color: "#0A0A2E", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #f4f5f7; } ::-webkit-scrollbar-thumb { background: #c7c9d9; border-radius: 2px; }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        .landing-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(67,97,238,0.12); transition: all 0.25s ease; }
        .landing-card { transition: all 0.25s ease; }
        .cta-btn:hover { background: #3451d1 !important; }
      `}</style>

      {/* ── Navigation ── */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #e8e9f0", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <PuntHubLogo size={38} />
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a href="#how-it-works" style={{ color: "#5a5b7a", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>How It Works</a>
          <a href="#features" style={{ color: "#5a5b7a", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Features</a>
          <button onClick={onStart} style={{ background: "#0A0A2E", color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", letterSpacing: 0.3 }}>
            Sign Up Free →
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ padding: "72px 24px 64px", textAlign: "center", maxWidth: 820, margin: "0 auto", animation: "fadeInUp 0.5s ease" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(67,97,238,0.08)", border: "1px solid rgba(67,97,238,0.2)", borderRadius: 20, padding: "5px 14px", marginBottom: 24 }}>
          <span style={{ fontSize: 14 }}>🎯</span>
          <span style={{ color: "#4361EE", fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>THE WORLD'S MOST REWARDING PREDICTION COMMUNITY</span>
        </div>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 20, color: "#0A0A2E", letterSpacing: "-0.5px" }}>
          Predict. Win.{" "}
          <span style={{ color: "#4361EE" }}>Earn Real Rewards.</span>
        </h1>
        <p style={{ fontSize: 18, color: "#5a5b7a", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 36px", fontWeight: 400 }}>
          PuntHub is South Africa's premier prediction hub — aggregate all betting platforms, compete on live prediction markets, and redeem PuntPoints for real prizes.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={onStart} className="cta-btn" style={{ background: "#4361EE", color: "#fff", border: "none", borderRadius: 10, padding: "15px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer", letterSpacing: 0.3, boxShadow: "0 4px 20px rgba(67,97,238,0.35)" }}>
            Join Now — Become A Founding Member
          </button>
          <a href="#how-it-works" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", color: "#0A0A2E", border: "1px solid #e0e1ea", borderRadius: 10, padding: "15px 28px", fontSize: 16, fontWeight: 600, cursor: "pointer", textDecoration: "none" }}>
            See How It Works ↓
          </a>
        </div>
        {/* Stats row */}
        <div style={{ display: "flex", gap: 40, justifyContent: "center", marginTop: 56, flexWrap: "wrap" }}>
          {LANDING_STATS.map(([val, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#4361EE" }}>{val}</div>
              <div style={{ fontSize: 13, color: "#8889a8", fontWeight: 500, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" style={{ background: "#fff", padding: "64px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: "#0A0A2E", marginBottom: 10 }}>How It Works</h2>
            <p style={{ color: "#5a5b7a", fontSize: 16 }}>Three simple steps to start winning</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
            {[
              { icon: "🔍", title: "Explore", color: "#4361EE", bg: "rgba(67,97,238,0.06)", border: "rgba(67,97,238,0.15)", desc: "Browse 80+ live prediction markets across sports, crypto, politics, tech & more. Real-time markets powered by Polymarket." },
              { icon: "🎯", title: "Predict", color: "#7B2FBE", bg: "rgba(123,47,190,0.06)", border: "rgba(123,47,190,0.15)", desc: "Make your predictions and earn PuntPoints. The more accurate your picks, the higher you climb the leaderboard." },
              { icon: "🏆", title: "Win", color: "#0CB96A", bg: "rgba(12,185,106,0.06)", border: "rgba(12,185,106,0.15)", desc: "Redeem PuntPoints for Amazon gift cards, Netflix, Spotify, exclusive merch, and sponsored giveaways." },
            ].map(item => (
              <div key={item.title} className="landing-card" style={{ background: item.bg, border: `1px solid ${item.border}`, borderRadius: 16, padding: "28px 24px" }}>
                <div style={{ width: 52, height: 52, background: "#fff", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 18, boxShadow: `0 4px 16px ${item.border}` }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: item.color, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ color: "#5a5b7a", fontSize: 14, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Getting Started / Features ── */}
      <section id="features" style={{ padding: "64px 24px", background: "#f4f5f7" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: "#0A0A2E", marginBottom: 10 }}>Everything In One Place</h2>
            <p style={{ color: "#5a5b7a", fontSize: 16 }}>All the features you need to predict, compete and win</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16 }}>
            {[
              { icon: "📈", label: "Prediction Markets", badge: "POPULAR", badgeColor: "#4361EE", desc: "80+ live events across 16 categories powered by real market data.", href: "#" },
              { icon: "🤖", label: "AI Insights", badge: "PREMIUM", badgeColor: "#7B2FBE", desc: "AI-powered predictions and insights to inform your picks.", href: "#" },
              { icon: "💬", label: "Community Forum", badge: "FEATURED", badgeColor: "#0CB96A", desc: "Discuss predictions with thousands of like-minded punters.", href: "#" },
              { icon: "⚔️", label: "P2P Betting", badge: "NEW", badgeColor: "#E84855", desc: "Bet directly against friends with PuntCoins. Winner takes all.", href: "#" },
              { icon: "🛍️", label: "Rewards Store", badge: "FEATURED", badgeColor: "#F59E0B", desc: "Redeem points for gift cards, streaming, merch and more.", href: "#" },
              { icon: "🏅", label: "Leaderboard", badge: "LIVE", badgeColor: "#0CB96A", desc: "Compete with top predictors. Earn badges and bonus points.", href: "#" },
            ].map(card => (
              <div key={card.label} className="landing-card" style={{ background: "#fff", border: "1px solid #e8e9f0", borderRadius: 14, padding: "22px 18px", cursor: "pointer" }} onClick={onStart}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 28 }}>{card.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#0A0A2E" }}>{card.label}</div>
                    <span style={{ background: card.badgeColor, color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 20, letterSpacing: 0.5 }}>{card.badge}</span>
                  </div>
                </div>
                <p style={{ color: "#5a5b7a", fontSize: 13, lineHeight: 1.5 }}>{card.desc}</p>
                <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 5, color: "#4361EE", fontSize: 13, fontWeight: 600 }}>
                  <span>Explore</span><span>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Join CTA ── */}
      <section style={{ background: "#0A0A2E", padding: "72px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: "#fff", marginBottom: 12 }}>
            Join Our Community Today
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
            Sign up as a founding member and receive 500 PuntPoints instantly. Start predicting and climb the leaderboard.
          </p>
          <button onClick={onStart} className="cta-btn" style={{ background: "#4361EE", color: "#fff", border: "none", borderRadius: 10, padding: "16px 36px", fontSize: 17, fontWeight: 700, cursor: "pointer", letterSpacing: 0.3, boxShadow: "0 4px 24px rgba(67,97,238,0.4)" }}>
            Get Started — It's Free
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "#080818", padding: "24px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <PuntHubLogoDark size={32} />
        </div>
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>
          © 2025 PuntHub · <a href="#" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Privacy</a> · <a href="#" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Terms</a>
        </p>
      </footer>
    </div>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [interests, setInterests] = useState([]);
  const [completed, setCompleted] = useState({});
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [animPts, setAnimPts] = useState(null);

  const completeTask = (task) => {
    if (!completed[task.id]) {
      setCompleted(prev => ({ ...prev, [task.id]: true }));
      setEarnedPoints(p => p + task.points);
      setAnimPts(`+${task.points} PP`);
      setTimeout(() => setAnimPts(null), 1500);
    }
  };

  const basePoints = 500;

  return (
    <div style={{ minHeight: "100vh", minHeight: "100dvh", background: "#0A0A0F", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", fontFamily: "'Inter', sans-serif", overflowX: "hidden", boxSizing: "border-box" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-track { background: #0A0A0F; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        @keyframes floatUp { 0% { opacity:1; transform:translateX(-50%) translateY(0); } 100% { opacity:0; transform:translateX(-50%) translateY(-60px); } }
        @keyframes slideIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-16px); } to { opacity:1; transform:translateY(0); } }
        input:focus { outline: 1px solid rgba(67,97,238,0.5) !important; }
        input::placeholder { color: rgba(255,255,255,0.2); }
      `}</style>

      <div style={{ position: "fixed", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "min(600px, 100vw)", height: "min(600px, 100vw)", background: "radial-gradient(circle, rgba(67,97,238,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      {animPts && (
        <div style={{ position: "fixed", top: "25%", left: "50%", zIndex: 9999, color: "#FFD700", fontSize: 24, fontWeight: 900, animation: "floatUp 1.5s ease-out forwards", textShadow: "0 0 20px rgba(255,215,0,0.8)", pointerEvents: "none" }}>{animPts}</div>
      )}

      <div style={{ width: "100%", maxWidth: 520, animation: "slideIn 0.4s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <PuntHubLogoDark size={44} />
        </div>

        <div style={{ display: "flex", gap: 5, marginBottom: 24, justifyContent: "center" }}>
          {[0, 1, 2, 3].map(s => (
            <div key={s} style={{ height: 3, width: s === step ? 36 : 18, borderRadius: 2, background: s <= step ? "#4361EE" : "rgba(255,255,255,0.1)", transition: "all 0.3s" }} />
          ))}
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "24px 20px" }}>
          {step === 0 && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 6, letterSpacing: 0.5 }}>Welcome to PuntHub 🎯</h2>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 1.7, marginBottom: 24 }}>The world's most rewarding prediction community. Predict outcomes, earn PuntPoints, redeem incredible rewards.</p>
              <div style={{ marginBottom: 16 }}>
                <label style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 7, letterSpacing: 1 }}>YOUR USERNAME</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. PredictionKing99" style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, fontFamily: "'Inter', sans-serif", outline: "none" }} />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 7, letterSpacing: 1 }}>EMAIL ADDRESS</label>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" type="email" style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, fontFamily: "'Inter', sans-serif", outline: "none" }} />
              </div>
              <button onClick={() => name && email && setStep(1)} style={{ width: "100%", background: name && email ? "#4361EE" : "rgba(255,255,255,0.05)", border: "none", borderRadius: 12, padding: "13px", color: name && email ? "#fff" : "rgba(255,255,255,0.3)", fontWeight: 700, fontSize: 15, cursor: name && email ? "pointer" : "not-allowed", transition: "all 0.3s", letterSpacing: 0.5 }}>
                LET'S GO →
              </button>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 6 }}>What interests you? 🧠</h2>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginBottom: 20 }}>Pick your top categories — choose 3 or more</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
                {CATEGORIES.map(cat => {
                  const sel = interests.includes(cat.id);
                  return (
                    <button key={cat.id} onClick={() => setInterests(prev => sel ? prev.filter(i => i !== cat.id) : [...prev, cat.id])}
                      style={{ background: sel ? `${cat.color}22` : "rgba(255,255,255,0.03)", border: `1px solid ${sel ? cat.color : "rgba(255,255,255,0.08)"}`, borderRadius: 10, padding: "10px 12px", color: sel ? cat.color : "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s" }}>
                      <span>{cat.icon}</span> {cat.label}
                      {sel && <span style={{ marginLeft: "auto" }}>✓</span>}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => interests.length >= 3 && setStep(2)} style={{ width: "100%", background: interests.length >= 3 ? "#4361EE" : "rgba(255,255,255,0.05)", border: "none", borderRadius: 12, padding: "13px", color: interests.length >= 3 ? "#fff" : "rgba(255,255,255,0.3)", fontWeight: 700, fontSize: 15, cursor: interests.length >= 3 ? "pointer" : "not-allowed", transition: "all 0.3s", letterSpacing: 0.5 }}>
                {interests.length >= 3 ? "CONTINUE →" : `PICK ${3 - interests.length} MORE`}
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Earn your first PuntPoints! 🏆</h2>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>Complete optional tasks to boost your starting balance</p>
                <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 20, padding: "7px 18px" }}>
                  <span>🏆</span>
                  <span style={{ color: "#FFD700", fontWeight: 800, fontSize: 22 }}>{(basePoints + earnedPoints).toLocaleString()} PP</span>
                </div>
              </div>
              <div style={{ background: "rgba(67,97,238,0.07)", border: "1px solid rgba(67,97,238,0.2)", borderRadius: 10, padding: "11px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>🎁</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#4361EE", fontWeight: 700, fontSize: 13 }}>Welcome Bonus: +500 PP</div>
                  <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10 }}>Just for joining PuntHub!</div>
                </div>
                <span style={{ color: "#4361EE" }}>✓</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20, maxHeight: 260, overflowY: "auto" }}>
                {SOCIAL_TASKS.map(task => {
                  const done = completed[task.id];
                  return (
                    <button key={task.id} onClick={() => completeTask(task)}
                      style={{ background: done ? "rgba(52,211,153,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${done ? "#34D399" : "rgba(255,255,255,0.08)"}`, borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, cursor: done ? "default" : "pointer", transition: "all 0.2s", textAlign: "left" }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{task.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: done ? "#34D399" : "#fff", fontWeight: 600, fontSize: 13 }}>{task.label}</div>
                        <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10 }}>{task.platform}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        <span style={{ color: "#FFD700", fontWeight: 700, fontSize: 13 }}>+{task.points}</span>
                        {done ? <span style={{ color: "#34D399" }}>✓</span> : <span style={{ color: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.1)", width: 18, height: 18, borderRadius: "50%", display: "inline-block" }} />}
                      </div>
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setStep(3)} style={{ width: "100%", background: "#4361EE", border: "none", borderRadius: 12, padding: "13px", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", letterSpacing: 0.5 }}>
                {Object.keys(completed).length === 0 ? "SKIP FOR NOW →" : `CLAIM ${basePoints + earnedPoints} PP & CONTINUE →`}
              </button>
            </div>
          )}

          {step === 3 && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 56, marginBottom: 14 }}>🎯</div>
              <h2 style={{ fontSize: 30, fontWeight: 800, color: "#fff", marginBottom: 6, letterSpacing: 1 }}>YOU'RE IN, {name.toUpperCase()}!</h2>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginBottom: 20 }}>Your PuntHub journey begins now. Start predicting and climb the leaderboard.</p>
              <div style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 14, padding: "18px", marginBottom: 24 }}>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginBottom: 4, letterSpacing: 1 }}>YOUR STARTING BALANCE</div>
                <div style={{ color: "#FFD700", fontWeight: 800, fontSize: 38, letterSpacing: 2 }}>{(basePoints + earnedPoints).toLocaleString()} PP</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 24 }}>
                {[["🎯", "Predict", "Make predictions to earn PP"], ["🏆", "Compete", "Climb the leaderboard"], ["🛍️", "Redeem", "Turn points into prizes"]].map(([icon, title, desc]) => (
                  <div key={title} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "12px 8px" }}>
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: 11 }}>{title}</div>
                    <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 9, lineHeight: 1.4, marginTop: 2 }}>{desc}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => onComplete({ name, email, interests, points: basePoints + earnedPoints })} style={{ width: "100%", background: "#4361EE", border: "none", borderRadius: 12, padding: "14px", color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer", letterSpacing: 0.5 }}>
                START PREDICTING →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── COIN PACKAGES (minimum $5 per the P2P session requirement) ───────────────
const COIN_PACKAGES = [
  { id: 1, coins: 500,  price: 5.00,  label: "$5.00",  bonus: "" },
  { id: 2, coins: 1100, price: 10.00, label: "$10.00", bonus: "+100 Bonus", popular: true },
  { id: 3, coins: 2400, price: 20.00, label: "$20.00", bonus: "+400 Bonus" },
  { id: 4, coins: 6250, price: 50.00, label: "$50.00", bonus: "+1,250 Bonus" },
];

// ─── BUY COINS MODAL ──────────────────────────────────────────────────────────
function BuyCoinsModal({ onClose, onBuy }) {
  const [pkg, setPkg] = useState(COIN_PACKAGES[0]);
  const [gateway, setGateway] = useState(null); // null = select method
  const [processing, setProcessing] = useState(false);
  const [ppReady, setPPReady] = useState(false);
  const paypalRef = useRef(null);

  // ── Load PayPal SDK dynamically ──
  useEffect(() => {
    if (gateway !== "paypal") return;
    if (window.paypal) { setPPReady(true); return; }
    if (document.getElementById("paypal-sdk-script")) { setPPReady(true); return; }
    const clientId = (typeof import.meta !== "undefined" && import.meta.env?.VITE_PAYPAL_CLIENT_ID) || "sb";
    const s = document.createElement("script");
    s.id = "paypal-sdk-script";
    s.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
    s.async = true;
    s.onload = () => setPPReady(true);
    document.head.appendChild(s);
  }, [gateway]);

  // ── Render PayPal Buttons ──
  useEffect(() => {
    if (!ppReady || gateway !== "paypal" || !paypalRef.current || !window.paypal) return;
    paypalRef.current.innerHTML = "";
    window.paypal.Buttons({
      style: { layout: "vertical", color: "gold", shape: "rect", label: "pay" },
      createOrder: (_d, actions) =>
        actions.order.create({
          purchase_units: [{ amount: { value: pkg.price.toFixed(2) }, description: `${pkg.coins.toLocaleString()} PuntCoins` }] }),
      onApprove: (_d, actions) => actions.order.capture().then(() => onBuy(pkg.coins)),
      onError: (err) => console.error("PayPal error:", err) }).render(paypalRef.current);
  }, [ppReady, pkg, gateway, onBuy]);

  // ── Payfast ──
  const doPayfast = () => {
    const mid  = (typeof import.meta !== "undefined" && import.meta.env?.VITE_PAYFAST_MERCHANT_ID)  || "";
    const mkey = (typeof import.meta !== "undefined" && import.meta.env?.VITE_PAYFAST_MERCHANT_KEY) || "";
    const sandbox = (typeof import.meta !== "undefined" && import.meta.env?.VITE_PAYFAST_SANDBOX) !== "false";
    if (!mid) { demoProcess(); return; }
    const form = document.createElement("form");
    form.method = "POST";
    form.action = sandbox
      ? "https://sandbox.payfast.co.za/eng/process"
      : "https://www.payfast.co.za/eng/process";
    const fields = {
      merchant_id:  mid,
      merchant_key: mkey,
      return_url:   `${location.origin}${location.pathname}?pc_grant=${pkg.coins}`,
      cancel_url:   `${location.origin}${location.pathname}`,
      amount:       pkg.price.toFixed(2),
      item_name:    `${pkg.coins} PuntCoins — PuntHub` };
    Object.entries(fields).forEach(([k, v]) => {
      const inp = document.createElement("input");
      inp.type = "hidden"; inp.name = k; inp.value = v;
      form.appendChild(inp);
    });
    document.body.appendChild(form);
    form.submit();
  };

  // ── Coinbase Commerce ──
  const [coinbaseAwaitingConfirm, setCoinbaseAwaitingConfirm] = useState(false);
  const doCoinbase = () => {
    const checkoutId = (typeof import.meta !== "undefined" && import.meta.env?.VITE_COINBASE_CHECKOUT_ID) || "";
    if (!checkoutId) { demoProcess(); return; }
    window.open(
      `https://commerce.coinbase.com/checkout/${checkoutId}`,
      "_blank",
      "width=520,height=720,noopener"
    );
    // Show a manual confirmation button; server-side webhook verification is required in production
    setCoinbaseAwaitingConfirm(true);
  };

  // ── Magic Link (passwordless + crypto on-ramp) ──
  const [magicAwaitingConfirm, setMagicAwaitingConfirm] = useState(false);
  const doMagic = () => {
    const apiKey = (typeof import.meta !== "undefined" && import.meta.env?.VITE_MAGIC_PUBLISHABLE_KEY) || "";
    if (!apiKey) { demoProcess(); return; }
    // Open Magic's hosted on-ramp / auth page
    window.open(
      `https://auth.magic.link/send?apiKey=${encodeURIComponent(apiKey)}`,
      "_blank",
      "width=440,height=620,noopener"
    );
    // Show a manual confirmation button; production flow verifies via Magic SDK token
    setMagicAwaitingConfirm(true);
  };

  // ── Demo / sandbox fallback ──
  const demoProcess = () => {
    setProcessing(true);
    setTimeout(() => { setProcessing(false); onBuy(pkg.coins); }, 2200);
  };

  const GATEWAYS = [
    { id: "paypal",   label: "PayPal",           icon: "💳", desc: "Pay with PayPal or debit/credit card" },
    { id: "coinbase", label: "Coinbase Commerce", icon: "₿",  desc: "BTC, ETH, USDC and more" },
    { id: "payfast",  label: "Payfast",           icon: "🏦", desc: "Card, EFT, SnapScan (ZAR)" },
    { id: "magic",    label: "Magic Link",        icon: "✨", desc: "Passwordless + crypto on-ramp" },
  ];

  const btnBase = { border: "none", borderRadius: 12, padding: "14px", fontWeight: 800, fontSize: 14, cursor: "pointer", width: "100%", letterSpacing: 0.5 };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#13131A", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 20, padding: "24px 20px", width: "100%", maxWidth: 440, maxHeight: "92vh", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h2 style={{ color: "#FFD700", fontWeight: 900, fontSize: 22, letterSpacing: 1 }}>💰 BUY PUNTCOINS</h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>
              Virtual credits for P2P betting sessions • Min. <strong style={{ color: "#FFD700" }}>$5</strong>
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 22, cursor: "pointer", flexShrink: 0 }}>✕</button>
        </div>

        {/* Package selector */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>SELECT PACKAGE</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {COIN_PACKAGES.map(p => (
              <button key={p.id} onClick={() => { setPkg(p); setGateway(null); }}
                style={{ background: pkg.id === p.id ? "rgba(255,215,0,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${pkg.id === p.id ? "rgba(255,215,0,0.55)" : "rgba(255,255,255,0.08)"}`, borderRadius: 12, padding: "13px 15px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", transition: "all 0.2s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 22 }}>🪙</span>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ color: "#FFD700", fontWeight: 900, fontSize: 18 }}>{p.coins.toLocaleString()} PC</span>
                      {p.popular && <span style={{ background: "#4361EE", color: "#fff", fontSize: 8, fontWeight: 900, padding: "2px 6px", borderRadius: 20, letterSpacing: 0.5 }}>POPULAR</span>}
                    </div>
                    {p.bonus && <div style={{ color: "#34D399", fontSize: 10, fontWeight: 700 }}>{p.bonus}</div>}
                  </div>
                </div>
                <div style={{ background: pkg.id === p.id ? "linear-gradient(135deg, #4361EE, #7B2FBE)" : "rgba(255,255,255,0.07)", borderRadius: 8, padding: "6px 14px", color: pkg.id === p.id ? "#000" : "rgba(255,255,255,0.6)", fontWeight: 800, fontSize: 13 }}>{p.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Payment method picker ── */}
        {!gateway && (
          <div>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>PAYMENT METHOD</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {GATEWAYS.map(g => (
                <button key={g.id} onClick={() => setGateway(g.id)}
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "14px 12px", cursor: "pointer", textAlign: "left", transition: "border-color 0.2s" }}>
                  <div style={{ fontSize: 26, marginBottom: 6 }}>{g.icon}</div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{g.label}</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, lineHeight: 1.4 }}>{g.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── PayPal ── */}
        {gateway === "paypal" && (
          <div>
            <button onClick={() => setGateway(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.45)", fontSize: 12, cursor: "pointer", marginBottom: 12, fontWeight: 700 }}>← BACK</button>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>PAY WITH PAYPAL</div>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
              <span style={{ color: "#FFD700", fontWeight: 900, fontSize: 17 }}>{pkg.coins.toLocaleString()} PC</span>
              {pkg.bonus && <span style={{ color: "#34D399", fontSize: 11, marginLeft: 8 }}>{pkg.bonus}</span>}
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginLeft: 8 }}>— {pkg.label}</span>
            </div>
            {!ppReady
              ? <div style={{ textAlign: "center", padding: "22px 0", color: "rgba(255,255,255,0.35)", fontSize: 13 }}>⏳ Loading PayPal SDK…</div>
              : <div ref={paypalRef} />
            }
          </div>
        )}

        {/* ── Coinbase Commerce ── */}
        {gateway === "coinbase" && (
          <div>
            <button onClick={() => setGateway(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.45)", fontSize: 12, cursor: "pointer", marginBottom: 12, fontWeight: 700 }}>← BACK</button>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>PAY WITH CRYPTO</div>
            <div style={{ background: "rgba(0,82,255,0.08)", border: "1px solid rgba(0,82,255,0.2)", borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 3 }}>Coinbase Commerce</div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, lineHeight: 1.5 }}>BTC · ETH · USDC · DAI · APE and more. Secure hosted checkout by Coinbase.</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "13px 15px", marginBottom: 14 }}>
              <span style={{ color: "#FFD700", fontWeight: 900, fontSize: 17 }}>{pkg.coins.toLocaleString()} PC</span>
              {pkg.bonus && <span style={{ color: "#34D399", fontSize: 11, marginLeft: 8 }}>{pkg.bonus}</span>}
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginLeft: 8 }}>— {pkg.label}</span>
            </div>
            {coinbaseAwaitingConfirm ? (
              <div>
                <div style={{ background: "rgba(0,200,0,0.07)", border: "1px solid rgba(0,200,0,0.2)", borderRadius: 10, padding: "12px 14px", marginBottom: 12, color: "rgba(255,255,255,0.6)", fontSize: 12, lineHeight: 1.5 }}>
                  Complete payment in the Coinbase Commerce window, then click below.
                </div>
                <button onClick={() => { setCoinbaseAwaitingConfirm(false); onBuy(pkg.coins); }} style={{ ...btnBase, background: "linear-gradient(135deg, #0052FF, #1652F0)", color: "#fff" }}>✅ I've Completed Payment</button>
              </div>
            ) : (
              <button onClick={doCoinbase} style={{ ...btnBase, background: "linear-gradient(135deg, #0052FF, #1652F0)", color: "#fff" }}>₿ Pay with Coinbase Commerce</button>
            )}
          </div>
        )}

        {/* ── Payfast ── */}
        {gateway === "payfast" && (
          <div>
            <button onClick={() => setGateway(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.45)", fontSize: 12, cursor: "pointer", marginBottom: 12, fontWeight: 700 }}>← BACK</button>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>PAY WITH PAYFAST</div>
            <div style={{ background: "rgba(0,160,0,0.08)", border: "1px solid rgba(0,160,0,0.2)", borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 3 }}>Payfast — South Africa</div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, lineHeight: 1.5 }}>Credit / debit card · EFT · SnapScan · Mobicred · Zapper</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "13px 15px", marginBottom: 14 }}>
              <span style={{ color: "#FFD700", fontWeight: 900, fontSize: 17 }}>{pkg.coins.toLocaleString()} PC</span>
              {pkg.bonus && <span style={{ color: "#34D399", fontSize: 11, marginLeft: 8 }}>{pkg.bonus}</span>}
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginLeft: 8 }}>— {pkg.label}</span>
            </div>
            {processing
              ? <div style={{ textAlign: "center", padding: "18px 0", color: "rgba(255,255,255,0.35)", fontSize: 13 }}>⏳ Redirecting to Payfast…</div>
              : <button onClick={doPayfast} style={{ ...btnBase, background: "linear-gradient(135deg, #00A100, #00CC00)", color: "#fff" }}>🏦 Pay with Payfast</button>
            }
          </div>
        )}

        {/* ── Magic Link ── */}
        {gateway === "magic" && (
          <div>
            <button onClick={() => setGateway(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.45)", fontSize: 12, cursor: "pointer", marginBottom: 12, fontWeight: 700 }}>← BACK</button>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>PAY WITH MAGIC</div>
            <div style={{ background: "rgba(100,0,255,0.08)", border: "1px solid rgba(100,0,255,0.22)", borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 3 }}>✨ Magic Link</div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, lineHeight: 1.5 }}>Passwordless sign-in + crypto on-ramp. Fund your wallet with a card in seconds — no seed phrase needed.</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "13px 15px", marginBottom: 14 }}>
              <span style={{ color: "#FFD700", fontWeight: 900, fontSize: 17 }}>{pkg.coins.toLocaleString()} PC</span>
              {pkg.bonus && <span style={{ color: "#34D399", fontSize: 11, marginLeft: 8 }}>{pkg.bonus}</span>}
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginLeft: 8 }}>— {pkg.label}</span>
            </div>
            {magicAwaitingConfirm ? (
              <div>
                <div style={{ background: "rgba(100,0,255,0.07)", border: "1px solid rgba(100,0,255,0.2)", borderRadius: 10, padding: "12px 14px", marginBottom: 12, color: "rgba(255,255,255,0.6)", fontSize: 12, lineHeight: 1.5 }}>
                  Complete payment in the Magic window, then click below.
                </div>
                <button onClick={() => { setMagicAwaitingConfirm(false); onBuy(pkg.coins); }} style={{ ...btnBase, background: "linear-gradient(135deg, #6400FF, #A855F7)", color: "#fff" }}>✅ I've Completed Payment</button>
              </div>
            ) : (
              <button onClick={doMagic} style={{ ...btnBase, background: "linear-gradient(135deg, #6400FF, #A855F7)", color: "#fff" }}>✨ Continue with Magic</button>
            )}
          </div>
        )}

        <p style={{ color: "rgba(255,255,255,0.15)", fontSize: 9, textAlign: "center", marginTop: 18, lineHeight: 1.5 }}>
          PuntCoins are virtual gaming credits used for P2P prediction sessions. Payments processed by the selected provider.
        </p>
      </div>
    </div>
  );
}

// ─── CREATE BET SESSION ───────────────────────────────────────────────────────
function CreateBetSession({ puntCoins, onCreated, onBuyCoins, scenarios }) {
  const p2pScenarios = scenarios && scenarios.length > 0 ? scenarios : P2P_SCENARIOS;
  const MIN_STAKE = 500; // minimum $5 worth of PuntCoins per session
  const [stake, setStake] = useState(500);
  const presets = [500, 1000, 2500, 5000, 10000];
  const [previewScenario] = useState(() => p2pScenarios[Math.floor(Math.random() * p2pScenarios.length)]);

  const createSession = () => {
    if (puntCoins < stake) { onBuyCoins(); return; }
    const scenario = p2pScenarios[Math.floor(Math.random() * p2pScenarios.length)];
    const session = {
      id: Date.now(),
      stake,
      scenario,
      createdAt: new Date().toISOString(),
      status: null,
      round: 1,
      userChoice: null,
      opponentChoice: null };
    onCreated(session);
  };

  return (
    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px 16px" }}>
      <h3 style={{ fontWeight: 800, fontSize: 16, marginBottom: 16, letterSpacing: 0.5 }}>🎯 CREATE NEW BET SESSION</h3>

      <div style={{ marginBottom: 16 }}>
        <label style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 8, letterSpacing: 1 }}>YOUR STAKE (PC)</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          {presets.map(p => (
            <button key={p} onClick={() => setStake(p)} style={{ background: stake === p ? "rgba(67,97,238,0.2)" : "rgba(255,255,255,0.03)", border: `1px solid ${stake === p ? "#4361EE" : "rgba(255,255,255,0.1)"}`, borderRadius: 8, padding: "7px 14px", color: stake === p ? "#4361EE" : "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{p}</button>
          ))}
        </div>
        <input type="number" value={stake} onChange={e => setStake(Math.max(MIN_STAKE, parseInt(e.target.value) || MIN_STAKE))} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 15, outline: "none" }} />
      </div>

      <div style={{ background: "rgba(67,97,238,0.06)", border: "1px solid rgba(67,97,238,0.15)", borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>PREVIEW SCENARIO</div>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{previewScenario.q}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          {previewScenario.options.map(opt => (
            <span key={opt} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 10px", color: "rgba(255,255,255,0.6)", fontSize: 11 }}>{opt}</span>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>Total pot if opponent joins: <strong style={{ color: "#FFD700" }}>{stake * 2} PC</strong></span>
      </div>

      <button onClick={createSession} style={{ width: "100%", background: puntCoins >= stake ? "#4361EE" : "rgba(255,255,255,0.05)", border: "none", borderRadius: 12, padding: "13px", color: puntCoins >= stake ? "#fff" : "rgba(255,255,255,0.3)", fontWeight: 800, fontSize: 15, cursor: "pointer", letterSpacing: 0.5 }}>
        {puntCoins >= stake ? `DEPLOY SESSION (${stake.toLocaleString()} PC) →` : `BUY MIN. $5 IN PUNTCOINS →`}
      </button>
    </div>
  );
}

// ─── BET SESSION ──────────────────────────────────────────────────────────────
function BetSession({ session, puntCoins, onResult, onBack }) {
  const [userChoice, setUserChoice] = useState(null);
  const [opponentJoined, setOpponentJoined] = useState(false);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setOpponentJoined(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const resolve = (choice) => {
    if (resolving) return;
    setUserChoice(choice);
    setResolving(true);
    const opponentChoice = session.scenario.options[Math.floor(Math.random() * session.scenario.options.length)];
    setTimeout(() => {
      // Randomly determine the actual outcome, then compare picks
      const actualOutcome = session.scenario.options[Math.floor(Math.random() * session.scenario.options.length)];
      const userCorrect = choice === actualOutcome;
      const opponentCorrect = opponentChoice === actualOutcome;
      // If both or neither correct, random tiebreak; otherwise the correct predictor wins
      const winner = userCorrect === opponentCorrect
        ? (Math.random() > 0.5 ? "user" : "opponent")
        : userCorrect ? "user" : "opponent";
      const updatedSession = {
        ...session,
        userChoice: choice,
        opponentChoice,
        status: winner === "user" ? "won" : "lost",
        winner };
      onResult(winner, updatedSession);
    }, 1500);
  };

  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 13, cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", gap: 6, fontWeight: 700 }}>← BACK TO LOBBY</button>

      <div style={{ background: "linear-gradient(135deg, rgba(67,97,238,0.1), rgba(255,215,0,0.05))", border: "1px solid rgba(67,97,238,0.2)", borderRadius: 16, padding: "20px 16px", marginBottom: 16, textAlign: "center" }}>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>ROUND {session.round} • LIVE BET</div>
        <div style={{ color: "#FFD700", fontWeight: 900, fontSize: 28, marginBottom: 4 }}>{session.stake * 2} PC POT</div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>Winner takes all</div>
      </div>

      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "18px 16px", marginBottom: 16 }}>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>PREDICTION SCENARIO</div>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 16, lineHeight: 1.3 }}>{session.scenario.q}</h3>

        {!opponentJoined ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Waiting for opponent to join...</div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 4 }}>Session ID: #{session.id}</div>
          </div>
        ) : (
          <div>
            <div style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 8, padding: "8px 12px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <span>✅</span>
              <span style={{ color: "#34D399", fontSize: 12, fontWeight: 700 }}>Opponent has joined! Both stakes in pool.</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {session.scenario.options.map((opt, i) => (
                <button key={i} onClick={() => !userChoice && !resolving && resolve(opt)}
                  style={{ background: userChoice === opt ? "rgba(67,97,238,0.2)" : "rgba(255,255,255,0.04)", border: `2px solid ${userChoice === opt ? "#4361EE" : "rgba(255,255,255,0.1)"}`, borderRadius: 12, padding: "16px 12px", color: userChoice === opt ? "#4361EE" : "#fff", fontWeight: 800, fontSize: 15, cursor: userChoice ? "default" : "pointer", transition: "all 0.2s", letterSpacing: 0.5 }}>
                  {opt}
                </button>
              ))}
            </div>
            {resolving && (
              <div style={{ textAlign: "center", marginTop: 16, color: "rgba(255,255,255,0.5)", fontSize: 13 }}>🎲 Resolving outcome...</div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", padding: "0 4px" }}>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>You wagered: <strong style={{ color: "#FFD700" }}>{session.stake} PC</strong></div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>To win: <strong style={{ color: "#34D399" }}>{session.stake * 2} PC</strong></div>
      </div>
    </div>
  );
}

// ─── BET RESULT ───────────────────────────────────────────────────────────────
function BetResult({ session, puntCoins, onRematch, onBack, scenarios }) {
  const p2pScenarios = scenarios && scenarios.length > 0 ? scenarios : P2P_SCENARIOS;
  const won = session.status === "won";
  const isRematch = session.round > 1;

  const startRematch = () => {
    if (puntCoins < session.stake) return;
    const usedIdx = p2pScenarios.findIndex(s => s.q === session.scenario.q);
    const safeUsedIdx = usedIdx === -1 ? 0 : usedIdx;
    const nextIdx = (safeUsedIdx + 1 + Math.floor(Math.random() * (p2pScenarios.length - 1))) % p2pScenarios.length;
    const rematchSession = {
      id: Date.now(),
      stake: session.stake,
      scenario: p2pScenarios[nextIdx],
      createdAt: new Date().toISOString(),
      status: null,
      round: session.round + 1,
      userChoice: null,
      opponentChoice: null,
      isRematch: true };
    onRematch(rematchSession);
  };

  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 13, cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", gap: 6, fontWeight: 700 }}>← BACK TO LOBBY</button>

      <div style={{ textAlign: "center", padding: "32px 16px", background: won ? "linear-gradient(135deg, rgba(52,211,153,0.1), rgba(255,215,0,0.05))" : "linear-gradient(135deg, rgba(255,100,100,0.1), rgba(255,107,53,0.05))", border: `1px solid ${won ? "rgba(52,211,153,0.3)" : "rgba(255,100,100,0.3)"}`, borderRadius: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>{won ? "🏆" : "💔"}</div>
        <h2 style={{ fontSize: 32, fontWeight: 900, color: won ? "#34D399" : "#FF6464", letterSpacing: 2, marginBottom: 8 }}>
          {won ? "YOU WIN!" : "YOU LOSE!"}
        </h2>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 16 }}>
          {won ? `You predicted correctly!` : `Better luck next time.`}
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 12, padding: "10px 20px" }}>
          <span style={{ fontSize: 20 }}>🪙</span>
          <span style={{ color: won ? "#34D399" : "#FF6464", fontWeight: 900, fontSize: 28 }}>
            {won ? `+${session.stake * 2}` : `-${session.stake}`} PC
          </span>
        </div>
      </div>

      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>ROUND SUMMARY</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{session.scenario.q}</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ background: "rgba(67,97,238,0.1)", border: "1px solid rgba(67,97,238,0.2)", borderRadius: 8, padding: "6px 12px" }}>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, letterSpacing: 1 }}>YOUR PICK</div>
            <div style={{ color: "#4361EE", fontWeight: 700, fontSize: 13 }}>{session.userChoice}</div>
          </div>
          <div style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: 8, padding: "6px 12px" }}>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, letterSpacing: 1 }}>OPPONENT</div>
            <div style={{ color: "#A855F7", fontWeight: 700, fontSize: 13 }}>{session.opponentChoice}</div>
          </div>
        </div>
      </div>

      {!isRematch && (
        <div style={{ background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 14, padding: "16px", marginBottom: 14 }}>
          <h3 style={{ fontWeight: 800, fontSize: 15, color: "#FFD700", marginBottom: 6, letterSpacing: 0.5 }}>🔁 REMATCH AVAILABLE</h3>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 14, lineHeight: 1.5 }}>
            Challenge to a final round! Both players deposit <strong style={{ color: "#FFD700" }}>{session.stake} PC</strong> again. A new scenario is generated — winner takes the entire pot of <strong style={{ color: "#34D399" }}>{session.stake * 2} PC</strong>, loser gets nothing.
          </p>
          <button onClick={startRematch} disabled={puntCoins < session.stake}
            style={{ width: "100%", background: puntCoins >= session.stake ? "linear-gradient(135deg, #7B2FBE, #4361EE)" : "rgba(255,255,255,0.05)", border: "none", borderRadius: 12, padding: "13px", color: puntCoins >= session.stake ? "#000" : "rgba(255,255,255,0.3)", fontWeight: 800, fontSize: 15, cursor: puntCoins >= session.stake ? "pointer" : "not-allowed", letterSpacing: 0.5 }}>
            {puntCoins >= session.stake ? `🔁 REMATCH (${session.stake} PC) →` : "INSUFFICIENT PC FOR REMATCH"}
          </button>
        </div>
      )}

      {isRematch && (
        <div style={{ textAlign: "center", padding: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, marginBottom: 14 }}>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>This was the final rematch round. No further rematches available.</div>
        </div>
      )}

      <button onClick={onBack} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px", color: "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: 13, cursor: "pointer", letterSpacing: 0.5 }}>
        BACK TO LOBBY
      </button>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function PuntHub() {
  const [screen, setScreen] = useState("landing");
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [predictions, setPredictions] = useState({});
  const [filterCat, setFilterCat] = useState("all");
  const [forumFilter, setForumFilter] = useState("all");
  const [notification, setNotification] = useState(null);
  const [redeemed, setRedeemed] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [puntCoins, setPuntCoins] = useState(100);
  const [showBuyCoins, setShowBuyCoins] = useState(false);
  const [bettingSessions, setBettingSessions] = useState([]);
  const [activeBetSession, setActiveBetSession] = useState(null);
  const [betStep, setBetStep] = useState("lobby");
  const [polyEvents, setPolyEvents] = useState([]);
  const [polyScenarios, setPolyScenarios] = useState([]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Fetch live prediction markets from Polymarket
  useEffect(() => {
    fetchPolymarketEvents().then(events => { if (events.length > 0) setPolyEvents(events); });
    fetchPolymarketP2PScenarios().then(scenarios => { if (scenarios.length > 0) setPolyScenarios(scenarios); });
  }, []);

  // Credit PuntCoins after Payfast redirect (return_url contains ?pc_grant=<amount>).
  // NOTE: In production, validate this param server-side (HMAC signature from Payfast ITN)
  // before crediting coins; the current client-side cap is a beta-only safeguard.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const grantedCoins = parseInt(params.get("pc_grant") || "0", 10);
    if (grantedCoins > 0 && grantedCoins <= 10000) {
      setPuntCoins(pc => pc + grantedCoins);
      setNotification({ msg: `🪙 +${grantedCoins.toLocaleString()} PuntCoins added!`, color: "#FFD700" });
      setTimeout(() => setNotification(null), 3000);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const showNotif = (msg, color = "#34D399") => {
    setNotification({ msg, color });
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePredict = (eventId, optionIdx, points) => {
    if (predictions[eventId] === undefined) {
      setPredictions(prev => ({ ...prev, [eventId]: optionIdx }));
      setUser(prev => ({ ...prev, points: prev.points + Math.round(points * 0.1) }));
      showNotif(`+${Math.round(points * 0.1)} PP wagered! Results pending 🎯`);
    }
  };

  const handleRedeem = (reward) => {
    if (user.points >= reward.points && !redeemed[reward.id]) {
      setUser(prev => ({ ...prev, points: prev.points - reward.points }));
      setRedeemed(prev => ({ ...prev, [reward.id]: true }));
      showNotif(`🎉 ${reward.name} redeemed!`, "#FFD700");
    }
  };

  if (screen === "landing") {
    return <LandingPage onStart={() => setScreen("onboarding")} />;
  }

  if (screen === "onboarding") {
    return <Onboarding onComplete={(userData) => { setUser(userData); setScreen("app"); }} />;
  }

  const filteredPosts = forumFilter === "all" ? FORUM_POSTS : FORUM_POSTS.filter(p => p.cat === forumFilter);

  // Merge Polymarket live events with date-extended static events; show only future events
  const staticEvents = EVENTS.map(e => ({ ...e, ends: rollForwardDate(e.ends) }));
  const allEvents = [...polyEvents, ...staticEvents].slice(0, 80);
  const filteredEvents = filterCat === "all" ? allEvents : allEvents.filter(e => e.cat === filterCat);

  // Merge Polymarket P2P scenarios with static fallback scenarios
  const allP2PScenarios = polyScenarios.length > 0 ? [...polyScenarios, ...P2P_SCENARIOS] : P2P_SCENARIOS;

  const TABS = [
    { id: "home", label: "Predict", icon: "🎯" },
    { id: "forum", label: "Forum", icon: "💬" },
    { id: "leaderboard", label: "Ranks", icon: "🏆" },
    { id: "rewards", label: "Rewards", icon: "🛍️" },
    { id: "bet", label: "P2P Bet", icon: "⚔️" },
    { id: "profile", label: "Profile", icon: "👤" },
  ];

  return (
    <div style={{ minHeight: "100vh", minHeight: "100dvh", background: "#0A0A0F", fontFamily: "'Inter', sans-serif", color: "#fff", display: "flex", flexDirection: "column", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; height: 3px; } ::-webkit-scrollbar-track { background: #0A0A0F; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        @keyframes slideDown { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        .tab-content { animation: fadeIn 0.25s ease; }
        button { font-family: inherit; }
      `}</style>

      {/* Notification */}
      {notification && (
        <div style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 9999, background: notification.color, color: notification.color === "#FFD700" ? "#000" : "#fff", padding: "10px 18px", borderRadius: 10, fontWeight: 700, fontSize: 13, animation: "slideDown 0.3s ease", boxShadow: `0 4px 20px ${notification.color}55`, whiteSpace: "nowrap", maxWidth: "90vw", textAlign: "center" }}>
          {notification.msg}
        </div>
      )}

      {showBuyCoins && (
        <BuyCoinsModal
          onClose={() => setShowBuyCoins(false)}
          onBuy={(coins) => {
            setPuntCoins(pc => pc + coins);
            setShowBuyCoins(false);
            showNotif(`🪙 +${coins} PuntCoins added!`, "#FFD700");
          }}
        />
      )}

      {/* Top Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(10,10,15,0.96)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "0 16px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <PuntHubLogoDark size={36} showText={!isMobile} />

        {/* Desktop tabs */}
        {!isMobile && (
          <div style={{ display: "flex", gap: 3 }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ background: activeTab === tab.id ? "rgba(67,97,238,0.15)" : "none", border: activeTab === tab.id ? "1px solid rgba(67,97,238,0.35)" : "1px solid transparent", borderRadius: 8, padding: "6px 14px", color: activeTab === tab.id ? "#6B8EFF" : "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }}>
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.25)", borderRadius: 20, padding: "5px 12px" }}>
            <span style={{ fontSize: 12 }}>🏆</span>
            <span style={{ color: "#FFD700", fontWeight: 700, fontSize: 13 }}>{user?.points?.toLocaleString()}</span>
            {!isMobile && <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>PP</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 20, padding: "5px 12px", cursor: "pointer" }} onClick={() => setShowBuyCoins(true)}>
            <span style={{ fontSize: 12 }}>🪙</span>
            <span style={{ color: "#FFD700", fontWeight: 700, fontSize: 13 }}>{puntCoins.toLocaleString()}</span>
            {!isMobile && <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>PC</span>}
          </div>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #4361EE, #7B2FBE)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", paddingBottom: isMobile ? 70 : 24 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 12px" }}>

          {/* ── HOME / PREDICT ── */}
          {activeTab === "home" && (
            <div className="tab-content">
              {/* Hero */}
              <div style={{ background: "linear-gradient(135deg, rgba(67,97,238,0.12) 0%, rgba(123,47,190,0.06) 50%, rgba(67,97,238,0.04) 100%)", border: "1px solid rgba(67,97,238,0.18)", borderRadius: 16, padding: "20px 16px", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <h1 style={{ fontSize: isMobile ? 28 : 38, fontWeight: 800, letterSpacing: 0.5, lineHeight: 1.1 }}>
                      PREDICT. WIN. <span style={{ color: "#6B8EFF" }}>EARN.</span>
                    </h1>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 4 }}>{allEvents.length} live events • Earn PuntPoints • Redeem rewards</p>
                  </div>
                  <div style={{ display: "flex", gap: 16 }}>
                    {[["🎯", Object.keys(predictions).length, "Predictions"], ["📊", allEvents.filter(e => !predictions[e.id]).length, "Open"]].map(([icon, val, label]) => (
                      <div key={label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 16 }}>{icon}</div>
                        <div style={{ fontWeight: 800, fontSize: 22, color: "#6B8EFF" }}>{val}</div>
                        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Category Filters */}
              <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 6 }}>
                <button onClick={() => setFilterCat("all")} style={{ background: filterCat === "all" ? "#4361EE" : "rgba(255,255,255,0.05)", border: "none", borderRadius: 20, padding: "7px 14px", color: filterCat === "all" ? "#fff" : "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 11, cursor: "pointer", whiteSpace: "nowrap" }}>
                  All Events
                </button>
                {CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setFilterCat(cat.id)}
                    style={{ background: filterCat === cat.id ? `${cat.color}22` : "rgba(255,255,255,0.03)", border: `1px solid ${filterCat === cat.id ? cat.color : "rgba(255,255,255,0.08)"}`, borderRadius: 20, padding: "7px 12px", color: filterCat === cat.id ? cat.color : "rgba(255,255,255,0.45)", fontWeight: 600, fontSize: 11, cursor: "pointer", whiteSpace: "nowrap", display: "flex", gap: 5, alignItems: "center", transition: "all 0.2s" }}>
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>

              {/* Events Grid */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
                {filteredEvents.map(event => (
                  <PredictionCard key={event.id} event={event} onPredict={handlePredict} userPredictions={predictions} />
                ))}
              </div>
            </div>
          )}

          {/* ── FORUM ── */}
          {activeTab === "forum" && (
            <div className="tab-content">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: isMobile ? 26 : 32, fontWeight: 800 }}>COMMUNITY <span style={{ color: "#6B8EFF" }}>FORUM</span></h2>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>Discuss predictions & share analysis</p>
                </div>
                <button onClick={() => showNotif("✍️ Post creation coming soon!")} style={{ background: "#4361EE", border: "none", borderRadius: 10, padding: "9px 16px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
                  + New Post
                </button>
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 6 }}>
                {["all", ...CATEGORIES.map(c => c.id)].map(cat => {
                  const c = CATEGORIES.find(x => x.id === cat);
                  return (
                    <button key={cat} onClick={() => setForumFilter(cat)}
                      style={{ background: forumFilter === cat ? (c ? `${c.color}22` : "rgba(67,97,238,0.15)") : "rgba(255,255,255,0.03)", border: `1px solid ${forumFilter === cat ? (c?.color || "#4361EE") : "rgba(255,255,255,0.08)"}`, borderRadius: 20, padding: "6px 12px", color: forumFilter === cat ? (c?.color || "#6B8EFF") : "rgba(255,255,255,0.4)", fontWeight: 600, fontSize: 10, cursor: "pointer", whiteSpace: "nowrap" }}>
                      {c ? `${c.icon} ${c.label}` : "All Topics"}
                    </button>
                  );
                })}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {filteredPosts.map(post => <ForumPost key={post.id} post={post} />)}
                {filteredPosts.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,0.2)", fontSize: 13 }}>No posts in this category yet.</div>}
              </div>
              <div style={{ marginTop: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 16 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 14, color: "#6B8EFF", fontSize: 16 }}>🔥 Trending Topics</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {["#Bitcoin200k", "#ChampionsLeague", "#AGI2025", "#MetGala", "#ZendayaEffect", "#NFLDraft", "#GoldAllTimeHigh", "#F1Season", "#Wimbledon", "#GrammyPredictions"].map(tag => (
                    <span key={tag} style={{ background: "rgba(67,97,238,0.1)", border: "1px solid rgba(67,97,238,0.2)", borderRadius: 20, padding: "4px 10px", color: "#6B8EFF", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── LEADERBOARD ── */}
          {activeTab === "leaderboard" && (
            <div className="tab-content">
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <h2 style={{ fontSize: isMobile ? 30 : 42, fontWeight: 800, letterSpacing: 2 }}>🏆 LEADERBOARD</h2>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Top PuntHub predictors this season</p>
              </div>

              {/* Top 3 Podium */}
              <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: isMobile ? 8 : 12, marginBottom: 24 }}>
                {[LEADERBOARD[1], LEADERBOARD[0], LEADERBOARD[2]].map((entry, i) => {
                  const heights = [isMobile ? 110 : 140, isMobile ? 140 : 175, isMobile ? 90 : 120];
                  const colors = ["#C0C0C0", "#FFD700", "#CD7F32"];
                  const ranks = [2, 1, 3];
                  return (
                    <div key={entry.rank} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <div style={{ fontSize: isMobile ? 22 : 28 }}>{entry.avatar}</div>
                      <div style={{ fontWeight: 800, fontSize: isMobile ? 10 : 12, color: "#fff", textAlign: "center", maxWidth: isMobile ? 70 : 90 }}>{entry.name}</div>
                      <div style={{ color: "#FFD700", fontWeight: 700, fontSize: isMobile ? 10 : 12 }}>{(entry.points / 1000).toFixed(1)}k PP</div>
                      <div style={{ width: isMobile ? 72 : 90, height: heights[i], background: `linear-gradient(180deg, ${colors[i]}44, ${colors[i]}22)`, border: `1px solid ${colors[i]}55`, borderRadius: "6px 6px 0 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontWeight: 900, fontSize: isMobile ? 32 : 42, color: colors[i] }}>#{ranks[i]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {LEADERBOARD.map(entry => (
                  <div key={entry.rank} style={{ background: entry.isUser ? "rgba(67,97,238,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${entry.isUser ? "rgba(67,97,238,0.3)" : "rgba(255,255,255,0.07)"}`, borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 26, textAlign: "center", fontSize: 14, flexShrink: 0 }}>
                      {entry.rank <= 3 ? ["🥇", "🥈", "🥉"][entry.rank - 1] : <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 700, fontSize: 12 }}>#{entry.rank}</span>}
                    </div>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{entry.avatar}</span>
                    <span style={{ flex: 1, fontWeight: 700, color: entry.isUser ? "#4361EE" : "#fff", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.name}{entry.isUser && " (You)"}</span>
                    <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, flexShrink: 0 }}>{entry.wins}W</span>
                    <span style={{ color: "#FFD700", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{(entry.points / 1000).toFixed(1)}k</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── REWARDS ── */}
          {activeTab === "rewards" && (
            <div className="tab-content">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ fontSize: isMobile ? 26 : 32, fontWeight: 800, letterSpacing: 1 }}>REWARDS <span style={{ color: "#4361EE" }}>STORE</span></h2>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>Redeem PuntPoints for real-world prizes</p>
                </div>
                <div style={{ background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 14, padding: "8px 16px", display: "flex", gap: 7, alignItems: "center" }}>
                  <span>🏆</span>
                  <span style={{ color: "#FFD700", fontWeight: 900, fontSize: 18 }}>{user?.points?.toLocaleString()}</span>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>PP</span>
                </div>
              </div>

              <div style={{ background: "linear-gradient(135deg, rgba(255,215,0,0.08), rgba(67,97,238,0.08))", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 14, padding: "16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <span style={{ fontSize: 32, flexShrink: 0 }}>🎁</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#FFD700", fontWeight: 800, fontSize: 15, letterSpacing: 0.5 }}>SPONSORED GIVEAWAYS ACTIVE</div>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>iPhone 16 Pro & PS5 giveaways end in 14 days!</div>
                </div>
                <div style={{ background: "rgba(255,215,0,0.15)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 8, padding: "6px 12px", color: "#FFD700", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>🔥 5 Left</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
                {REWARDS.map(reward => {
                  const canAfford = user?.points >= reward.points;
                  const done = redeemed[reward.id];
                  return (
                    <div key={reward.id} style={{ background: done ? "rgba(52,211,153,0.05)" : "rgba(255,255,255,0.03)", border: `1px solid ${done ? "#34D39944" : reward.giveaway ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.08)"}`, borderRadius: 14, padding: "16px 14px", position: "relative", overflow: "hidden" }}>
                      {reward.giveaway && !done && <div style={{ position: "absolute", top: 8, right: 8, background: "#FFD700", color: "#000", fontSize: 8, fontWeight: 900, padding: "2px 7px", borderRadius: 20, letterSpacing: 1 }}>GIVEAWAY</div>}
                      {done && <div style={{ position: "absolute", top: 8, right: 8, background: "#34D399", color: "#000", fontSize: 8, fontWeight: 900, padding: "2px 7px", borderRadius: 20 }}>REDEEMED</div>}
                      <div style={{ fontSize: 28, marginBottom: 10 }}>{reward.icon}</div>
                      <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 9, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>{reward.sponsor}</div>
                      <div style={{ fontWeight: 800, fontSize: 13, color: "#fff", marginBottom: 10, lineHeight: 1.3 }}>{reward.name}</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <div style={{ color: "#FFD700", fontWeight: 900, fontSize: 15 }}>{reward.points.toLocaleString()} PP</div>
                        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>{reward.stock} left</div>
                      </div>
                      <button onClick={() => done ? null : canAfford ? handleRedeem(reward) : showNotif(`Need ${(reward.points - user.points).toLocaleString()} more PP!`, "#4361EE")}
                        style={{ width: "100%", border: "none", borderRadius: 8, padding: "8px", background: done ? "rgba(52,211,153,0.1)" : canAfford ? "#4361EE" : "rgba(255,255,255,0.05)", color: done ? "#34D399" : canAfford ? "#fff" : "rgba(255,255,255,0.3)", fontWeight: 800, fontSize: 12, cursor: done ? "default" : "pointer", transition: "all 0.2s", letterSpacing: 0.5 }}>
                        {done ? "✓ Redeemed!" : canAfford ? "Redeem Now" : "Not enough PP"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── P2P BET ── */}
          {activeTab === "bet" && (
            <div className="tab-content">
              {betStep === "lobby" && (
                <div>
                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <h2 style={{ fontSize: isMobile ? 26 : 34, fontWeight: 800, letterSpacing: 1 }}>⚔️ P2P <span style={{ color: "#4361EE" }}>BETTING</span></h2>
                      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>Create private sessions and bet PuntCoins against friends</p>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{ background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 12, padding: "8px 14px", display: "flex", gap: 6, alignItems: "center" }}>
                        <span>🪙</span>
                        <span style={{ color: "#FFD700", fontWeight: 900, fontSize: 16 }}>{puntCoins.toLocaleString()}</span>
                        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>PC</span>
                      </div>
                      <button onClick={() => setShowBuyCoins(true)} style={{ background: "#4361EE", border: "none", borderRadius: 10, padding: "9px 16px", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", letterSpacing: 0.5 }}>+ Buy PC</button>
                    </div>
                  </div>

                  {/* How it works */}
                  <div style={{ background: "linear-gradient(135deg, rgba(67,97,238,0.08), rgba(255,215,0,0.05))", border: "1px solid rgba(67,97,238,0.15)", borderRadius: 14, padding: "16px", marginBottom: 20 }}>
                    <h3 style={{ fontWeight: 800, fontSize: 14, marginBottom: 12, color: "#4361EE", letterSpacing: 0.5 }}>HOW IT WORKS</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {[
                        ["1️⃣", "Create Session", "Set your stake and create a private bet"],
                        ["2️⃣", "Friend Joins", "Your opponent deposits the same amount"],
                        ["3️⃣", "Predict", "Both sides pick an outcome on the generated scenario"],
                        ["4️⃣", "Win All", "Correct predictor takes the entire pot!"],
                      ].map(([n, title, desc]) => (
                        <div key={title} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <span style={{ fontSize: 16, flexShrink: 0 }}>{n}</span>
                          <div>
                            <div style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>{title}</div>
                            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, lineHeight: 1.4 }}>{desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Create New Session */}
                  <CreateBetSession
                    puntCoins={puntCoins}
                    onCreated={(session) => {
                      setBettingSessions(prev => [session, ...prev]);
                      setActiveBetSession(session);
                      setPuntCoins(pc => pc - session.stake);
                      setBetStep("session");
                    }}
                    onBuyCoins={() => setShowBuyCoins(true)}
                    scenarios={allP2PScenarios}
                  />

                  {/* Active Sessions */}
                  {bettingSessions.length > 0 && (
                    <div style={{ marginTop: 20 }}>
                      <h3 style={{ fontWeight: 800, fontSize: 14, marginBottom: 12, letterSpacing: 0.5 }}>YOUR SESSIONS</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {bettingSessions.map(s => (
                          <div key={s.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${s.status === "won" ? "rgba(52,211,153,0.3)" : s.status === "lost" ? "rgba(255,100,100,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => { setActiveBetSession(s); setBetStep(s.status ? "result" : "session"); }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: 13, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.scenario.q}</div>
                              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, marginTop: 2 }}>Stake: {s.stake} PC • {s.status ? s.status.toUpperCase() : "Active"}</div>
                            </div>
                            <div style={{ color: s.status === "won" ? "#34D399" : s.status === "lost" ? "#FF6464" : "#FFD700", fontWeight: 900, fontSize: 16, flexShrink: 0 }}>
                              {s.status === "won" ? `+${s.stake * 2}` : s.status === "lost" ? `-${s.stake}` : `${s.stake * 2} pot`} 🪙
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {betStep === "session" && activeBetSession && (
                <BetSession
                  session={activeBetSession}
                  puntCoins={puntCoins}
                  onResult={(winner, updatedSession) => {
                    setBettingSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
                    setActiveBetSession(updatedSession);
                    if (winner === "user") setPuntCoins(pc => pc + updatedSession.stake * 2);
                    setBetStep("result");
                  }}
                  onBack={() => setBetStep("lobby")}
                />
              )}

              {betStep === "result" && activeBetSession && (
                <BetResult
                  session={activeBetSession}
                  puntCoins={puntCoins}
                  onRematch={(rematchSession) => {
                    setPuntCoins(pc => pc - rematchSession.stake);
                    setBettingSessions(prev => [rematchSession, ...prev.filter(s => s.id !== activeBetSession.id)]);
                    setActiveBetSession(rematchSession);
                    setBetStep("session");
                  }}
                  onBack={() => { setActiveBetSession(null); setBetStep("lobby"); }}
                  scenarios={allP2PScenarios}
                />
              )}
            </div>
          )}

          {/* ── PROFILE ── */}
          {activeTab === "profile" && (
            <div className="tab-content" style={{ maxWidth: 600, margin: "0 auto" }}>
              <div style={{ background: "linear-gradient(135deg, rgba(67,97,238,0.1) 0%, rgba(255,215,0,0.05) 100%)", border: "1px solid rgba(67,97,238,0.2)", borderRadius: 16, padding: "20px 16px", marginBottom: 16, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ width: 64, height: 64, background: "linear-gradient(135deg, #4361EE, #7B2FBE)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</h2>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</p>
                  <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
                    {[["🎯", Object.keys(predictions).length, "Predictions"], ["🏆", user?.points?.toLocaleString(), "PP"], ["📊", "#10", "Rank"]].map(([icon, val, label]) => (
                      <div key={label}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span>{icon}</span>
                          <span style={{ fontWeight: 700, fontSize: 18, color: "#6B8EFF" }}>{val}</span>
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px", marginBottom: 12 }}>
                <h3 style={{ fontWeight: 800, marginBottom: 12, fontSize: 16, letterSpacing: 0.5 }}>Your Interests</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {user?.interests?.map(catId => {
                    const cat = CATEGORIES.find(c => c.id === catId);
                    return cat && (
                      <span key={catId} style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}44`, borderRadius: 20, padding: "5px 12px", color: cat.color, fontSize: 11, fontWeight: 700 }}>
                        {cat.icon} {cat.label}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px", marginBottom: 12 }}>
                <h3 style={{ fontWeight: 800, marginBottom: 12, fontSize: 16, letterSpacing: 0.5 }}>Recent Predictions</h3>
                {Object.keys(predictions).length === 0 ? (
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, textAlign: "center", padding: "16px 0" }}>No predictions yet!</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {Object.entries(predictions).slice(0, 5).map(([eventId, optIdx]) => {
                      const event = EVENTS.find(e => e.id === Number(eventId));
                      if (!event) return null;
                      const cat = CATEGORIES.find(c => c.id === event.cat);
                      return (
                        <div key={eventId} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "9px 12px" }}>
                          <span style={{ flexShrink: 0 }}>{cat?.icon}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.title}</div>
                            <div style={{ fontSize: 10, color: "#4361EE" }}>→ {event.options[optIdx]}</div>
                          </div>
                          <span style={{ color: "rgba(255,215,0,0.8)", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>Pending</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px" }}>
                <h3 style={{ fontWeight: 800, marginBottom: 4, fontSize: 16, letterSpacing: 0.5 }}>Boost Your Points 🚀</h3>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginBottom: 12 }}>Complete social tasks for bonus PuntPoints</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {SOCIAL_TASKS.map(task => (
                    <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "9px 12px" }}>
                      <span style={{ fontSize: 16, flexShrink: 0 }}>{task.icon}</span>
                      <span style={{ flex: 1, fontSize: 12, color: "rgba(255,255,255,0.65)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.label}</span>
                      <span style={{ color: "#FFD700", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>+{task.points}</span>
                      <button onClick={() => showNotif(`Opening ${task.platform}...`)} style={{ background: "rgba(67,97,238,0.15)", border: "1px solid rgba(67,97,238,0.3)", borderRadius: 6, padding: "4px 10px", color: "#4361EE", fontSize: 11, fontWeight: 700, cursor: "pointer", flexShrink: 0, letterSpacing: 0.5 }}>Go</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      {isMobile && (
        <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: "rgba(10,10,15,0.97)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", padding: "6px 0 max(6px, env(safe-area-inset-bottom))", flexShrink: 0 }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ flex: 1, background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 4px", cursor: "pointer", color: activeTab === tab.id ? "#4361EE" : "rgba(255,255,255,0.4)", transition: "color 0.2s" }}>
              <span style={{ fontSize: 20 }}>{tab.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5 }}>{tab.label}</span>
              {activeTab === tab.id && <div style={{ width: 20, height: 2, background: "#4361EE", borderRadius: 1 }} />}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
