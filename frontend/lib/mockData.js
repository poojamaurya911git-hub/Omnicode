// FILE: lib/mockData.js

// ==================== PROBLEMS ====================
export const problems = [
  { id: 1, title: "Two Sum", difficulty: "Easy", platform: "LeetCode", tags: ["Array", "Hash Table"], acceptance: 49.2, status: "solved" },
  { id: 2, title: "Add Two Numbers", difficulty: "Medium", platform: "LeetCode", tags: ["Linked List", "Math"], acceptance: 40.1, status: "solved" },
  { id: 3, title: "Longest Substring", difficulty: "Medium", platform: "LeetCode", tags: ["String", "Sliding Window"], acceptance: 33.8, status: "attempted" },
  { id: 4, title: "Median of Two Sorted Arrays", difficulty: "Hard", platform: "LeetCode", tags: ["Array", "Binary Search"], acceptance: 36.1, status: "unsolved" },
  { id: 5, title: "Chef and Strings", difficulty: "Easy", platform: "CodeChef", tags: ["Math", "Implementation"], acceptance: 72.3, status: "solved" },
  { id: 6, title: "Maximum Subarray", difficulty: "Medium", platform: "LeetCode", tags: ["DP", "Greedy"], acceptance: 50.4, status: "solved" },
  { id: 7, title: "Binary Search Tree", difficulty: "Medium", platform: "LeetCode", tags: ["Tree", "BST"], acceptance: 44.7, status: "attempted" },
  { id: 8, title: "Graph Traversal", difficulty: "Hard", platform: "Codeforces", tags: ["Graph", "DFS"], acceptance: 28.5, status: "unsolved" },
  { id: 9, title: "String Matching", difficulty: "Medium", platform: "Codeforces", tags: ["String", "KMP"], acceptance: 38.9, status: "solved" },
  { id: 10, title: "Palindrome Check", difficulty: "Easy", platform: "LeetCode", tags: ["String", "Two Pointers"], acceptance: 54.6, status: "solved" },
  { id: 11, title: "Dynamic Programming", difficulty: "Hard", platform: "Codeforces", tags: ["DP"], acceptance: 22.1, status: "unsolved" },
  { id: 12, title: "Merge Intervals", difficulty: "Medium", platform: "LeetCode", tags: ["Array", "Sorting"], acceptance: 46.3, status: "solved" },
  { id: 13, title: "Knapsack Problem", difficulty: "Hard", platform: "CodeChef", tags: ["DP", "Greedy"], acceptance: 31.2, status: "attempted" },
  { id: 14, title: "Valid Parentheses", difficulty: "Easy", platform: "LeetCode", tags: ["Stack", "String"], acceptance: 62.8, status: "solved" },
  { id: 15, title: "Dijkstra's Shortest Path", difficulty: "Hard", platform: "Codeforces", tags: ["Graph", "Greedy"], acceptance: 25.4, status: "unsolved" },
  { id: 16, title: "Rotate Array", difficulty: "Medium", platform: "LeetCode", tags: ["Array", "Math"], acceptance: 39.5, status: "solved" },
  { id: 17, title: "Segment Tree Range", difficulty: "Hard", platform: "Codeforces", tags: ["Segment Tree", "Data Structure"], acceptance: 18.7, status: "unsolved" },
  { id: 18, title: "Coin Change", difficulty: "Medium", platform: "LeetCode", tags: ["DP", "BFS"], acceptance: 42.1, status: "solved" },
  { id: 19, title: "Trie Implementation", difficulty: "Medium", platform: "CodeChef", tags: ["Trie", "String"], acceptance: 35.6, status: "attempted" },
  { id: 20, title: "Number Theory Basics", difficulty: "Hard", platform: "Codeforces", tags: ["Math", "Number Theory"], acceptance: 20.3, status: "unsolved" },
];

// ==================== RATING HISTORY ====================
export const ratingHistory = [
  { month: "Jan", rating: 1200 },
  { month: "Feb", rating: 1285 },
  { month: "Mar", rating: 1340 },
  { month: "Apr", rating: 1420 },
  { month: "May", rating: 1510 },
  { month: "Jun", rating: 1475 },
  { month: "Jul", rating: 1580 },
  { month: "Aug", rating: 1620 },
  { month: "Sep", rating: 1690 },
  { month: "Oct", rating: 1745 },
  { month: "Nov", rating: 1780 },
  { month: "Dec", rating: 1847 },
];

// ==================== HEATMAP DATA ====================
function generateHeatmapData() {
  const data = [];
  const today = new Date();
  for (let week = 51; week >= 0; week--) {
    for (let day = 0; day < 7; day++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (week * 7 + (6 - day)));
      const count = Math.random() > 0.3 ? Math.floor(Math.random() * 12) : 0;
      data.push({
        date: date.toISOString().split("T")[0],
        count,
        day,
        week: 51 - week,
      });
    }
  }
  return data;
}

export const heatmapData = generateHeatmapData();

// ==================== TOPIC STRENGTHS ====================
export const topicStrengths = [
  { topic: "Arrays", score: 92, fullMark: 100 },
  { topic: "DP", score: 35, fullMark: 100 },
  { topic: "Graphs", score: 68, fullMark: 100 },
  { topic: "Trees", score: 75, fullMark: 100 },
  { topic: "Strings", score: 88, fullMark: 100 },
  { topic: "Math", score: 60, fullMark: 100 },
  { topic: "Greedy", score: 72, fullMark: 100 },
];

// ==================== RECENT SUBMISSIONS ====================
export const recentSubmissions = [
  { id: 1, problem: "Two Sum", platform: "LeetCode", verdict: "AC", language: "C++", time: "2 min ago" },
  { id: 2, problem: "Merge Intervals", platform: "LeetCode", verdict: "AC", language: "Python", time: "15 min ago" },
  { id: 3, problem: "Graph Traversal", platform: "Codeforces", verdict: "WA", language: "C++", time: "1 hour ago" },
  { id: 4, problem: "Chef and Strings", platform: "CodeChef", verdict: "AC", language: "Java", time: "2 hours ago" },
  { id: 5, problem: "Dynamic Programming", platform: "Codeforces", verdict: "TLE", language: "C++", time: "3 hours ago" },
  { id: 6, problem: "Valid Parentheses", platform: "LeetCode", verdict: "AC", language: "JavaScript", time: "5 hours ago" },
  { id: 7, problem: "Knapsack Problem", platform: "CodeChef", verdict: "WA", language: "Python", time: "6 hours ago" },
  { id: 8, problem: "Palindrome Check", platform: "LeetCode", verdict: "AC", language: "C++", time: "8 hours ago" },
  { id: 9, problem: "Maximum Subarray", platform: "LeetCode", verdict: "AC", language: "C++", time: "1 day ago" },
  { id: 10, problem: "String Matching", platform: "Codeforces", verdict: "AC", language: "Python", time: "1 day ago" },
  { id: 11, problem: "Binary Search Tree", platform: "LeetCode", verdict: "RE", language: "Java", time: "2 days ago" },
  { id: 12, problem: "Coin Change", platform: "LeetCode", verdict: "AC", language: "C++", time: "2 days ago" },
  { id: 13, problem: "Rotate Array", platform: "LeetCode", verdict: "AC", language: "Python", time: "3 days ago" },
  { id: 14, problem: "Segment Tree Range", platform: "Codeforces", verdict: "WA", language: "C++", time: "4 days ago" },
  { id: 15, problem: "Trie Implementation", platform: "CodeChef", verdict: "AC", language: "C++", time: "5 days ago" },
];

// ==================== BATTLE ROOMS ====================
export const battleRooms = [
  {
    id: 1,
    name: "Algo Blitz #42",
    participants: 12,
    maxParticipants: 16,
    difficulty: "Medium",
    status: "live",
    timeLeft: "14:32",
    problemCount: 4,
  },
  {
    id: 2,
    name: "DP Masters",
    participants: 8,
    maxParticipants: 8,
    difficulty: "Hard",
    status: "live",
    timeLeft: "03:15",
    problemCount: 3,
  },
  {
    id: 3,
    name: "Beginner Bash",
    participants: 5,
    maxParticipants: 20,
    difficulty: "Easy",
    status: "waiting",
    timeLeft: "30:00",
    problemCount: 5,
  },
  {
    id: 4,
    name: "Graph Arena",
    participants: 10,
    maxParticipants: 12,
    difficulty: "Hard",
    status: "live",
    timeLeft: "22:47",
    problemCount: 3,
  },
];

// ==================== LEADERBOARD ====================
export const leaderboardData = [
  { rank: 1, username: "tourist", avatar: "T", solved: 4, time: "28:14", score: 1200, ratingDelta: "+45" },
  { rank: 2, username: "Petr", avatar: "P", solved: 4, time: "32:05", score: 1150, ratingDelta: "+38" },
  { rank: 3, username: "ecnerwala", avatar: "E", solved: 3, time: "25:30", score: 980, ratingDelta: "+30" },
  { rank: 4, username: "aryan_v", avatar: "A", solved: 3, time: "35:12", score: 920, ratingDelta: "+22" },
  { rank: 5, username: "jiangly", avatar: "J", solved: 3, time: "38:44", score: 870, ratingDelta: "+18" },
  { rank: 6, username: "neal_wu", avatar: "N", solved: 2, time: "20:15", score: 640, ratingDelta: "+12" },
  { rank: 7, username: "tmwilliamlin", avatar: "W", solved: 2, time: "22:30", score: 600, ratingDelta: "+8" },
  { rank: 8, username: "benq", avatar: "B", solved: 2, time: "28:55", score: 560, ratingDelta: "+5" },
];

// ==================== CHAT MESSAGES ====================
export const chatMessages = [
  {
    id: 1,
    role: "ai",
    content: "Hey Aryan! I've analyzed your 847 problems across all platforms. You're crushing Arrays & Strings (Top 15%), but I noticed Dynamic Programming is at just 12%. Want me to create a custom training plan?",
    timestamp: "10:30 AM",
  },
  {
    id: 2,
    role: "user",
    content: "Yes, show me what you found about DP",
    timestamp: "10:31 AM",
  },
  {
    id: 3,
    role: "ai",
    content: "You've only solved 8 DP problems in the last 60 days. Your last attempt was 'Edit Distance' on May 22nd. I recommend starting with these fundamentals:\n\n1. **Climbing Stairs** (Easy) — builds intuition for state transitions\n2. **House Robber** (Medium) — classic 1D DP\n3. **Longest Common Subsequence** (Medium) — 2D DP foundation\n4. **Coin Change** (Medium) — unbounded knapsack variant\n\nShall I add these to your practice queue?",
    timestamp: "10:31 AM",
  },
  {
    id: 4,
    role: "user",
    content: "Yes, add them. Also, what about my graph skills?",
    timestamp: "10:32 AM",
  },
  {
    id: 5,
    role: "ai",
    content: "Your graph skills are decent at 68%, but there's a pattern — you're strong in BFS/DFS traversals but struggle with advanced topics:\n\n**Strong:** BFS, DFS, Connected Components\n**Weak:** Dijkstra, Bellman-Ford, Network Flow\n\nI've added 4 DP problems and 2 graph problems to your queue. Focus on DP first since it's your biggest gap.",
    timestamp: "10:33 AM",
  },
  {
    id: 6,
    role: "user",
    content: "What's my predicted Codeforces rating if I keep this pace?",
    timestamp: "10:35 AM",
  },
  {
    id: 7,
    role: "ai",
    content: "Based on your trajectory:\n\n📈 **Current Rating:** 1847 (Specialist)\n🎯 **Predicted in 3 months:** ~1950 (Expert)\n🏆 **Predicted in 6 months:** ~2050 (Candidate Master)\n\nThis assumes you maintain your current 23-day streak and shift 40% of practice time to DP and advanced graphs. The biggest rating unlock for you is DP — solving Div2 D/E problems consistently could add 100+ rating points.",
    timestamp: "10:35 AM",
  },
  {
    id: 8,
    role: "user",
    content: "That's really helpful, thanks! Let me start with the DP problems now.",
    timestamp: "10:36 AM",
  },
];

// ==================== ANALYZER RESULTS ====================
export const analyzerResults = {
  tier: "Specialist",
  consistencyScore: 82,
  totalSolved: 847,
  streak: 14,
  globalRank: 1243,
  strongTopics: [
    { name: "Arrays", percentage: 92 },
    { name: "Binary Search", percentage: 88 },
    { name: "Graph BFS", percentage: 85 },
    { name: "Strings", percentage: 88 },
  ],
  weakTopics: [
    { name: "Dynamic Programming", percentage: 12 },
    { name: "Segment Trees", percentage: 15 },
    { name: "Number Theory", percentage: 20 },
  ],
  platforms: {
    leetcode: { solved: 432, rating: 1847, rank: "Knight", handle: "@aryan_lc", lastActive: "2 hours ago" },
    codechef: { solved: 256, rating: 1654, rank: "4 Star", handle: "@aryan_cc", lastActive: "1 day ago" },
    codeforces: { solved: 159, rating: 1512, rank: "Specialist", handle: "@aryan_cf", lastActive: "3 days ago" },
  },
  recommendedProblems: [
    { title: "Longest Increasing Subsequence", platform: "LeetCode", difficulty: "Medium", url: "#" },
    { title: "Edit Distance", platform: "LeetCode", difficulty: "Hard", url: "#" },
    { title: "Lazy Propagation", platform: "Codeforces", difficulty: "Hard", url: "#" },
    { title: "Matrix Chain Multiplication", platform: "CodeChef", difficulty: "Medium", url: "#" },
  ],
};

// ==================== DASHBOARD STATS ====================
export const dashboardStats = {
  totalSolved: 847,
  currentStreak: 23,
  cfRating: 1847,
  globalRank: 4231,
  weeklyChange: {
    solved: "+12",
    streak: "+7",
    rating: "+32",
    rank: "+156",
  },
};

// ==================== USER PROFILE ====================
export const userProfile = {
  name: "Aryan Verma",
  username: "aryan_v",
  bio: "Full-stack developer | Competitive programmer",
  joinDate: "Jan 2023",
  avatar: null,
  stats: {
    totalSolved: 847,
    streak: 14,
    bestRating: 1847,
    globalRank: 1243,
    consistency: 82,
  },
};

// ==================== CODE TEMPLATE ====================
export const codeTemplate = `function twoSum(nums, target) {
  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    if (map.has(complement)) {
      return [map.get(complement), i];
    }

    map.set(nums[i], i);
  }
}`;

// ==================== TESTIMONIALS ====================
export const testimonials = [
  {
    name: "Rahul Sharma",
    role: "SDE @ Google",
    quote: "OmniCode's AI coach helped me go from 1400 to 2100 on Codeforces in just 6 months. The personalized practice recommendations are a game-changer.",
    avatar: "RS",
  },
  {
    name: "Priya Patel",
    role: "ICPC World Finalist",
    quote: "The battle mode is incredibly addictive. Competing in real-time against other coders pushed me to solve problems faster than I ever thought possible.",
    avatar: "PP",
  },
  {
    name: "Alex Chen",
    role: "Staff Engineer @ Meta",
    quote: "Finally, a platform that syncs all my competitive programming profiles. The unified analytics gave me insights I never had before.",
    avatar: "AC",
  },
];
