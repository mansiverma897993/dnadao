const Proposal = require('./models/Proposal');
const Member = require('./models/Member');

const INITIAL_MOCK_PROPOSALS = [
  {
    id: "P-047",
    category: "Treasury",
    title: "Protocol Fee Restructure v2",
    description: "Adjust fee distribution model: allocate 60% of fees directly to active stakers, 20% to Treasury, and 20% to AI DNA Engine model fine-tuning.",
    creator: "0x44f3...d81c",
    votesYes: 1247,
    votesNo: 508,
    status: "Active",
    closesIn: "2d 14h 22m",
    reputationEffect: "+24 VP",
    proposalIndex: 47,
  },
  {
    id: "P-046",
    category: "Development",
    title: "Grant: Open Source Dev Fund",
    description: "Launch a $150k developer ecosystem grant program targeted at building open-source plugins for the Governance DNA Engine.",
    creator: "Sarah R. (0x5fa1...)",
    votesYes: 231,
    votesNo: 12,
    status: "In Review",
    closesIn: "Expired",
    reputationEffect: "+12 VP",
    proposalIndex: 46,
  },
  {
    id: "P-045",
    category: "Governance",
    title: "Expand Multi-Sig Signatories",
    description: "Add three reputable security experts to the treasury multi-sig structure to enhance DAO security and operational resilience.",
    creator: "Marcus P. (0xae98...)",
    votesYes: 1204,
    votesNo: 32,
    status: "Passed",
    closesIn: "Executed",
    reputationEffect: "+45 VP",
    proposalIndex: 45,
  },
  {
    id: "P-044",
    category: "Rewards",
    title: "Community Rewards Season 4",
    description: "Distribute 50,000 $DNA tokens to top contributors based on their active Reputation Score and Participation Rate during Epoch 13.",
    creator: "Li Wei (0x81dc...)",
    votesYes: 998,
    votesNo: 45,
    status: "Passed",
    closesIn: "Executed",
    reputationEffect: "+30 VP",
    proposalIndex: 44,
  },
  {
    id: "P-043",
    category: "Intelligence",
    title: "AI Proposal Generator Upgrade",
    description: "Upgrade M-01 to model v2.1, adding automatic multi-variable KPI creation, cross-chain DAO benchmark matching, and local impact simulation.",
    creator: "0x44f3...d81c",
    votesYes: 812,
    votesNo: 154,
    status: "Active",
    closesIn: "5d 1h 17m",
    reputationEffect: "+18 VP",
    proposalIndex: 43,
  }
];

const COMMUNITY_MEMBERS = [
  {
    name: "Adit Kumar",
    avatar: "AK",
    score: 892,
    archetype: "Innovator Builder",
    percentile: "Top 5%",
    history: "On-chain behavior since Jan 2024 · 47 votes · 12 proposals submitted",
    alignment: "Innovation Leader: Consistently votes FOR new protocol features. 94% alignment with growth-oriented proposals.",
    scores: {
      innovation: 87,
      risk: 62,
      community: 79,
      financial: 54,
      participation: 90,
      focus: 85
    }
  },
  {
    name: "Sarah R.",
    avatar: "SR",
    score: 741,
    archetype: "Conservative Analyst",
    percentile: "Top 15%",
    history: "On-chain behavior since Mar 2024 · 39 votes · 4 proposals submitted",
    alignment: "Stability Advocate: Prioritizes protocol safety, voting AGAINST highly experimental features, showing 88% treasury conservation alignment.",
    scores: {
      innovation: 42,
      risk: 28,
      community: 82,
      financial: 91,
      participation: 75,
      focus: 88
    }
  },
  {
    name: "Marcus P.",
    avatar: "MP",
    score: 688,
    archetype: "Risk-Taker Dev",
    percentile: "Top 20%",
    history: "On-chain behavior since Feb 2024 · 29 votes · 6 proposals submitted",
    alignment: "Growth Maximizer: Highly aligned with high-risk, high-reward treasury strategies and technical expansions. 92% developer proposal support.",
    scores: {
      innovation: 93,
      risk: 87,
      community: 55,
      financial: 42,
      participation: 81,
      focus: 70
    }
  },
  {
    name: "Li Wei",
    avatar: "LW",
    score: 632,
    archetype: "Community Moderator",
    percentile: "Top 25%",
    history: "On-chain behavior since May 2024 · 64 votes · 2 proposals submitted",
    alignment: "People Champion: Perfect alignment with contributor rewards and community grants. 98% voting turnout rate on community governance.",
    scores: {
      innovation: 65,
      risk: 45,
      community: 95,
      financial: 38,
      participation: 96,
      focus: 78
    }
  },
  {
    name: "Dev M.",
    avatar: "DM",
    score: 591,
    archetype: "Neutral Designer",
    percentile: "Top 35%",
    history: "On-chain behavior since Jun 2024 · 21 votes · 3 proposals submitted",
    alignment: "Balanced Core: Focuses on user-interface proposals, voting neutrally on deep financial parameters, ensuring balanced overall growth.",
    scores: {
      innovation: 70,
      risk: 50,
      community: 68,
      financial: 52,
      participation: 68,
      focus: 80
    }
  },
  {
    name: "Jamie T.",
    avatar: "JT",
    score: 544,
    archetype: "Innovator Writer",
    percentile: "Top 40%",
    history: "On-chain behavior since Aug 2024 · 15 votes · 1 proposal submitted",
    alignment: "Ecosystem Storyteller: Supports documentation grants and educational campaigns. Votes for structured, transparent proposal guidelines.",
    scores: {
      innovation: 80,
      risk: 58,
      community: 74,
      financial: 45,
      participation: 60,
      focus: 72
    }
  }
];

async function seedDatabase() {
  try {
    const proposalCount = await Proposal.countDocuments();
    if (proposalCount === 0) {
      console.log('Seeding initial proposals...');
      await Proposal.insertMany(INITIAL_MOCK_PROPOSALS);
      console.log('Proposals seeded successfully.');
    } else {
      console.log('Proposals already exist in the database, skipping seed.');
    }

    const memberCount = await Member.countDocuments();
    if (memberCount === 0) {
      console.log('Seeding initial members...');
      await Member.insertMany(COMMUNITY_MEMBERS);
      console.log('Members seeded successfully.');
    } else {
      console.log('Members already exist in the database, skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

module.exports = seedDatabase;
