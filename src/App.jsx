import { useState, useEffect, useRef } from "react";

// ─── SVG LOGO ────────────────────────────────────────────────────────────────
const PuntHubLogo = ({ size = 40, showText = true }) => (
  <svg viewBox="0 0 200 52" height={size} style={{ display: "block" }} xmlns="http://www.w3.org/2000/svg">
    {/* Icon - dartboard-style target */}
    <circle cx="26" cy="26" r="24" fill="#FF6B35" />
    <circle cx="26" cy="26" r="16" fill="rgba(0,0,0,0.25)" />
    <circle cx="26" cy="26" r="9" fill="rgba(255,255,255,0.2)" />
    <circle cx="26" cy="26" r="4" fill="#FFD700" />
    {/* Arrow */}
    <line x1="38" y1="14" x2="26" y2="26" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
    <polygon points="40,11 34,13 38,17" fill="#fff"/>
    {showText && <>
      {/* punt - light */}
      <text x="56" y="36" fontFamily="'Barlow Condensed', 'Oswald', sans-serif" fontWeight="700" fontSize="28" fill="#b9b9c3" letterSpacing="1">punt</text>
      {/* hub - dark */}
      <text x="101" y="36" fontFamily="'Barlow Condensed', 'Oswald', sans-serif" fontWeight="800" fontSize="28" fill="#253238" letterSpacing="1">hub</text>
    </>}
  </svg>
);

const PuntHubLogoDark = ({ size = 40, showText = true }) => (
  <svg viewBox="0 0 200 52" height={size} style={{ display: "block" }} xmlns="http://www.w3.org/2000/svg">
    <circle cx="26" cy="26" r="24" fill="#FF6B35" />
    <circle cx="26" cy="26" r="16" fill="rgba(0,0,0,0.25)" />
    <circle cx="26" cy="26" r="9" fill="rgba(255,255,255,0.2)" />
    <circle cx="26" cy="26" r="4" fill="#FFD700" />
    <line x1="38" y1="14" x2="26" y2="26" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
    <polygon points="40,11 34,13 38,17" fill="#fff"/>
    {showText && <>
      <text x="56" y="36" fontFamily="'Barlow Condensed', 'Oswald', sans-serif" fontWeight="700" fontSize="28" fill="rgba(255,255,255,0.6)" letterSpacing="1">punt</text>
      <text x="101" y="36" fontFamily="'Barlow Condensed', 'Oswald', sans-serif" fontWeight="800" fontSize="28" fill="#fff" letterSpacing="1">hub</text>
    </>}
  </svg>
);

// ─── DATA ────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "sports", label: "Sports", icon: "⚽", color: "#00E5FF" },
  { id: "politics", label: "Politics", icon: "🏛️", color: "#FF6B35" },
  { id: "crypto", label: "Crypto", icon: "₿", color: "#FFD700" },
  { id: "tech", label: "Tech", icon: "🤖", color: "#A855F7" },
  { id: "music", label: "Music", icon: "🎵", color: "#EC4899" },
  { id: "celebrity", label: "Celebrity", icon: "⭐", color: "#F59E0B" },
  { id: "weather", label: "Weather", icon: "🌩️", color: "#38BDF8" },
  { id: "trivia", label: "Trivia", icon: "🧠", color: "#34D399" },
  { id: "history", label: "History", icon: "📜", color: "#FB7185" },
  { id: "markets", label: "Markets", icon: "📈", color: "#10B981" },
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
  const diffColor = { Easy: "#34D399", Medium: "#FFD700", Hard: "#FF6B35" }[event.difficulty];
  const daysLeft = Math.ceil((new Date(event.ends) - new Date()) / 86400000);

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 14,
      padding: "16px",
      position: "relative",
      overflow: "hidden",
      transition: "transform 0.2s, box-shadow 0.2s",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${cat.color}, transparent)` }} />
      {event.trending && (
        <div style={{ position: "absolute", top: 10, right: 10, background: "#FF6B35", color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 20, letterSpacing: 1 }}>🔥 TRENDING</div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, paddingRight: event.trending ? 80 : 0 }}>
        <span style={{ fontSize: 16 }}>{cat.icon}</span>
        <span style={{ color: cat.color, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{cat.label}</span>
        <span style={{ marginLeft: "auto", color: diffColor, fontSize: 9, fontWeight: 700, border: `1px solid ${diffColor}44`, padding: "2px 7px", borderRadius: 20 }}>{event.difficulty}</span>
      </div>
      <h3 style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 5, lineHeight: 1.3, fontFamily: "'Barlow Condensed', 'Oswald', sans-serif", letterSpacing: 0.5 }}>{event.title}</h3>
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
              transition: "all 0.2s",
              fontFamily: "'Barlow Condensed', 'Oswald', sans-serif",
            }}>
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
          <span style={{ color: "#FFD700", fontWeight: 800, fontSize: 13, fontFamily: "'Barlow Condensed', 'Oswald', sans-serif" }}>{event.points.toLocaleString()} PP</span>
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
        <button onClick={() => setUpvoted(!upvoted)} style={{ background: "none", border: "none", color: upvoted ? "#FF6B35" : "rgba(255,255,255,0.3)", fontSize: 16, cursor: "pointer", padding: 0 }}>▲</button>
        <span style={{ color: upvoted ? "#FF6B35" : "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 700, fontFamily: "'Barlow Condensed', 'Oswald', sans-serif" }}>{(post.upvotes + (upvoted ? 1 : 0)).toLocaleString()}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14 }}>{post.avatar}</span>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>u/{post.author}</span>
          <span style={{ color: cat?.color, fontSize: 9, fontWeight: 700, border: `1px solid ${cat?.color}44`, padding: "1px 6px", borderRadius: 20 }}>{post.flair}</span>
          <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, marginLeft: "auto" }}>{post.time}</span>
        </div>
        <h4 style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 5, fontFamily: "'Barlow Condensed', 'Oswald', sans-serif", letterSpacing: 0.3, lineHeight: 1.3 }}>{post.title}</h4>
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
    <div style={{ minHeight: "100vh", minHeight: "100dvh", background: "#0A0A0F", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", fontFamily: "'Barlow Condensed', 'Oswald', sans-serif", overflowX: "hidden", boxSizing: "border-box" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-track { background: #0A0A0F; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        @keyframes floatUp { 0% { opacity:1; transform:translateX(-50%) translateY(0); } 100% { opacity:0; transform:translateX(-50%) translateY(-60px); } }
        @keyframes slideIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-16px); } to { opacity:1; transform:translateY(0); } }
        input:focus { outline: 1px solid rgba(255,107,53,0.5) !important; }
        input::placeholder { color: rgba(255,255,255,0.2); }
      `}</style>

      <div style={{ position: "fixed", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "min(600px, 100vw)", height: "min(600px, 100vw)", background: "radial-gradient(circle, rgba(255,107,53,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      {animPts && (
        <div style={{ position: "fixed", top: "25%", left: "50%", zIndex: 9999, color: "#FFD700", fontSize: 24, fontWeight: 900, animation: "floatUp 1.5s ease-out forwards", textShadow: "0 0 20px rgba(255,215,0,0.8)", pointerEvents: "none" }}>{animPts}</div>
      )}

      <div style={{ width: "100%", maxWidth: 520, animation: "slideIn 0.4s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <PuntHubLogoDark size={44} />
        </div>

        <div style={{ display: "flex", gap: 5, marginBottom: 24, justifyContent: "center" }}>
          {[0, 1, 2, 3].map(s => (
            <div key={s} style={{ height: 3, width: s === step ? 36 : 18, borderRadius: 2, background: s <= step ? "#FF6B35" : "rgba(255,255,255,0.1)", transition: "all 0.3s" }} />
          ))}
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "24px 20px" }}>
          {step === 0 && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 6, letterSpacing: 0.5 }}>Welcome to PuntHub 🎯</h2>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 1.7, marginBottom: 24, fontFamily: "'Barlow', sans-serif" }}>The world's most rewarding prediction community. Predict outcomes, earn PuntPoints, redeem incredible rewards.</p>
              <div style={{ marginBottom: 16 }}>
                <label style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 7, letterSpacing: 1 }}>YOUR USERNAME</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. PredictionKing99" style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, fontFamily: "'Barlow', sans-serif", outline: "none" }} />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 7, letterSpacing: 1 }}>EMAIL ADDRESS</label>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" type="email" style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, fontFamily: "'Barlow', sans-serif", outline: "none" }} />
              </div>
              <button onClick={() => name && email && setStep(1)} style={{ width: "100%", background: name && email ? "linear-gradient(135deg, #FF6B35, #FFD700)" : "rgba(255,255,255,0.05)", border: "none", borderRadius: 12, padding: "13px", color: name && email ? "#000" : "rgba(255,255,255,0.3)", fontWeight: 800, fontSize: 16, cursor: name && email ? "pointer" : "not-allowed", transition: "all 0.3s", fontFamily: "'Barlow Condensed', 'Oswald', sans-serif", letterSpacing: 1 }}>
                LET'S GO →
              </button>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 6 }}>What interests you? 🧠</h2>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginBottom: 20, fontFamily: "'Barlow', sans-serif" }}>Pick your top categories — choose 3 or more</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
                {CATEGORIES.map(cat => {
                  const sel = interests.includes(cat.id);
                  return (
                    <button key={cat.id} onClick={() => setInterests(prev => sel ? prev.filter(i => i !== cat.id) : [...prev, cat.id])}
                      style={{ background: sel ? `${cat.color}22` : "rgba(255,255,255,0.03)", border: `1px solid ${sel ? cat.color : "rgba(255,255,255,0.08)"}`, borderRadius: 10, padding: "10px 12px", color: sel ? cat.color : "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s", fontFamily: "'Barlow Condensed', 'Oswald', sans-serif" }}>
                      <span>{cat.icon}</span> {cat.label}
                      {sel && <span style={{ marginLeft: "auto" }}>✓</span>}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => interests.length >= 3 && setStep(2)} style={{ width: "100%", background: interests.length >= 3 ? "linear-gradient(135deg, #FF6B35, #FFD700)" : "rgba(255,255,255,0.05)", border: "none", borderRadius: 12, padding: "13px", color: interests.length >= 3 ? "#000" : "rgba(255,255,255,0.3)", fontWeight: 800, fontSize: 16, cursor: interests.length >= 3 ? "pointer" : "not-allowed", transition: "all 0.3s", fontFamily: "'Barlow Condensed', 'Oswald', sans-serif", letterSpacing: 1 }}>
                {interests.length >= 3 ? "CONTINUE →" : `PICK ${3 - interests.length} MORE`}
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Earn your first PuntPoints! 🏆</h2>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "'Barlow', sans-serif" }}>Complete optional tasks to boost your starting balance</p>
                <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 20, padding: "7px 18px" }}>
                  <span>🏆</span>
                  <span style={{ color: "#FFD700", fontWeight: 900, fontSize: 22, fontFamily: "'Barlow Condensed', 'Oswald', sans-serif" }}>{(basePoints + earnedPoints).toLocaleString()} PP</span>
                </div>
              </div>
              <div style={{ background: "rgba(0,229,255,0.05)", border: "1px solid rgba(0,229,255,0.2)", borderRadius: 10, padding: "11px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>🎁</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#00E5FF", fontWeight: 700, fontSize: 13, fontFamily: "'Barlow Condensed', 'Oswald', sans-serif" }}>Welcome Bonus: +500 PP</div>
                  <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "'Barlow', sans-serif" }}>Just for joining PuntHub!</div>
                </div>
                <span style={{ color: "#00E5FF" }}>✓</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20, maxHeight: 260, overflowY: "auto" }}>
                {SOCIAL_TASKS.map(task => {
                  const done = completed[task.id];
                  return (
                    <button key={task.id} onClick={() => completeTask(task)}
                      style={{ background: done ? "rgba(52,211,153,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${done ? "#34D399" : "rgba(255,255,255,0.08)"}`, borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, cursor: done ? "default" : "pointer", transition: "all 0.2s", textAlign: "left" }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{task.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: done ? "#34D399" : "#fff", fontWeight: 700, fontSize: 13, fontFamily: "'Barlow Condensed', 'Oswald', sans-serif" }}>{task.label}</div>
                        <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "'Barlow', sans-serif" }}>{task.platform}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        <span style={{ color: "#FFD700", fontWeight: 800, fontSize: 13, fontFamily: "'Barlow Condensed', 'Oswald', sans-serif" }}>+{task.points}</span>
                        {done ? <span style={{ color: "#34D399" }}>✓</span> : <span style={{ color: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.1)", width: 18, height: 18, borderRadius: "50%", display: "inline-block" }} />}
                      </div>
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setStep(3)} style={{ width: "100%", background: "linear-gradient(135deg, #FF6B35, #FFD700)", border: "none", borderRadius: 12, padding: "13px", color: "#000", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "'Barlow Condensed', 'Oswald', sans-serif", letterSpacing: 0.5 }}>
                {Object.keys(completed).length === 0 ? "SKIP FOR NOW →" : `CLAIM ${basePoints + earnedPoints} PP & CONTINUE →`}
              </button>
            </div>
          )}

          {step === 3 && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 56, marginBottom: 14 }}>🎯</div>
              <h2 style={{ fontSize: 30, fontWeight: 800, color: "#fff", marginBottom: 6, letterSpacing: 1 }}>YOU'RE IN, {name.toUpperCase()}!</h2>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginBottom: 20, fontFamily: "'Barlow', sans-serif" }}>Your PuntHub journey begins now. Start predicting and climb the leaderboard.</p>
              <div style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 14, padding: "18px", marginBottom: 24 }}>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginBottom: 4, letterSpacing: 1 }}>YOUR STARTING BALANCE</div>
                <div style={{ color: "#FFD700", fontWeight: 900, fontSize: 38, fontFamily: "'Barlow Condensed', 'Oswald', sans-serif", letterSpacing: 2 }}>{(basePoints + earnedPoints).toLocaleString()} PP</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 24 }}>
                {[["🎯", "Predict", "Make predictions to earn PP"], ["🏆", "Compete", "Climb the leaderboard"], ["🛍️", "Redeem", "Turn points into prizes"]].map(([icon, title, desc]) => (
                  <div key={title} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "12px 8px" }}>
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: 11, fontFamily: "'Barlow Condensed', 'Oswald', sans-serif" }}>{title}</div>
                    <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 9, fontFamily: "'Barlow', sans-serif", lineHeight: 1.4, marginTop: 2 }}>{desc}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => onComplete({ name, email, interests, points: basePoints + earnedPoints })} style={{ width: "100%", background: "linear-gradient(135deg, #FF6B35, #FFD700)", border: "none", borderRadius: 12, padding: "14px", color: "#000", fontWeight: 900, fontSize: 17, cursor: "pointer", fontFamily: "'Barlow Condensed', 'Oswald', sans-serif", letterSpacing: 1.5 }}>
                START PREDICTING →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function PuntHub() {
  const [screen, setScreen] = useState("onboarding");
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [predictions, setPredictions] = useState({});
  const [filterCat, setFilterCat] = useState("all");
  const [forumFilter, setForumFilter] = useState("all");
  const [notification, setNotification] = useState(null);
  const [redeemed, setRedeemed] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
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

  if (screen === "onboarding") {
    return <Onboarding onComplete={(userData) => { setUser(userData); setScreen("app"); }} />;
  }

  const filteredEvents = filterCat === "all" ? EVENTS : EVENTS.filter(e => e.cat === filterCat);
  const filteredPosts = forumFilter === "all" ? FORUM_POSTS : FORUM_POSTS.filter(p => p.cat === forumFilter);

  const TABS = [
    { id: "home", label: "Predict", icon: "🎯" },
    { id: "forum", label: "Forum", icon: "💬" },
    { id: "leaderboard", label: "Ranks", icon: "🏆" },
    { id: "rewards", label: "Rewards", icon: "🛍️" },
    { id: "profile", label: "Profile", icon: "👤" },
  ];

  return (
    <div style={{ minHeight: "100vh", minHeight: "100dvh", background: "#0A0A0F", fontFamily: "'Barlow Condensed', 'Oswald', sans-serif", color: "#fff", display: "flex", flexDirection: "column", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500;600;700&display=swap');
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

      {/* Top Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(10,10,15,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 16px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <PuntHubLogoDark size={36} showText={!isMobile} />

        {/* Desktop tabs */}
        {!isMobile && (
          <div style={{ display: "flex", gap: 3 }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ background: activeTab === tab.id ? "rgba(255,107,53,0.15)" : "none", border: activeTab === tab.id ? "1px solid rgba(255,107,53,0.3)" : "1px solid transparent", borderRadius: 8, padding: "6px 14px", color: activeTab === tab.id ? "#FF6B35" : "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s", letterSpacing: 0.5 }}>
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.25)", borderRadius: 20, padding: "5px 12px" }}>
            <span style={{ fontSize: 12 }}>🏆</span>
            <span style={{ color: "#FFD700", fontWeight: 800, fontSize: 13 }}>{user?.points?.toLocaleString()}</span>
            {!isMobile && <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>PP</span>}
          </div>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #FF6B35, #FFD700)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: "#000", flexShrink: 0 }}>
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
              <div style={{ background: "linear-gradient(135deg, rgba(255,107,53,0.12) 0%, rgba(255,215,0,0.06) 50%, rgba(0,229,255,0.06) 100%)", border: "1px solid rgba(255,107,53,0.18)", borderRadius: 16, padding: "20px 16px", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <h1 style={{ fontSize: isMobile ? 28 : 38, fontWeight: 800, letterSpacing: 1, lineHeight: 1.1 }}>
                      PREDICT. WIN. <span style={{ color: "#FF6B35" }}>EARN.</span>
                    </h1>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 4, fontFamily: "'Barlow', sans-serif" }}>{EVENTS.length} live events • Earn PuntPoints • Redeem rewards</p>
                  </div>
                  <div style={{ display: "flex", gap: 16 }}>
                    {[["🎯", Object.keys(predictions).length, "Predictions"], ["📊", EVENTS.filter(e => !predictions[e.id]).length, "Open"]].map(([icon, val, label]) => (
                      <div key={label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 16 }}>{icon}</div>
                        <div style={{ fontWeight: 800, fontSize: 22, color: "#FF6B35" }}>{val}</div>
                        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "'Barlow', sans-serif" }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Category Filters */}
              <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 6 }}>
                <button onClick={() => setFilterCat("all")} style={{ background: filterCat === "all" ? "#FF6B35" : "rgba(255,255,255,0.05)", border: "none", borderRadius: 20, padding: "7px 14px", color: filterCat === "all" ? "#fff" : "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: 11, cursor: "pointer", whiteSpace: "nowrap", letterSpacing: 0.5 }}>
                  All Events
                </button>
                {CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setFilterCat(cat.id)}
                    style={{ background: filterCat === cat.id ? `${cat.color}22` : "rgba(255,255,255,0.03)", border: `1px solid ${filterCat === cat.id ? cat.color : "rgba(255,255,255,0.08)"}`, borderRadius: 20, padding: "7px 12px", color: filterCat === cat.id ? cat.color : "rgba(255,255,255,0.45)", fontWeight: 700, fontSize: 11, cursor: "pointer", whiteSpace: "nowrap", display: "flex", gap: 5, alignItems: "center", transition: "all 0.2s", letterSpacing: 0.5 }}>
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
                  <h2 style={{ fontSize: isMobile ? 26 : 32, fontWeight: 800, letterSpacing: 1 }}>COMMUNITY <span style={{ color: "#FF6B35" }}>FORUM</span></h2>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "'Barlow', sans-serif" }}>Discuss predictions & share analysis</p>
                </div>
                <button onClick={() => showNotif("✍️ Post creation coming soon!")} style={{ background: "linear-gradient(135deg, #FF6B35, #FFD700)", border: "none", borderRadius: 10, padding: "9px 16px", color: "#000", fontWeight: 800, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", letterSpacing: 0.5, flexShrink: 0 }}>
                  + New Post
                </button>
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 6 }}>
                {["all", ...CATEGORIES.map(c => c.id)].map(cat => {
                  const c = CATEGORIES.find(x => x.id === cat);
                  return (
                    <button key={cat} onClick={() => setForumFilter(cat)}
                      style={{ background: forumFilter === cat ? (c ? `${c.color}22` : "rgba(255,107,53,0.15)") : "rgba(255,255,255,0.03)", border: `1px solid ${forumFilter === cat ? (c?.color || "#FF6B35") : "rgba(255,255,255,0.08)"}`, borderRadius: 20, padding: "6px 12px", color: forumFilter === cat ? (c?.color || "#FF6B35") : "rgba(255,255,255,0.4)", fontWeight: 700, fontSize: 10, cursor: "pointer", whiteSpace: "nowrap", letterSpacing: 0.5 }}>
                      {c ? `${c.icon} ${c.label}` : "All Topics"}
                    </button>
                  );
                })}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {filteredPosts.map(post => <ForumPost key={post.id} post={post} />)}
                {filteredPosts.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,0.2)", fontSize: 13, fontFamily: "'Barlow', sans-serif" }}>No posts in this category yet.</div>}
              </div>
              <div style={{ marginTop: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 16 }}>
                <h3 style={{ fontWeight: 800, marginBottom: 14, color: "#FF6B35", fontSize: 16, letterSpacing: 0.5 }}>🔥 Trending Topics</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {["#Bitcoin200k", "#ChampionsLeague", "#AGI2025", "#MetGala", "#ZendayaEffect", "#NFLDraft", "#GoldAllTimeHigh", "#F1Season", "#Wimbledon", "#GrammyPredictions"].map(tag => (
                    <span key={tag} style={{ background: "rgba(255,107,53,0.1)", border: "1px solid rgba(255,107,53,0.2)", borderRadius: 20, padding: "4px 10px", color: "#FF6B35", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>{tag}</span>
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
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "'Barlow', sans-serif" }}>Top PuntHub predictors this season</p>
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
                  <div key={entry.rank} style={{ background: entry.isUser ? "rgba(255,107,53,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${entry.isUser ? "rgba(255,107,53,0.3)" : "rgba(255,255,255,0.07)"}`, borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 26, textAlign: "center", fontSize: 14, flexShrink: 0 }}>
                      {entry.rank <= 3 ? ["🥇", "🥈", "🥉"][entry.rank - 1] : <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 700, fontSize: 12 }}>#{entry.rank}</span>}
                    </div>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{entry.avatar}</span>
                    <span style={{ flex: 1, fontWeight: 700, color: entry.isUser ? "#FF6B35" : "#fff", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.name}{entry.isUser && " (You)"}</span>
                    <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, flexShrink: 0, fontFamily: "'Barlow', sans-serif" }}>{entry.wins}W</span>
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
                  <h2 style={{ fontSize: isMobile ? 26 : 32, fontWeight: 800, letterSpacing: 1 }}>REWARDS <span style={{ color: "#FF6B35" }}>STORE</span></h2>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "'Barlow', sans-serif" }}>Redeem PuntPoints for real-world prizes</p>
                </div>
                <div style={{ background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 14, padding: "8px 16px", display: "flex", gap: 7, alignItems: "center" }}>
                  <span>🏆</span>
                  <span style={{ color: "#FFD700", fontWeight: 900, fontSize: 18 }}>{user?.points?.toLocaleString()}</span>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "'Barlow', sans-serif" }}>PP</span>
                </div>
              </div>

              <div style={{ background: "linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,107,53,0.08))", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 14, padding: "16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <span style={{ fontSize: 32, flexShrink: 0 }}>🎁</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#FFD700", fontWeight: 800, fontSize: 15, letterSpacing: 0.5 }}>SPONSORED GIVEAWAYS ACTIVE</div>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "'Barlow', sans-serif" }}>iPhone 16 Pro & PS5 giveaways end in 14 days!</div>
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
                        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "'Barlow', sans-serif" }}>{reward.stock} left</div>
                      </div>
                      <button onClick={() => done ? null : canAfford ? handleRedeem(reward) : showNotif(`Need ${(reward.points - user.points).toLocaleString()} more PP!`, "#FF6B35")}
                        style={{ width: "100%", border: "none", borderRadius: 8, padding: "8px", background: done ? "rgba(52,211,153,0.1)" : canAfford ? "linear-gradient(135deg, #FF6B35, #FFD700)" : "rgba(255,255,255,0.05)", color: done ? "#34D399" : canAfford ? "#000" : "rgba(255,255,255,0.3)", fontWeight: 800, fontSize: 12, cursor: done ? "default" : "pointer", transition: "all 0.2s", letterSpacing: 0.5 }}>
                        {done ? "✓ Redeemed!" : canAfford ? "Redeem Now" : "Not enough PP"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── PROFILE ── */}
          {activeTab === "profile" && (
            <div className="tab-content" style={{ maxWidth: 600, margin: "0 auto" }}>
              <div style={{ background: "linear-gradient(135deg, rgba(255,107,53,0.1) 0%, rgba(255,215,0,0.05) 100%)", border: "1px solid rgba(255,107,53,0.2)", borderRadius: 16, padding: "20px 16px", marginBottom: 16, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ width: 64, height: 64, background: "linear-gradient(135deg, #FF6B35, #FFD700)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: "#000", flexShrink: 0 }}>
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</h2>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "'Barlow', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</p>
                  <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
                    {[["🎯", Object.keys(predictions).length, "Predictions"], ["🏆", user?.points?.toLocaleString(), "PP"], ["📊", "#10", "Rank"]].map(([icon, val, label]) => (
                      <div key={label}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span>{icon}</span>
                          <span style={{ fontWeight: 900, fontSize: 18, color: "#FF6B35" }}>{val}</span>
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "'Barlow', sans-serif" }}>{label}</div>
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
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, textAlign: "center", padding: "16px 0", fontFamily: "'Barlow', sans-serif" }}>No predictions yet!</div>
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
                            <div style={{ fontSize: 10, color: "#FF6B35" }}>→ {event.options[optIdx]}</div>
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
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginBottom: 12, fontFamily: "'Barlow', sans-serif" }}>Complete social tasks for bonus PuntPoints</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {SOCIAL_TASKS.map(task => (
                    <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "9px 12px" }}>
                      <span style={{ fontSize: 16, flexShrink: 0 }}>{task.icon}</span>
                      <span style={{ flex: 1, fontSize: 12, color: "rgba(255,255,255,0.65)", fontFamily: "'Barlow', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.label}</span>
                      <span style={{ color: "#FFD700", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>+{task.points}</span>
                      <button onClick={() => showNotif(`Opening ${task.platform}...`)} style={{ background: "rgba(255,107,53,0.15)", border: "1px solid rgba(255,107,53,0.3)", borderRadius: 6, padding: "4px 10px", color: "#FF6B35", fontSize: 11, fontWeight: 700, cursor: "pointer", flexShrink: 0, letterSpacing: 0.5 }}>Go</button>
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
              style={{ flex: 1, background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 4px", cursor: "pointer", color: activeTab === tab.id ? "#FF6B35" : "rgba(255,255,255,0.4)", transition: "color 0.2s" }}>
              <span style={{ fontSize: 20 }}>{tab.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5 }}>{tab.label}</span>
              {activeTab === tab.id && <div style={{ width: 20, height: 2, background: "#FF6B35", borderRadius: 1 }} />}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
