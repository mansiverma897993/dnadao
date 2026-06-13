import { useMemo, useState, useEffect, useRef } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as web3 from "@solana/web3.js";
import { Buffer } from "buffer";
import { IDL, PROGRAM_ID } from "./idl";
import { 
  LayoutDashboard, 
  FileText, 
  Sparkles, 
  Vote, 
  Users, 
  Activity, 
  MessageSquare, 
  TrendingUp, 
  Award, 
  Code, 
  Coins,
  ChevronRight,
  Search,
  Plus,
  ArrowUpRight,
  Flame,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  Brain,
  Zap,
  RefreshCw,
  Send,
  AlertCircle
} from "lucide-react";

// Fallback Provider and IDL types to ensure compiling works in all situations
type ProposalAccount = {
  publicKey: web3.PublicKey;
  account: {
    dao: web3.PublicKey;
    creator: web3.PublicKey;
    index: any; // BN
    title: string;
    description: string;
    votesYes: any; // BN
    votesNo: any; // BN
    executed: boolean;
    bump: number;
  };
};

const DAO_NAME = "DNA DAO";

// Initial mock proposals to populate dashboard beautifully
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

// Mock community members for M-02 DNA Engine
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

export function App() {
  const { connection } = useConnection();
  const wallet = useWallet();

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Core smart contract interaction states
  const [proposals, setProposals] = useState<ProposalAccount[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("System online. Zero central authority.");
  const [programInitError, setProgramInitError] = useState<string | null>(null);

  // Fallback interactive local state (for full mock capabilities when wallet is not connected)
  const [mockProposals, setMockProposals] = useState(INITIAL_MOCK_PROPOSALS);
  const [recentVotes, setRecentVotes] = useState<Record<string, "yes" | "no">>({});

  // DNA Engine Selected Member State
  const [members, setMembers] = useState<any[]>(COMMUNITY_MEMBERS);
  const [selectedMember, setSelectedMember] = useState(COMMUNITY_MEMBERS[0]);
  const [searchMemberQuery, setSearchMemberQuery] = useState("");

  const API_BASE = "http://localhost:5000/api";

  // Fetch initial proposals and members from MongoDB
  const fetchProposals = async () => {
    try {
      const res = await fetch(`${API_BASE}/proposals`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setMockProposals(data);
          setSelectedChatProposalId(data[0].id);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch proposals from backend database, using local mock fallback.", e);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${API_BASE}/members`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setMembers(data);
          setSelectedMember(data[0]);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch members from backend database, using local mock fallback.", e);
    }
  };

  useEffect(() => {
    fetchProposals();
    fetchMembers();
  }, []);

  // Community Chat states
  const [selectedChatProposalId, setSelectedChatProposalId] = useState<string>("P-047");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessageText, setNewMessageText] = useState<string>("");

  // User Auth States
  const [user, setUser] = useState<{ username: string } | null>(() => {
    const saved = localStorage.getItem("dnadao_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUsername.trim() || !authPassword.trim()) {
      setAuthError("All fields are required.");
      return;
    }
    setBusy(true);
    setAuthError("");
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: authUsername, password: authPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        localStorage.setItem("dnadao_user", JSON.stringify(data));
        setAuthUsername("");
        setAuthPassword("");
      } else {
        setAuthError(data.error || "Login failed.");
      }
    } catch (err) {
      setAuthError("Connection error. Is the server running?");
    }
    setBusy(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUsername.trim() || !authPassword.trim()) {
      setAuthError("All fields are required.");
      return;
    }
    setBusy(true);
    setAuthError("");
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: authUsername, password: authPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        localStorage.setItem("dnadao_user", JSON.stringify(data));
        setAuthUsername("");
        setAuthPassword("");
      } else {
        setAuthError(data.error || "Registration failed.");
      }
    } catch (err) {
      setAuthError("Connection error. Is the server running?");
    }
    setBusy(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("dnadao_user");
  };

  const fetchChatMessages = async (proposalId: string) => {
    try {
      const res = await fetch(`${API_BASE}/proposals/${proposalId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data);
      }
    } catch (e) {
      console.warn("Failed to fetch chat messages.", e);
    }
  };

  const sendChatMessage = async () => {
    if (!newMessageText.trim() || !selectedChatProposalId) return;
    const senderName = user ? user.username : (wallet.publicKey ? wallet.publicKey.toBase58().substring(0, 6) + "..." + wallet.publicKey.toBase58().substring(38) : "Adit Kumar");
    
    try {
      const res = await fetch(`${API_BASE}/proposals/${selectedChatProposalId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: senderName,
          content: newMessageText
        })
      });
      if (res.ok) {
        const newMessage = await res.json();
        setChatMessages(prev => [...prev, newMessage]);
        setNewMessageText("");
      }
    } catch (e) {
      console.warn("Failed to send message.", e);
    }
  };

  // Poll for new messages every 3 seconds if activeTab is community-intel
  useEffect(() => {
    if (activeTab === "community-intel" && selectedChatProposalId) {
      fetchChatMessages(selectedChatProposalId);
      const interval = setInterval(() => {
        fetchChatMessages(selectedChatProposalId);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [activeTab, selectedChatProposalId]);

  // AI Proposal Generator input states
  const [ideaInput, setIdeaInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("Treasury Allocation");
  const [budgetMin, setBudgetMin] = useState("0");
  const [budgetMax, setBudgetMax] = useState("50,000");
  const [timelineInput, setTimelineInput] = useState("3 Months");

  // AI Generation process state
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGenStep, setAiGenStep] = useState(0);
  const [generatedProposal, setGeneratedProposal] = useState<any>(null);

  // Debate AI states
  const [debateInput, setDebateInput] = useState(
    "User A: We should build this sub-protocol immediately, the fees collected will be worth it.\n" +
    "User B: I disagree. The audit costs are too high right now. We only have 400K in the treasury.\n" +
    "User C: What if we do a multi-phase roll out? First phase only requires 20K budget.\n" +
    "User D: Phase 1 sounds safe. Let's run a test pool first. Highly support!"
  );
  const [debateAnalysis, setDebateAnalysis] = useState<any>(null);
  const [isAnalyzingDebate, setIsAnalyzingDebate] = useState(false);
  const [selectedDebateProposalId, setSelectedDebateProposalId] = useState<string>("P-047");
  const [debateMode, setDebateMode] = useState<"proposal" | "custom">("proposal");
  const [debateNLPResult, setDebateNLPResult] = useState<any>(null);
  const [debateError, setDebateError] = useState<string | null>(null);
  const [currentDebateMessages, setCurrentDebateMessages] = useState<string[]>([]);

  // Future Impact Simulator states
  const [simCategory, setSimCategory] = useState("Treasury Allocation");
  const [simBudget, setSimBudget] = useState(35000);
  const [simDuration, setSimDuration] = useState(6);
  const [simResult, setSimResult] = useState<any>({
    treasuryImpact: "-8.75%",
    growthProjection: "+14.3%",
    riskScore: "Medium (38/100)",
    communitySentiment: "92% Favorable"
  });

  // Smart contract interaction logic
  const daoPda = useMemo(() => {
    try {
      return web3.PublicKey.findProgramAddressSync(
        [Buffer.from("dao"), Buffer.from(DAO_NAME)],
        new web3.PublicKey(PROGRAM_ID)
      )[0];
    } catch (e) {
      return null;
    }
  }, []);

  async function getProgram() {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
      return null;
    }

    try {
      const anchor = await import("@coral-xyz/anchor");
      const provider = new anchor.AnchorProvider(
        connection,
        wallet as any,
        { commitment: "confirmed" }
      );
      setProgramInitError(null);
      return new (anchor.Program as any)(IDL, PROGRAM_ID, provider) as any;
    } catch (error) {
      setProgramInitError((error as Error).message);
      return null;
    }
  }

  // Refresh real on-chain proposals
  async function refreshOnChainProposals() {
    try {
      const program = (await getProgram()) as any;
      if (!program || !daoPda) return;
      const all = (await program.account.proposal.all([
        {
          memcmp: { offset: 8, bytes: daoPda.toBase58() }
        }
      ])) as any[];
      
      all.sort((a, b) => a.account.index.toNumber() - b.account.index.toNumber());
      setProposals(all);
      setStatus("Successfully synchronized with Solana Mainnet/Devnet.");
    } catch (e) {
      console.warn("Failed to fetch on-chain proposals, using robust mock synchronization.");
    }
  }

  useEffect(() => {
    if (wallet.connected) {
      refreshOnChainProposals();
    }
  }, [wallet.connected]);

  // Handle on-chain/mock proposal creation
  async function submitProposal(title: string, desc: string) {
    setBusy(true);
    setStatus("Broadcasting proposal to Solana network...");
    
    // Attempt real on-chain creation first if wallet is connected
    if (wallet.connected && daoPda) {
      try {
        const program = (await getProgram()) as any;
        if (program && wallet.publicKey) {
          const daoAccount = await program.account.dao.fetch(daoPda);
          const index = daoAccount.proposalCount;
          const [proposalPda] = web3.PublicKey.findProgramAddressSync(
            [Buffer.from("proposal"), daoPda.toBuffer(), index.toArrayLike(Buffer, "le", 8)],
            new web3.PublicKey(PROGRAM_ID)
          );

          await program.methods
            .createProposal(title, desc.substring(0, 499))
            .accounts({
              dao: daoPda,
              proposal: proposalPda,
              creator: wallet.publicKey,
              systemProgram: web3.SystemProgram.programId
            })
            .rpc();

          setStatus("Proposal submitted successfully on Solana.");
          await refreshOnChainProposals();
          setBusy(false);
          return true;
        }
      } catch (e) {
        setStatus(`Solana write error: ${(e as Error).message}. Falling back to active local state.`);
      }
    }

    // Interactive fallback mode
    try {
      const response = await fetch(`${API_BASE}/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: desc,
          category: categoryInput,
          creator: user ? user.username : (wallet.publicKey ? wallet.publicKey.toBase58().substring(0, 6) + "..." + wallet.publicKey.toBase58().substring(38) : "Adit Kumar")
        })
      });
      if (response.ok) {
        const newProposal = await response.json();
        setMockProposals(prev => [newProposal, ...prev]);
        setStatus("Proposal submitted and stored in MongoDB.");
      } else {
        throw new Error("Backend save failed");
      }
    } catch (e) {
      // Local memory fallback if server is down
      const newMockProp = {
        id: `P-0${mockProposals.length + 43}`,
        category: categoryInput,
        title: title,
        description: desc,
        creator: user ? user.username : (wallet.publicKey ? wallet.publicKey.toBase58().substring(0, 6) + "..." + wallet.publicKey.toBase58().substring(38) : "Adit Kumar"),
        votesYes: 1,
        votesNo: 0,
        status: "Active" as const,
        closesIn: "6d 23h 59m",
        reputationEffect: "+20 VP",
        proposalIndex: mockProposals.length + 43,
      };
      setMockProposals(prev => [newMockProp, ...prev]);
      setStatus("Proposal submitted locally (Backend Offline).");
    }
    setBusy(false);
    return true;
  }

  // Handle on-chain/mock voting
  async function vote(proposalId: string, approve: boolean, isRealOnChain: boolean, realProp?: ProposalAccount) {
    setBusy(true);
    setStatus(`Registering vote (${approve ? "YES" : "NO"}) for ${proposalId}...`);

    if (isRealOnChain && realProp && wallet.connected && daoPda) {
      try {
        const program = (await getProgram()) as any;
        if (program && wallet.publicKey) {
          const [voteRecordPda] = web3.PublicKey.findProgramAddressSync(
            [Buffer.from("vote"), realProp.publicKey.toBuffer(), wallet.publicKey.toBuffer()],
            new web3.PublicKey(PROGRAM_ID)
          );

          await program.methods
            .vote(approve)
            .accounts({
              dao: daoPda,
              proposal: realProp.publicKey,
              voteRecord: voteRecordPda,
              voter: wallet.publicKey,
              systemProgram: web3.SystemProgram.programId
            })
            .rpc();

          setStatus("Vote finalized on-chain.");
          await refreshOnChainProposals();
          setBusy(false);
          return;
        }
      } catch (e) {
        setStatus(`Voting failed on-chain: ${(e as Error).message}. Processing vote locally.`);
      }
    }

    // Mock voting execution
    try {
      const response = await fetch(`${API_BASE}/proposals/${proposalId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approve,
          votingPower: 1247
        })
      });
      if (response.ok) {
        const updatedProposal = await response.json();
        setMockProposals(prev => prev.map(p => p.id === proposalId ? updatedProposal : p));
        setStatus(`Vote registered in MongoDB! Added 1,247 VP (${approve ? "YES" : "NO"}) to proposal ${proposalId}.`);
      } else {
        throw new Error("Backend vote registration failed");
      }
    } catch (e) {
      // Local fallback
      setMockProposals(prev => prev.map(p => {
        if (p.id === proposalId) {
          const addedVotes = 1247;
          return {
            ...p,
            votesYes: approve ? p.votesYes + addedVotes : p.votesYes,
            votesNo: !approve ? p.votesNo + addedVotes : p.votesNo
          };
        }
        return p;
      }));
      setStatus(`Voted successfully in local state (Backend Offline).`);
    }
    setRecentVotes(prev => ({ ...prev, [proposalId]: approve ? "yes" : "no" }));
    setBusy(false);
  }

  // Simulated AI Proposal Generator
  const runAIGeneration = () => {
    if (!ideaInput.trim()) return;
    setIsGeneratingAI(true);
    setAiGenStep(0);

    const steps = [
      "Analyzing 847 past DAO proposals for optimal structure...",
      "Extracting problem statements from ecosystem data...",
      "Simulating key risk factors and financial allocations...",
      "Generating high-alignment KPIs for Governance DNA Engine...",
      "Structuring governance-ready proposal final draft..."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setAiGenStep(currentStep);
      } else {
        clearInterval(interval);
        
        // Generate high-fidelity proposal output based on user's input
        const idea = ideaInput;
        const cat = categoryInput;
        let title = "Developer Grants Ecosystem Fund — Season 1";
        let problem = "Ecosystem growth is bottlenecked by limited developer funding. New contributors lack capital to build tooling and integrations, slowing protocol adoption and resilience.";
        let solution = "Allocate 5% of monthly protocol fees to a rotating Developer Grants Fund. Grants distributed quarterly via DAO vote with milestone-based disbursements.";
        let budget = `$${budgetMax || "20,000"}`;
        let timeline = timelineInput;
        let risk = "Medium";
        let alignment = "94%";
        let kpis = [
          "12+ funded projects by end of season",
          "30% increase in developer activity",
          "100K in ecosystem value created",
          "80%+ grantee satisfaction score"
        ];

        // Dynamically custom tailoring based on user idea keywords
        if (idea.toLowerCase().includes("fee") || idea.toLowerCase().includes("tax") || idea.toLowerCase().includes("burn")) {
          title = "Protocol Fee Optimization & Yield Reallocation";
          problem = "Current transaction fee distribution lacks long-term sustainability. Excess fees reside idle rather than incentivizing system performance and ecosystem builders.";
          solution = "Reallocate fee structural parameters: redirect 3% of standard transaction gas into staker rewards and 2% into a dedicated research pool.";
          risk = "Low";
          alignment = "96%";
          kpis = [
            "20% average increase in staker yield",
            "1.2M $DNA tokens committed in staking locks",
            "Stabilized gas fees during high network traffic"
          ];
        } else if (idea.toLowerCase().includes("security") || idea.toLowerCase().includes("audit") || idea.toLowerCase().includes("multisig")) {
          title = "Expanded Multi-Signature & Operational Security Shield";
          problem = "Operational risks are elevated due to limited multisig signers. The DAO requires decentralized, high-reliability key management to safe-guard capital reserves.";
          solution = "Expand core signatories to 7 members. Integrate cold-storage key shares and automated circuit breakers on treasury transactions exceeding $100K.";
          risk = "Medium";
          alignment = "98%";
          kpis = [
            "Treasury response latency kept under 4 hours",
            "Perfect 100% security validation score",
            "Successful transition to multi-signature structure"
          ];
        } else if (idea.toLowerCase().includes("marketing") || idea.toLowerCase().includes("creator") || idea.toLowerCase().includes("community")) {
          title = "Community Outreach & Global Developer Growth Season 1";
          problem = "Global brand awareness is fragmented. Developers are unaware of our advanced on-chain DNA Profile governance features and tooling integrations.";
          solution = "Fund 6 international hackathons, establish creator grants for technical educators, and distribute targeted media material across developer networks.";
          risk = "Medium";
          alignment = "91%";
          kpis = [
            "5,000+ new developer wallet registrations",
            "50+ educational articles and video breakdowns published",
            "15 active sub-communities established globally"
          ];
        } else {
          // generic custom generator
          title = idea.length > 50 ? idea.substring(0, 50) + "..." : idea;
          problem = `The current DAO infrastructure lacks robust parameters to handle "${idea.substring(0, 80)}". This creates inefficiencies in workflow and potential governance stagnation.`;
          solution = `Implement an intelligent, automated framework to deploy "${idea}". This will leverage our M-01 to M-07 AI modules to streamline performance.`;
        }

        setGeneratedProposal({
          title,
          category: cat,
          problem,
          solution,
          budget,
          timeline,
          risk,
          alignment,
          kpis
        });
        setIsGeneratingAI(false);
      }
    }, 900);
  };

  // Fallback discussion threads for each proposal
  const FALLBACK_DEBATE_MESSAGES: Record<string, string[]> = {
    "P-047": [
      "I really love this fee restructure! 60% directly to stakers is huge.",
      "Agreed, this will encourage long term locking. Beautiful design.",
      "Wait, 20% to AI fine-tuning seems high. Do we need that much?",
      "Model fine-tuning is what makes our governance DNA engine unique, so I support it.",
      "Let's vote Yes on this. Long term value is clear."
    ],
    "P-046": [
      "A 150k grant is a bit high for Season 1. We should be conservative.",
      "But open source developer plugins will bring so much integration.",
      "Let's start with a smaller pilot program, say 50k, to test viability.",
      "Agree, 150k is too risky right now. We need strict milestones.",
      "I oppose the current draft. Needs more structure."
    ],
    "P-045": [
      "More security experts on the multi-sig is exactly what we need.",
      "Who are the proposed signers? We need complete transparency.",
      "I support adding reputable security professionals. 3 is a good number.",
      "Agreed, safety first. Our treasury is growing fast."
    ],
    "P-044": [
      "Reputation score allocation makes so much sense compared to just token holdings.",
      "Finally, active contributors get rewarded fairly!",
      "This is a great proposal, fully supportive.",
      "Love the Epoch 13 metrics used here."
    ],
    "P-043": [
      "Model v2.1 benchmark matching looks very advanced.",
      "Can we run a local simulation first?",
      "I'm neutral on this. The upgrade seems nice but not urgent.",
      "AI proposal generation saves a lot of drafting time, let's do it."
    ]
  };

  const DEFAULT_FALLBACK_MESSAGES = [
    "This is a very interesting proposal. Let's discuss details.",
    "I support this initiative. It aligns well with the DAO's goals.",
    "We need to check the budget allocation. Is it too high?",
    "Let's vote Yes. The community benefits are clear."
  ];

  const loadDebateMessages = async (proposalId: string) => {
    try {
      const res = await fetch(`${API_BASE}/proposals/${proposalId}/messages`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const contents = data.map((m: any) => m.content);
          setCurrentDebateMessages(contents);
          return contents;
        }
      }
    } catch (e) {
      console.warn("Failed to fetch messages for debate analysis.", e);
    }
    const fallback = FALLBACK_DEBATE_MESSAGES[proposalId] || DEFAULT_FALLBACK_MESSAGES;
    setCurrentDebateMessages(fallback);
    return fallback;
  };

  useEffect(() => {
    if (activeTab === "debate-ai" && debateMode === "proposal" && selectedDebateProposalId) {
      loadDebateMessages(selectedDebateProposalId);
    }
  }, [activeTab, selectedDebateProposalId, debateMode]);

  // Real Deployed NLP API Debate Analyzer
  const analyzeDebate = async () => {
    setIsAnalyzingDebate(true);
    setDebateError(null);
    setDebateNLPResult(null);

    let messagesToAnalyze: string[] = [];
    if (debateMode === "proposal") {
      messagesToAnalyze = await loadDebateMessages(selectedDebateProposalId);
    } else {
      messagesToAnalyze = debateInput
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0);
    }

    if (messagesToAnalyze.length === 0) {
      setDebateError("No messages found to analyze.");
      setIsAnalyzingDebate(false);
      return;
    }

    try {
      const response = await fetch("https://nlp-dao-5.onrender.com/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat: messagesToAnalyze })
      });

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();
      setDebateNLPResult(data);
    } catch (err: any) {
      console.error("NLP analysis failed:", err);
      setDebateError(err.message || "Failed to connect to the deployed NLP API.");
    } finally {
      setIsAnalyzingDebate(false);
    }
  };

  // Simulated Future Impact Simulator
  const simulateImpact = () => {
    let treasury = "-5.4%";
    let growth = "+8.2%";
    let risk = "Low (21/100)";
    let sentiment = "88% Favorable";

    if (simBudget > 80000) {
      treasury = `-${(simBudget / 400000 * 100).toFixed(1)}%`;
      growth = "+28.4%";
      risk = "High (74/100)";
      sentiment = "64% Favorable";
    } else if (simBudget > 30000) {
      treasury = `-${(simBudget / 400000 * 100).toFixed(1)}%`;
      growth = "+16.8%";
      risk = "Medium (42/100)";
      sentiment = "91% Favorable";
    } else {
      treasury = `-${(simBudget / 400000 * 100).toFixed(1)}%`;
      growth = "+5.1%";
      risk = "Low (18/100)";
      sentiment = "94% Favorable";
    }

    setSimResult({
      treasuryImpact: treasury,
      growthProjection: growth,
      riskScore: risk,
      communitySentiment: sentiment
    });
  };

  useEffect(() => {
    simulateImpact();
  }, [simBudget, simCategory, simDuration]);

  // Filter members based on search
  const filteredMembers = useMemo(() => {
    return members.filter(m => 
      m.name.toLowerCase().includes(searchMemberQuery.toLowerCase()) ||
      m.archetype.toLowerCase().includes(searchMemberQuery.toLowerCase())
    );
  }, [searchMemberQuery, members]);

  // Helper to render beautiful DNA profile radar points in SVG
  const radarPoints = useMemo(() => {
    const s = selectedMember.scores;
    const center = 100;
    const r = 80;
    // Angle in radians for 6 points hexagon
    // innovation (90 deg), risk (30 deg), financial (330 deg), participation (270 deg), focus (210 deg), community (150 deg)
    const angles = [
      -Math.PI / 2,         // Innovation (Top)
      -Math.PI / 6,         // Risk (Top Right)
      Math.PI / 6,          // Financial (Bottom Right)
      Math.PI / 2,          // Participation (Bottom)
      5 * Math.PI / 6,      // Focus (Bottom Left)
      7 * Math.PI / 6,      // Community (Top Left)
    ];

    const vals = [
      s.innovation / 100,
      s.risk / 100,
      s.financial / 100,
      s.participation / 100,
      s.focus / 100,
      s.community / 100,
    ];

    const pts = angles.map((a, i) => {
      const dist = vals[i] * r;
      const x = center + dist * Math.cos(a);
      const y = center + dist * Math.sin(a);
      return `${x},${y}`;
    }).join(" ");

    return pts;
  }, [selectedMember]);

  return (
    <div className="dna-app-container">
      {/* Auth Overlay if not logged in */}
      {!user && (
        <div className="auth-overlay">
          <div className="auth-card">
            <div className="auth-logo-wrapper">
              <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="logo-grad-auth" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#85E347" />
                    <stop offset="50%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
                <path d="M 25.4,16 A 42,42 0 0,0 25.4,84" stroke="url(#logo-grad-auth)" strokeWidth="8.5" strokeLinecap="round" />
                <path d="M 74.6,16 A 42,42 0 0,1 74.6,84" stroke="url(#logo-grad-auth)" strokeWidth="8.5" strokeLinecap="round" />
                <path d="M 38,5 L 38,24 C 38,36 44,44 50,50 C 56,56 62,64 62,76 L 62,95" stroke="url(#logo-grad-auth)" strokeWidth="8.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 62,5 L 62,24 C 62,36 56,44 50,50" stroke="url(#logo-grad-auth)" strokeWidth="8.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 44.5,55.5 C 41.5,58.5 38,64 38,76 L 38,95" stroke="url(#logo-grad-auth)" strokeWidth="8.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            
            <h2>{authMode === "register" ? "Create Account" : "Access DNA DAO"}</h2>
            <p className="auth-subtitle">
              {authMode === "register" 
                ? "Register a new profile to participate in intelligence governance and proposal discussion."
                : "Log in with your credentials to access the decentralized dashboard."}
            </p>

            {authError && <div className="auth-error-banner">{authError}</div>}

            <form className="auth-form" onSubmit={authMode === "register" ? handleRegister : handleLogin}>
              <div className="auth-form-group">
                <label>USERNAME</label>
                <input 
                  type="text" 
                  className="auth-input-field"
                  placeholder="Enter username"
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  required 
                />
              </div>

              <div className="auth-form-group">
                <label>PASSWORD</label>
                <input 
                  type="password" 
                  className="auth-input-field"
                  placeholder="Enter password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  required 
                />
              </div>

              <button type="submit" disabled={busy} className="auth-submit-btn">
                <span>{authMode === "register" ? "Create Account" : "Log In"}</span>
              </button>
            </form>

            <div className="auth-switch-mode">
              {authMode === "register" ? (
                <>
                  Already have an account? 
                  <span className="auth-switch-link" onClick={() => { setAuthMode("login"); setAuthError(""); }}>Log In</span>
                </>
              ) : (
                <>
                  Don't have an account? 
                  <span className="auth-switch-link" onClick={() => { setAuthMode("register"); setAuthError(""); }}>Create Account</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Animated fluid gooey mesh background */}
      <div className="animated-bg-mesh">
        <div className="blobs-container">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
          <div className="blob blob-4"></div>
        </div>
        
        {/* SVG Gooey Filter definition */}
        <svg style={{ display: "none" }}>
          <defs>
            <filter id="gooey">
              <feGaussianBlur in="SourceGraphic" stdDeviation="55" result="blur" />
              <feColorMatrix 
                in="blur" 
                mode="matrix" 
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 95 -30" 
                result="goo" 
              />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </defs>
        </svg>
      </div>
      
      {/* Sidebar Navigation */}
      <aside className="dna-sidebar">
        <div className="sidebar-logo">
          {/* Exact DNA DAO Helix Logo */}
          <svg className="logo-svg" width="38" height="38" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logo-grad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#85E347" />
                <stop offset="50%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
            {/* Outer left arc */}
            <path d="M 25.4,16 A 42,42 0 0,0 25.4,84" stroke="url(#logo-grad)" strokeWidth="8.5" strokeLinecap="round" />
            {/* Outer right arc */}
            <path d="M 74.6,16 A 42,42 0 0,1 74.6,84" stroke="url(#logo-grad)" strokeWidth="8.5" strokeLinecap="round" />
            {/* Inner left-to-right strand (continuous) */}
            <path d="M 38,5 L 38,24 C 38,36 44,44 50,50 C 56,56 62,64 62,76 L 62,95" stroke="url(#logo-grad)" strokeWidth="8.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Inner right-to-left strand (top piece) */}
            <path d="M 62,5 L 62,24 C 62,36 56,44 50,50" stroke="url(#logo-grad)" strokeWidth="8.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Inner right-to-left strand (bottom piece with gap) */}
            <path d="M 44.5,55.5 C 41.5,58.5 38,64 38,76 L 38,95" stroke="url(#logo-grad)" strokeWidth="8.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="logo-text">DNADAO</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group">
            <span className="nav-group-title">GOVERNANCE</span>
            <button className={`nav-link ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>
            <button className={`nav-link ${activeTab === "proposals" ? "active" : ""}`} onClick={() => setActiveTab("proposals")}>
              <FileText size={18} />
              <span>Proposals</span>
            </button>
            <button className={`nav-link ${activeTab === "ai-generator" ? "active" : ""}`} onClick={() => setActiveTab("ai-generator")}>
              <Sparkles size={18} />
              <span>AI Generator</span>
              <span className="badge-core">M-01</span>
            </button>
            <button className={`nav-link ${activeTab === "active-votes" ? "active" : ""}`} onClick={() => setActiveTab("active-votes")}>
              <Vote size={18} />
              <span>Active Votes</span>
            </button>
          </div>

          <div className="nav-group">
            <span className="nav-group-title">INTELLIGENCE</span>
            <button className={`nav-link ${activeTab === "dna-profiles" ? "active" : ""}`} onClick={() => setActiveTab("dna-profiles")}>
              <Users size={18} />
              <span>DNA Profiles</span>
              <span className="badge-usp">M-02</span>
            </button>
            <button className={`nav-link ${activeTab === "community-intel" ? "active" : ""}`} onClick={() => setActiveTab("community-intel")}>
              <MessageSquare size={18} />
              <span>Community Chat</span>
            </button>
            <button className={`nav-link ${activeTab === "debate-ai" ? "active" : ""}`} onClick={() => setActiveTab("debate-ai")}>
              <MessageSquare size={18} />
              <span>Debate AI</span>
            </button>
            <button className={`nav-link ${activeTab === "impact-simulator" ? "active" : ""}`} onClick={() => setActiveTab("impact-simulator")}>
              <TrendingUp size={18} />
              <span>Impact Simulator</span>
            </button>
          </div>

          <div className="nav-group">
            <span className="nav-group-title">WEB3</span>
            <button className={`nav-link ${activeTab === "reputation" ? "active" : ""}`} onClick={() => setActiveTab("reputation")}>
              <Award size={18} />
              <span>Reputation</span>
            </button>
            <button className={`nav-link ${activeTab === "smart-contracts" ? "active" : ""}`} onClick={() => setActiveTab("smart-contracts")}>
              <Code size={18} />
              <span>Smart Contracts</span>
            </button>
            <button className={`nav-link ${activeTab === "treasury" ? "active" : ""}`} onClick={() => setActiveTab("treasury")}>
              <Coins size={18} />
              <span>Treasury</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Panel */}
      <main className="dna-main-content">
        {/* Top Header Bar */}
        <header className="main-header">
          <div className="header-title-area">
            <h1>
              {activeTab === "dashboard" && "Governance Dashboard"}
              {activeTab === "proposals" && "Ecosystem Proposals"}
              {activeTab === "ai-generator" && "AI Proposal Generator — M-01"}
              {activeTab === "active-votes" && "Reputation Voting + Smart Contracts — M-06 & M-07"}
              {activeTab === "dna-profiles" && "Governance DNA Engine — M-02"}
              {activeTab === "community-intel" && "DAO Community Discussion Room"}
              {activeTab === "debate-ai" && "AI Debate Summarizer — M-04"}
              {activeTab === "impact-simulator" && "Future Impact Simulator — M-05"}
              {activeTab === "reputation" && "On-Chain Contributor Reputation"}
              {activeTab === "smart-contracts" && "Smart Contract Audit Panel"}
              {activeTab === "treasury" && "Ecosystem Treasury Manager"}
            </h1>
          </div>

          <div className="header-actions">
            {user && (
              <div className="flex-center" style={{ marginRight: "16px" }}>
                <span className="bold text-emerald" style={{ fontSize: "0.85rem", marginRight: "8px" }}>
                  Logged in: {user.username}
                </span>
                <button className="logout-nav-btn" onClick={handleLogout}>Log Out</button>
              </div>
            )}
            <div className="epoch-pill">
              <span className="epoch-dot" />
              <span>Epoch 14 Active</span>
            </div>
            
            {/* Solana Wallet Button */}
            <div className="wallet-wrapper">
              <WalletMultiButton className="solana-connect-btn" />
            </div>

            {wallet.connected && (
              <div className="user-avatar-badge" title={wallet.publicKey?.toBase58()}>
                {wallet.publicKey ? "AK" : "AK"}
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Inner Tab Content */}
        <div className="tab-viewport">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="dashboard-grid">
              
              {/* Stat Cards */}
              <div className="stat-card">
                <div className="stat-title">ACTIVE PROPOSALS</div>
                <div className="stat-value">24</div>
                <div className="stat-trend green">↑ 6 new this week</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">COMMUNITY MEMBERS</div>
                <div className="stat-value">1,847</div>
                <div className="stat-trend green">↑ 92 joined this epoch</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">TREASURY BALANCE</div>
                <div className="stat-value">.4M <span className="stat-unit">DNA</span></div>
                <div className="stat-trend green">↑ 14% MoM</div>
              </div>

              {/* Recent Proposals Card */}
              <div className="card-wide dashboard-proposals">
                <div className="card-header">
                  <h2>Recent Proposals</h2>
                  <button className="text-btn flex-center" onClick={() => setActiveTab("proposals")}>
                    <span>View all</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
                <div className="proposals-table">
                  {mockProposals.slice(0, 5).map((p) => (
                    <div className="table-row" key={p.id}>
                      <span className="row-id">{p.id}</span>
                      <span className="row-title truncate">{p.title}</span>
                      <span className={`row-status badge-${p.status.toLowerCase().replace(" ", "")}`}>
                        {p.status}
                      </span>
                      <span className="row-votes">{p.votesYes + p.votesNo} votes</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Your DNA Profile Card */}
              <div className="card-narrow dashboard-dna-summary">
                <div className="card-header">
                  <h2>Your DNA Profile</h2>
                  <button className="text-btn" onClick={() => setActiveTab("dna-profiles")}>Edit →</button>
                </div>
                <div className="dna-profile-summary">
                  <div className="member-hero">
                    <div className="avatar-large">AK</div>
                    <div>
                      <div className="hero-name">Adit Kumar</div>
                      <div className="hero-score">
                        <Flame size={14} className="green-icon" />
                        <span>Reputation Score: 892</span>
                      </div>
                    </div>
                  </div>

                  <div className="sliders-list">
                    <div className="slider-item">
                      <div className="slider-label">
                        <span>Innovation</span>
                        <span>87%</span>
                      </div>
                      <div className="slider-track">
                        <div className="slider-fill bg-emerald" style={{ width: "87%" }} />
                      </div>
                    </div>
                    <div className="slider-item">
                      <div className="slider-label">
                        <span>Risk Appetite</span>
                        <span>62%</span>
                      </div>
                      <div className="slider-track">
                        <div className="slider-fill bg-purple" style={{ width: "62%" }} />
                      </div>
                    </div>
                    <div className="slider-item">
                      <div className="slider-label">
                        <span>Community Focus</span>
                        <span>79%</span>
                      </div>
                      <div className="slider-track">
                        <div className="slider-fill bg-cyan" style={{ width: "79%" }} />
                      </div>
                    </div>
                    <div className="slider-item">
                      <div className="slider-label">
                        <span>Financial Vision</span>
                        <span>54%</span>
                      </div>
                      <div className="slider-track">
                        <div className="slider-fill bg-orange" style={{ width: "54%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Module Status Section */}
              <div className="card-full width-100 mt-2">
                <div className="card-header">
                  <h2>AI Module Status</h2>
                  <span className="operational-text">● All systems operational</span>
                </div>
                <div className="modules-grid">
                  <div className="module-card clickable" onClick={() => setActiveTab("ai-generator")}>
                    <div className="module-icon bg-light-orange"><Sparkles className="orange-icon" size={18} /></div>
                    <div>
                      <div className="module-title">AI Proposal Gen</div>
                      <div className="module-meta">M-01 · AI Core</div>
                    </div>
                  </div>
                  <div className="module-card clickable" onClick={() => setActiveTab("dna-profiles")}>
                    <div className="module-icon bg-light-blue"><Users className="blue-icon" size={18} /></div>
                    <div>
                      <div className="module-title">DNA Engine</div>
                      <div className="module-meta">M-02 · USP</div>
                    </div>
                  </div>
                  <div className="module-card clickable" onClick={() => setActiveTab("community-intel")}>
                    <div className="module-icon bg-light-green"><MessageSquare className="green-icon" size={18} /></div>
                    <div>
                      <div className="module-title">Community Chat</div>
                      <div className="module-meta">M-03 · Discussion</div>
                    </div>
                  </div>
                  <div className="module-card clickable" onClick={() => setActiveTab("debate-ai")}>
                    <div className="module-icon bg-light-purple"><MessageSquare className="purple-icon" size={18} /></div>
                    <div>
                      <div className="module-title">Debate Summary</div>
                      <div className="module-meta">M-04 · AI Core</div>
                    </div>
                  </div>
                  <div className="module-card clickable" onClick={() => setActiveTab("impact-simulator")}>
                    <div className="module-icon bg-light-cyan"><TrendingUp className="cyan-icon" size={18} /></div>
                    <div>
                      <div className="module-title">Impact Simulator</div>
                      <div className="module-meta">M-05 · USP</div>
                    </div>
                  </div>
                  <div className="module-card clickable" onClick={() => setActiveTab("active-votes")}>
                    <div className="module-icon bg-light-yellow"><Vote className="yellow-icon" size={18} /></div>
                    <div>
                      <div className="module-title">Rep Voting</div>
                      <div className="module-meta">M-06 · Web3</div>
                    </div>
                  </div>
                  <div className="module-card clickable" onClick={() => setActiveTab("smart-contracts")}>
                    <div className="module-icon bg-light-gray"><Code className="gray-icon" size={18} /></div>
                    <div>
                      <div className="module-title">Smart Contracts</div>
                      <div className="module-meta">M-07 · Web3</div>
                    </div>
                  </div>
                  <div className="module-card coming-soon">
                    <div className="module-icon bg-light-gray"><Plus size={18} /></div>
                    <div>
                      <div className="module-title">Add Module</div>
                      <div className="module-meta">Coming soon</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROPOSALS */}
          {activeTab === "proposals" && (
            <div className="proposals-list-layout">
              <div className="list-filters-bar">
                <h2>All DAO Proposals</h2>
                <div className="search-box">
                  <Search size={16} />
                  <input type="text" placeholder="Search proposals by title, description or hash..." />
                </div>
              </div>

              <div className="proposals-feed">
                {/* On-chain proposals fetch status */}
                {wallet.connected && proposals.length > 0 && (
                  <div className="onchain-divider">
                    <span>On-Chain Verified Active Proposals</span>
                  </div>
                )}
                
                {wallet.connected && proposals.map((p, idx) => (
                  <div className="proposal-item-card" key={p.publicKey.toBase58()}>
                    <div className="proposal-item-header">
                      <div className="cat-badge">On-Chain · Proposal #{p.account.index.toString()}</div>
                      <span className="creator-hash">PDA: {p.publicKey.toBase58().substring(0, 6)}...{p.publicKey.toBase58().substring(40)}</span>
                    </div>
                    <h3>{p.account.title}</h3>
                    <p className="proposal-desc">{p.account.description}</p>
                    
                    <div className="votes-tracker">
                      <div className="tracker-header">
                        <span>Yes: {p.account.votesYes.toString()} VP</span>
                        <span>No: {p.account.votesNo.toString()} VP</span>
                      </div>
                      <div className="tracker-bar">
                        <div className="tracker-bar-yes" style={{ width: `${Math.max(10, (Number(p.account.votesYes) / Math.max(1, Number(p.account.votesYes) + Number(p.account.votesNo))) * 100)}%` }} />
                      </div>
                    </div>

                    <div className="item-actions">
                      <button disabled={busy} className="btn-vote-yes" onClick={() => vote(p.account.title, true, true, p)}>
                        Vote Yes
                      </button>
                      <button disabled={busy} className="btn-vote-no" onClick={() => vote(p.account.title, false, true, p)}>
                        Vote No
                      </button>
                    </div>
                  </div>
                ))}

                <div className="onchain-divider">
                  <span>Ecosystem Active Proposals</span>
                </div>

                {mockProposals.map((p) => (
                  <div className="proposal-item-card" key={p.id}>
                    <div className="proposal-item-header">
                      <span className="cat-badge">{p.category}</span>
                      <span className="closes-meta">Time left: {p.closesIn}</span>
                    </div>
                    <h3>{p.title}</h3>
                    <p className="proposal-desc">{p.description}</p>
                    <div className="proposal-creator-meta">Submitted by <span className="bold">{p.creator}</span></div>
                    
                    <div className="votes-tracker">
                      <div className="tracker-header">
                        <span>For: {p.votesYes.toLocaleString()} VP</span>
                        <span>Against: {p.votesNo.toLocaleString()} VP</span>
                      </div>
                      <div className="tracker-bar">
                        <div className="tracker-bar-yes" style={{ width: `${(p.votesYes / (p.votesYes + p.votesNo || 1)) * 100}%` }} />
                      </div>
                    </div>

                    <div className="item-actions">
                      <button 
                        disabled={busy || recentVotes[p.id] !== undefined} 
                        className={`btn-vote-yes ${recentVotes[p.id] === "yes" ? "voted-active" : ""}`}
                        onClick={() => vote(p.id, true, false)}
                      >
                        {recentVotes[p.id] === "yes" ? "Voted For ✓" : "Vote For"}
                      </button>
                      <button 
                        disabled={busy || recentVotes[p.id] !== undefined} 
                        className={`btn-vote-no ${recentVotes[p.id] === "no" ? "voted-active" : ""}`}
                        onClick={() => vote(p.id, false, false)}
                      >
                        {recentVotes[p.id] === "no" ? "Voted Against ✗" : "Vote Against"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: AI GENERATOR */}
          {activeTab === "ai-generator" && (
            <div className="ai-generator-layout">
              {/* Input Panel */}
              <div className="ai-gen-input-panel">
                <div className="ai-powered-tag">
                  <Sparkles size={14} className="purple-icon" />
                  <span>Powered by DNADAO AI</span>
                </div>
                <h2>Turn your idea into a full proposal</h2>
                <p className="subtitle">Describe your idea in one sentence. Our AI structures it into a governance-ready proposal.</p>

                <div className="form-group mt-2">
                  <label>YOUR IDEA</label>
                  <textarea 
                    value={ideaInput}
                    onChange={(e) => setIdeaInput(e.target.value)}
                    placeholder="We should allocate 5% of protocol fees to a developer grants fund to accelerate ecosystem growth..."
                  />
                </div>

                <div className="form-group">
                  <label>CATEGORY</label>
                  <select value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)}>
                    <option value="Treasury Allocation">Treasury Allocation</option>
                    <option value="Protocol Parameter">Protocol Parameter</option>
                    <option value="Ecosystem Grant">Ecosystem Grant</option>
                    <option value="Security Audits">Security Audits</option>
                    <option value="Community & Marketing">Community & Marketing</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group col">
                    <label>BUDGET MIN</label>
                    <input type="text" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} placeholder="0,000 min" />
                  </div>
                  <div className="form-group col">
                    <label>BUDGET MAX</label>
                    <input type="text" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder="50,000 max" />
                  </div>
                </div>

                <div className="form-group">
                  <label>TIMELINE</label>
                  <input type="text" value={timelineInput} onChange={(e) => setTimelineInput(e.target.value)} placeholder="3 Months" />
                </div>

                <button 
                  onClick={runAIGeneration} 
                  disabled={isGeneratingAI || !ideaInput.trim()} 
                  className="btn-ai-generate width-100 flex-center"
                >
                  {isGeneratingAI ? (
                    <>
                      <RefreshCw className="spinner-icon" size={16} />
                      <span>{aiGenStep === 0 && "Analyzing 847 proposals..."}</span>
                      <span>{aiGenStep === 1 && "Extracting problem statements..."}</span>
                      <span>{aiGenStep === 2 && "Simulating risk scores..."}</span>
                      <span>{aiGenStep === 3 && "Structuring KPIs..."}</span>
                      <span>{aiGenStep === 4 && "Finalizing draft..."}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Generate Proposal with AI</span>
                    </>
                  )}
                </button>
                <div className="ai-subtext mt-1">AI analyzes 847 past proposals to optimize structure</div>
              </div>

              {/* Output Panel */}
              <div className="ai-gen-output-panel">
                {isGeneratingAI && (
                  <div className="ai-loading-container">
                    <div className="radar-spinner" />
                    <p className="mt-2">Constructing structured markdown, evaluating parameters, modeling on-chain impact and budget fits...</p>
                  </div>
                )}

                {!isGeneratingAI && !generatedProposal && (
                  <div className="ai-empty-state">
                    <Brain size={48} className="muted-icon" />
                    <h3>Awaiting Input Parameters</h3>
                    <p>Provide a brief idea on the left and select "Generate Proposal with AI" to generate a detailed, structured governance draft containing problem statements, solutions, risks, budgets, timelines, and quantitative key performance indicators.</p>
                  </div>
                )}

                {!isGeneratingAI && generatedProposal && (
                  <div className="generated-proposal-container">
                    <div className="generated-success-banner flex-between">
                      <div className="flex-center green">
                        <CheckCircle size={16} />
                        <span className="bold ml-05">Generated Successfully</span>
                      </div>
                      <span className="proposal-index">Proposal #P-048 · Generated 2s ago</span>
                    </div>

                    <h2 className="proposal-main-title mt-2">{generatedProposal.title}</h2>
                    
                    <div className="proposal-section mt-1">
                      <label className="section-hdr">PROBLEM STATEMENT</label>
                      <p>{generatedProposal.problem}</p>
                    </div>

                    <div className="proposal-section">
                      <label className="section-hdr">PROPOSED SOLUTION</label>
                      <p>{generatedProposal.solution}</p>
                    </div>

                    <div className="proposal-meta-grid">
                      <div className="meta-item">
                        <span className="lbl">BUDGET</span>
                        <span className="val green">{generatedProposal.budget}</span>
                      </div>
                      <div className="meta-item">
                        <span className="lbl">TIMELINE</span>
                        <span className="val green">{generatedProposal.timeline}</span>
                      </div>
                      <div className="meta-item">
                        <span className="lbl">RISK LEVEL</span>
                        <span className="val orange">{generatedProposal.risk}</span>
                      </div>
                      <div className="meta-item">
                        <span className="lbl">COMMUNITY FIT</span>
                        <span className="val purple">{generatedProposal.alignment}</span>
                      </div>
                    </div>

                    <div className="proposal-section">
                      <label className="section-hdr">KEY PERFORMANCE INDICATORS (KPIS)</label>
                      <ul className="kpis-ul">
                        {generatedProposal.kpis.map((kpi: string, i: number) => (
                          <li key={i}>{kpi}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="generated-proposal-actions">
                      <button 
                        disabled={busy} 
                        className="btn-submit-dao width-50"
                        onClick={async () => {
                          const done = await submitProposal(generatedProposal.title, generatedProposal.solution);
                          if (done) {
                            setActiveTab("proposals");
                          }
                        }}
                      >
                        Submit to DAO
                      </button>
                      <button className="btn-edit-draft width-50">Edit Draft</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: DNA PROFILES */}
          {activeTab === "dna-profiles" && (
            <div className="dna-profiles-layout">
              {/* Sidebar Members list */}
              <div className="dna-members-sidebar">
                <div className="sidebar-header">
                  <div className="flex-between">
                    <span className="members-count-lbl">Community Members</span>
                    <span className="active-members-badge">1,847 DNA profiles active</span>
                  </div>
                  <div className="search-box mt-1">
                    <Search size={16} />
                    <input 
                      type="text" 
                      placeholder="Search members..." 
                      value={searchMemberQuery}
                      onChange={(e) => setSearchMemberQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="members-scrollable-list">
                  {filteredMembers.map((m) => (
                    <div 
                      className={`member-row-item ${selectedMember.name === m.name ? "selected" : ""}`}
                      key={m.name}
                      onClick={() => setSelectedMember(m)}
                    >
                      <div className="flex-center">
                        <div className="avatar-small">{m.avatar}</div>
                        <div>
                          <div className="row-name">{m.name}</div>
                          <div className="row-archetype">{m.archetype}</div>
                        </div>
                      </div>
                      <div className="row-score-value">{m.score}</div>
                    </div>
                  ))}
                  {filteredMembers.length === 0 && (
                    <p className="no-members-found">No DNA profiles matching search query.</p>
                  )}
                </div>
                
                <div className="view-all-members-footer">
                  <button className="text-btn">View all 1,847 members →</button>
                </div>
              </div>

              {/* Radar and Sliders details */}
              <div className="dna-profile-details">
                <div className="details-header flex-between">
                  <div className="flex-center">
                    <div className="avatar-large">{selectedMember.avatar}</div>
                    <div>
                      <h2>{selectedMember.name}</h2>
                      <div className="flex-center">
                        <span className="archetype-badge">{selectedMember.archetype}</span>
                        <span className="member-score-highlight ml-1">DNA Score: {selectedMember.score}</span>
                      </div>
                    </div>
                  </div>
                  <span className="percentile-badge">{selectedMember.percentile}</span>
                </div>

                <p className="member-behavior-history mt-1">{selectedMember.history}</p>

                {/* Radar Grid and Sliders */}
                <div className="radar-layout-container mt-2">
                  <div className="radar-chart-card">
                    {/* SVG Hexagon Radar Chart */}
                    <svg className="radar-svg" width="200" height="200" viewBox="0 0 200 200">
                      {/* Hexagon lines grids */}
                      <polygon points="100,20 169,60 169,140 100,180 31,140 31,60" fill="none" stroke="#E5E7EB" strokeWidth="1" />
                      <polygon points="100,40 152,70 152,130 100,160 48,130 48,70" fill="none" stroke="#E5E7EB" strokeWidth="1" />
                      <polygon points="100,60 135,80 135,120 100,140 65,120 65,80" fill="none" stroke="#E5E7EB" strokeWidth="1" />
                      <polygon points="100,80 117,90 117,110 100,120 83,110 83,90" fill="none" stroke="#E5E7EB" strokeWidth="1" />
                      
                      {/* Axis labels lines */}
                      <line x1="100" y1="20" x2="100" y2="180" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2 2" />
                      <line x1="31" y1="60" x2="169" y2="140" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2 2" />
                      <line x1="169" y1="60" x2="31" y2="140" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2 2" />

                      {/* Radar polygon filled */}
                      <polygon points={radarPoints} fill="rgba(16, 185, 129, 0.18)" stroke="#10B981" strokeWidth="2.5" />
                      
                      {/* Radar point dots */}
                      {radarPoints.split(" ").map((pt, idx) => {
                        const [x, y] = pt.split(",");
                        return <circle key={idx} cx={x} cy={y} r="4" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />;
                      })}

                      {/* Hexagon Text labels */}
                      <text x="100" y="14" textAnchor="middle" fontSize="9" fontWeight="600" fill="#132D20">Innovation</text>
                      <text x="175" y="60" textAnchor="start" fontSize="9" fontWeight="600" fill="#132D20">Risk</text>
                      <text x="175" y="146" textAnchor="start" fontSize="9" fontWeight="600" fill="#132D20">Financial</text>
                      <text x="100" y="192" textAnchor="middle" fontSize="9" fontWeight="600" fill="#132D20">Participation</text>
                      <text x="25" y="146" textAnchor="end" fontSize="9" fontWeight="600" fill="#132D20">Focus</text>
                      <text x="25" y="60" textAnchor="end" fontSize="9" fontWeight="600" fill="#132D20">Community</text>
                    </svg>
                  </div>

                  <div className="radar-scores-sliders">
                    <div className="slider-item">
                      <div className="slider-label">
                        <span>Innovation Score</span>
                        <span>{selectedMember.scores.innovation}/100</span>
                      </div>
                      <div className="slider-track">
                        <div className="slider-fill bg-emerald" style={{ width: `${selectedMember.scores.innovation}%` }} />
                      </div>
                    </div>
                    <div className="slider-item">
                      <div className="slider-label">
                        <span>Risk Appetite</span>
                        <span>{selectedMember.scores.risk}/100</span>
                      </div>
                      <div className="slider-track">
                        <div className="slider-fill bg-purple" style={{ width: `${selectedMember.scores.risk}%` }} />
                      </div>
                    </div>
                    <div className="slider-item">
                      <div className="slider-label">
                        <span>Community Focus</span>
                        <span>{selectedMember.scores.community}/100</span>
                      </div>
                      <div className="slider-track">
                        <div className="slider-fill bg-cyan" style={{ width: `${selectedMember.scores.community}%` }} />
                      </div>
                    </div>
                    <div className="slider-item">
                      <div className="slider-label">
                        <span>Financial Views</span>
                        <span>{selectedMember.scores.financial}/100</span>
                      </div>
                      <div className="slider-track">
                        <div className="slider-fill bg-orange" style={{ width: `${selectedMember.scores.financial}%` }} />
                      </div>
                    </div>
                    <div className="slider-item">
                      <div className="slider-label">
                        <span>Participation Rate</span>
                        <span>{selectedMember.scores.participation}/100</span>
                      </div>
                      <div className="slider-track">
                        <div className="slider-fill bg-emerald" style={{ width: `${selectedMember.scores.participation}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ai-dna-insights-panel mt-2">
                  <div className="insights-header">
                    <Sparkles size={16} className="orange-icon" />
                    <h3>AI DNA Insights</h3>
                    <span className="learned-badge">Learned from on-chain behavior</span>
                  </div>
                  <div className="insight-content-block">
                    <p className="bold">{selectedMember.archetype}</p>
                    <p className="mt-05">{selectedMember.alignment}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ACTIVE VOTES */}
          {activeTab === "active-votes" && (
            <div className="active-votes-layout">
              {/* Live Votes List */}
              <div className="live-votes-list-container">
                <div className="live-votes-header flex-between">
                  <h2>Live Votes</h2>
                  <span className="live-votes-count-pill">3 Active</span>
                </div>

                <div className="live-votes-feed mt-1">
                  {mockProposals.filter(p => p.status === "Active").map((p) => (
                    <div className="live-vote-card" key={p.id}>
                      <div className="live-vote-hdr flex-between">
                        <span className="lbl-tag">{p.id} · {p.category}</span>
                        <span className="closes-countdown">Closes in {p.closesIn}</span>
                      </div>
                      <h3>{p.title}</h3>
                      <div className="user-voting-power-line flex-between mt-1">
                        <span>Your Voting Power: <span className="bold text-emerald">1,247 VP</span></span>
                        <span>Total Votes: {(p.votesYes + p.votesNo).toLocaleString()} VP</span>
                      </div>

                      {/* Vote Split Graph */}
                      <div className="split-graph-tracker">
                        <div className="split-graph-bars flex">
                          <div className="bar-yes" style={{ width: `${(p.votesYes / (p.votesYes + p.votesNo || 1)) * 100}%` }} />
                          <div className="bar-no" style={{ width: `${(p.votesNo / (p.votesYes + p.votesNo || 1)) * 100}%` }} />
                        </div>
                        <div className="split-text flex-between">
                          <span className="yes-text">For {(p.votesYes / (p.votesYes + p.votesNo || 1) * 100).toFixed(0)}% — {p.votesYes.toLocaleString()} VP</span>
                          <span className="no-text">Against {(p.votesNo / (p.votesYes + p.votesNo || 1) * 100).toFixed(0)}% — {p.votesNo.toLocaleString()} VP</span>
                        </div>
                      </div>

                      {/* Cast Action */}
                      <div className="cast-vote-actions">
                        <button 
                          disabled={busy || recentVotes[p.id] !== undefined} 
                          onClick={() => vote(p.id, true, false)}
                          className="btn-vote-yes"
                        >
                          Vote For
                        </button>
                        <button 
                          disabled={busy || recentVotes[p.id] !== undefined} 
                          onClick={() => vote(p.id, false, false)}
                          className="btn-vote-no"
                        >
                          Vote Against
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sub components row */}
                <div className="sub-components-grid mt-2">
                  <div className="sub-comp-card">
                    <h3>Voting Power Formula</h3>
                    <div className="formula-math flex-center mt-1">
                      <div>
                        <div className="math-expression">VP = (Contribution * 0.4) + (Reputation * 0.35) + (Participation * 0.25)</div>
                      </div>
                    </div>
                    <div className="formula-cards flex mt-1">
                      <div className="formula-box">
                        <div className="formula-pct">40%</div>
                        <div className="formula-desc">Contribution</div>
                      </div>
                      <div className="formula-box">
                        <div className="formula-pct">35%</div>
                        <div className="formula-desc">Reputation</div>
                      </div>
                      <div className="formula-box">
                        <div className="formula-pct">25%</div>
                        <div className="formula-desc">Participation</div>
                      </div>
                    </div>
                  </div>

                  <div className="sub-comp-card">
                    <h3>Smart Contract Execution Log</h3>
                    <div className="execution-logs-list mt-1">
                      <div className="execution-row">
                        <div className="exec-hdr flex-between">
                          <span className="exec-title bold">Treasury Release — P-045</span>
                          <span className="exec-status executed">Executed</span>
                        </div>
                        <div className="exec-meta">0x4cf806...d91c → 0xMulti-Safe · 2h ago</div>
                      </div>
                      <div className="execution-row">
                        <div className="exec-hdr flex-between">
                          <span className="exec-title bold">DNA Evolution Update — 1,204 members</span>
                          <span className="exec-status executed">Executed</span>
                        </div>
                        <div className="exec-meta">RxDNA_Chain → On-chain record · 13h ago</div>
                      </div>
                      <div className="execution-row">
                        <div className="exec-hdr flex-between">
                          <span className="exec-title bold">VP Recalculation — Epoch 14</span>
                          <span className="exec-status pending">Pending</span>
                        </div>
                        <div className="exec-meta">0xRep_calc → Pending finality · In queue</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reputation Leaderboard and Feed */}
              <div className="reputation-side-panel">
                <div className="reputation-leaderboard-card">
                  <h3>Reputation Leaderboard</h3>
                  <p className="meta-desc">Voting Power · Contribution · Reputation · Participation</p>
                  
                  <div className="leaderboard-items mt-1">
                    {members.slice(0, 5).map((m, i) => (
                      <div className="lead-row" key={m.name}>
                        <div className="flex-center">
                          <span className="lead-index">{i + 1}</span>
                          <div className="avatar-small">{m.avatar}</div>
                          <span className="lead-name">{m.name}</span>
                        </div>
                        <div className="lead-scores-right">
                          <div className="lead-vp">{(m.score * 1.4).toFixed(0)} VP</div>
                          <div className="lead-subscore">Score {m.score}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="onchain-active-feed-card mt-2">
                  <h3>On-Chain Active Feed</h3>
                  <div className="scrolling-activity-feed mt-1">
                    <div className="feed-item">
                      <span className="bullet green">●</span>
                      <span>VOTE: P-047 FOR with +1,247 VP</span>
                    </div>
                    <div className="feed-item">
                      <span className="bullet green">●</span>
                      <span>EXECUTE: Treasury 45K → 0xGrant_Fund</span>
                    </div>
                    <div className="feed-item">
                      <span className="bullet yellow">●</span>
                      <span>UPDATE: Sarah.eth +12 rep</span>
                    </div>
                    <div className="feed-item">
                      <span className="bullet green">●</span>
                      <span>PROPOSAL: #P-048 submitted by 0x44f3...</span>
                    </div>
                  </div>
                  <div className="activity-live-badge mt-1 flex-center">
                    <span className="green-dot mr-05" />
                    <span>Live · Zero Central Authority · Fully On-Chain</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: COMMUNITY CHAT */}
          {activeTab === "community-intel" && (
            <div className="community-chat-layout">
              {/* Left Sidebar: Select Proposal */}
              <div className="chat-proposals-sidebar">
                <span className="members-count-lbl">DISCUSS A PROPOSAL</span>
                <div className="chat-proposals-list">
                  {mockProposals.map((p) => (
                    <div 
                      key={p.id} 
                      className={`chat-proposal-item ${selectedChatProposalId === p.id ? "selected" : ""}`}
                      onClick={() => setSelectedChatProposalId(p.id)}
                    >
                      <div className="chat-proposal-meta">
                        <span>{p.id}</span>
                        <span className={`row-status badge-${p.status.toLowerCase().replace(" ", "")}`}>{p.status}</span>
                      </div>
                      <div className="chat-proposal-title truncate">{p.title}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Panel: Chat Window */}
              <div className="chat-window">
                {(() => {
                  const selectedProp = mockProposals.find(p => p.id === selectedChatProposalId);
                  if (!selectedProp) {
                    return (
                      <div className="chat-empty-state">
                        <MessageSquare size={48} className="muted-icon" />
                        <h3>Select a proposal to start discussing</h3>
                      </div>
                    );
                  }

                  const userSender = wallet.publicKey ? wallet.publicKey.toBase58().substring(0, 6) + "..." + wallet.publicKey.toBase58().substring(38) : "Adit Kumar";

                  return (
                    <>
                      <div className="chat-header">
                        <div className="chat-header-title">{selectedProp.title}</div>
                        <div className="chat-header-subtitle">Discussing proposal {selectedProp.id} · Category: {selectedProp.category}</div>
                      </div>

                      <div className="chat-messages-container">
                        {chatMessages.length === 0 ? (
                          <div className="chat-empty-state">
                            <Brain size={32} className="muted-icon" style={{ opacity: 0.5 }} />
                            <p className="mt-05">No messages in this discussion thread yet. Be the first to say something!</p>
                          </div>
                        ) : (
                          chatMessages.map((msg, idx) => {
                            const isOutgoing = msg.sender === userSender;
                            return (
                              <div 
                                key={msg._id || idx} 
                                className={`chat-message-bubble ${isOutgoing ? "outgoing" : "incoming"}`}
                              >
                                <span className="chat-msg-sender">{msg.sender}</span>
                                <span>{msg.content}</span>
                                <span className="chat-msg-time">
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>

                      <div className="chat-input-area">
                        <input 
                          type="text" 
                          placeholder="Type your message about this proposal..." 
                          className="chat-text-input"
                          value={newMessageText}
                          onChange={(e) => setNewMessageText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              sendChatMessage();
                            }
                          }}
                        />
                        <button className="chat-send-btn" onClick={sendChatMessage}>
                          <Send size={14} />
                          <span>Send</span>
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* TAB 7: DEBATE AI */}
          {activeTab === "debate-ai" && (
            <div className="debate-ai-layout" style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "24px", alignItems: "stretch", minHeight: "580px" }}>
              {/* Left Sidebar: Select Proposal or Custom Mode */}
              <div className="chat-proposals-sidebar" style={{ display: "flex", flexDirection: "column", height: "auto" }}>
                <span className="members-count-lbl">SELECT DAO / PROPOSAL DEBATE</span>
                
                {/* Mode Toggles */}
                <div className="debate-mode-toggles mt-1 flex" style={{ gap: "8px", marginBottom: "12px" }}>
                  <button 
                    className={`btn-vote-no ${debateMode === "proposal" ? "active-mode-btn" : ""}`} 
                    style={{ flex: 1, padding: "8px 12px", fontSize: "0.78rem" }}
                    onClick={() => {
                      setDebateMode("proposal");
                      setDebateNLPResult(null);
                      setDebateError(null);
                    }}
                  >
                    DAO Proposals
                  </button>
                  <button 
                    className={`btn-vote-no ${debateMode === "custom" ? "active-mode-btn" : ""}`} 
                    style={{ flex: 1, padding: "8px 12px", fontSize: "0.78rem" }}
                    onClick={() => {
                      setDebateMode("custom");
                      setDebateNLPResult(null);
                      setDebateError(null);
                    }}
                  >
                    Custom Input
                  </button>
                </div>

                {debateMode === "proposal" ? (
                  <div className="chat-proposals-list" style={{ flexGrow: 1, maxHeight: "500px", overflowY: "auto" }}>
                    {mockProposals.map((p) => (
                      <div 
                        key={p.id} 
                        className={`chat-proposal-item ${selectedDebateProposalId === p.id ? "selected" : ""}`}
                        onClick={() => {
                          setSelectedDebateProposalId(p.id);
                          setDebateNLPResult(null);
                          setDebateError(null);
                        }}
                      >
                        <div className="chat-proposal-meta">
                          <span>{p.id}</span>
                          <span className={`row-status badge-${p.status.toLowerCase().replace(" ", "")}`}>{p.status}</span>
                        </div>
                        <div className="chat-proposal-title truncate">{p.title}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="custom-input-sidebar-info flex-center" style={{ flexGrow: 1, padding: "16px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem", flexDirection: "column", justifyContent: "center" }}>
                    <Brain size={24} style={{ marginBottom: "12px", opacity: 0.5 }} />
                    <span>Paste custom conversation threads in the central panel to analyze consensus.</span>
                  </div>
                )}
              </div>

              {/* Right Panel: Active Analysis Area */}
              <div className="debate-analysis-panel" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                
                {/* Inputs and Preview Section */}
                <div className="ai-gen-input-panel" style={{ width: "100%" }}>
                  <div className="ai-powered-tag" style={{ backgroundColor: "#f3e8ff", color: "#7c3aed" }}>
                    <Sparkles size={14} className="purple-icon" />
                    <span>NLP Consensus Engine — M-04</span>
                  </div>

                  {debateMode === "proposal" ? (
                    <>
                      {(() => {
                        const selectedProp = mockProposals.find(p => p.id === selectedDebateProposalId);
                        if (!selectedProp) return null;
                        return (
                          <div style={{ marginBottom: "20px" }}>
                            <h2 style={{ fontSize: "1.3rem", marginBottom: "6px" }}>{selectedProp.title}</h2>
                            <p className="subtitle" style={{ marginBottom: "12px" }}>
                              {selectedProp.description}
                            </p>
                            
                            <div className="proposal-section">
                              <label className="section-hdr">COMMUNITY DISCUSSION THREAD (PREVIEW)</label>
                              <div style={{ 
                                backgroundColor: "rgba(243, 244, 246, 0.5)", 
                                border: "1px solid var(--border-color)", 
                                borderRadius: "10px", 
                                padding: "14px", 
                                maxHeight: "150px", 
                                overflowY: "auto",
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px"
                              }}>
                                {currentDebateMessages.length === 0 ? (
                                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                                    No community discussions found for this proposal. Fallback discussion will be used.
                                  </span>
                                ) : (
                                  currentDebateMessages.map((msg, i) => (
                                    <div key={i} style={{ display: "flex", gap: "8px", fontSize: "0.82rem" }}>
                                      <span className="bold text-emerald" style={{ whiteSpace: "nowrap" }}>
                                        Participant {i + 1}:
                                      </span>
                                      <span style={{ color: "var(--text-secondary)" }}>{msg}</span>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  ) : (
                    <div className="form-group mt-2">
                      <label>PASTE COMMUNITY THREAD TRANSCRIPT (ONE MESSAGE PER LINE)</label>
                      <textarea 
                        value={debateInput}
                        onChange={(e) => setDebateInput(e.target.value)}
                        placeholder={"User A: I support this budget.\nUser B: Too high! I oppose it.\nUser C: Let's do half budget."}
                        rows={6}
                        style={{ minHeight: "120px" }}
                      />
                    </div>
                  )}

                  <button 
                    onClick={analyzeDebate} 
                    disabled={isAnalyzingDebate || (debateMode === "custom" && !debateInput.trim())} 
                    className="btn-ai-generate width-100 flex-center"
                  >
                    {isAnalyzingDebate ? (
                      <>
                        <RefreshCw className="spinner-icon" size={16} />
                        <span>Querying Deployed NLP Engine...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>Run Deployed NLP Sentiment & Consensus Analysis</span>
                      </>
                    )}
                  </button>

                  {debateError && (
                    <div className="auth-error-banner mt-1" style={{ width: "100%", boxSizing: "border-box" }}>
                      Error: {debateError}
                    </div>
                  )}
                </div>

                {/* Dashboard Results Section */}
                <div className="ai-gen-output-panel" style={{ width: "100%", minHeight: debateNLPResult ? "auto" : "200px" }}>
                  {isAnalyzingDebate && (
                    <div className="ai-loading-container" style={{ margin: "auto", textAlign: "center", padding: "40px", width: "100%" }}>
                      <div className="radar-spinner" style={{ margin: "0 auto 16px" }} />
                      <p className="bold mt-2" style={{ color: "var(--text-primary)" }}>Analyzing Discussion with Deployed MLP Model...</p>
                      <p className="mt-05 font-small" style={{ color: "var(--text-muted)" }}>
                        Running sentiment extraction, parsing supportive vs opposing nodes, and computing mathematical consensus metrics.
                      </p>
                    </div>
                  )}

                  {!isAnalyzingDebate && !debateNLPResult && (
                    <div className="ai-empty-state">
                      <Brain size={48} className="muted-icon" />
                      <h3>Consensus Dashboard Awaiting Input</h3>
                      <p>
                        Select a proposal from the sidebar or provide a custom thread transcript, then click the analyze button to run the deployed sentiment classification model.
                      </p>
                    </div>
                  )}

                  {!isAnalyzingDebate && debateNLPResult && (
                    <div className="debate-analysis-results" style={{ padding: "28px", width: "100%" }}>
                      <div className="generated-success-banner flex-between" style={{ marginBottom: "24px" }}>
                        <div className="flex-center green">
                          <CheckCircle size={16} />
                          <span className="bold ml-05">Deployed MLP Analysis Active</span>
                        </div>
                        <span className="sentiment-tag-h" style={{ 
                          color: debateNLPResult.overall_sentiment === "Positive" ? "var(--accent-green)" : 
                                 debateNLPResult.overall_sentiment === "Negative" ? "#ef4444" : "var(--text-muted)",
                          fontWeight: 800,
                          fontSize: "0.8rem",
                          textTransform: "uppercase"
                        }}>
                          Overall Sentiment: {debateNLPResult.overall_sentiment}
                        </span>
                      </div>

                      {/* Premium Stats Grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
                        <div className="metric-box">
                          <span className="lbl">CONSENSUS LEVEL</span>
                          <span className="val" style={{ 
                            color: debateNLPResult.consensus.toLowerCase().includes("support") ? "var(--accent-green)" : 
                                   debateNLPResult.consensus.toLowerCase().includes("oppose") ? "#ef4444" : "#eab308"
                          }}>
                            {debateNLPResult.consensus}
                          </span>
                        </div>
                        <div className="metric-box">
                          <span className="lbl">SUPPORT RATE</span>
                          <span className="val text-emerald">{(debateNLPResult.support_rate).toFixed(1)}%</span>
                        </div>
                        <div className="metric-box">
                          <span className="lbl">MODEL CONFIDENCE</span>
                          <span className="val text-purple">{(debateNLPResult.confidence * 100).toFixed(1)}%</span>
                        </div>
                      </div>

                      {/* Tricolor Sentiment Proportion Bar Chart */}
                      <div style={{ backgroundColor: "var(--bg-main)", padding: "20px", borderRadius: "14px", marginBottom: "24px" }}>
                        <div className="flex-between" style={{ fontSize: "0.78rem", fontWeight: 700, marginBottom: "8px" }}>
                          <span>SENTIMENT VOLUME SPLIT</span>
                          <span style={{ color: "var(--text-muted)" }}>{debateNLPResult.total_messages} messages analyzed</span>
                        </div>
                        
                        {/* Horizontal tricolor bar */}
                        <div style={{ 
                          height: "12px", 
                          borderRadius: "99px", 
                          overflow: "hidden", 
                          display: "flex", 
                          width: "100%",
                          backgroundColor: "#eae6dc" 
                        }}>
                          {(() => {
                            const supportive = debateNLPResult.metrics.supportive;
                            const opposing = debateNLPResult.metrics.opposing;
                            const neutral = debateNLPResult.metrics.neutral_mixed;
                            const total = Math.max(1, supportive + opposing + neutral);

                            const sPct = (supportive / total) * 100;
                            const oPct = (opposing / total) * 100;
                            const nPct = (neutral / total) * 100;

                            return (
                              <>
                                {sPct > 0 && <div style={{ width: `${sPct}%`, backgroundColor: "var(--accent-green)" }} title={`Supportive: ${supportive}`} />}
                                {nPct > 0 && <div style={{ width: `${nPct}%`, backgroundColor: "#9ca3af" }} title={`Neutral/Mixed: ${neutral}`} />}
                                {oPct > 0 && <div style={{ width: `${oPct}%`, backgroundColor: "#f87171" }} title={`Opposing: ${opposing}`} />}
                              </>
                            );
                          })()}
                        </div>

                        {/* Legend */}
                        <div className="flex" style={{ gap: "16px", marginTop: "12px", fontSize: "0.75rem", fontWeight: 600 }}>
                          <div className="flex-center">
                            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--accent-green)", marginRight: "6px" }} />
                            <span>Supportive: {debateNLPResult.metrics.supportive}</span>
                          </div>
                          <div className="flex-center">
                            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#9ca3af", marginRight: "6px" }} />
                            <span>Neutral/Mixed: {debateNLPResult.metrics.neutral_mixed}</span>
                          </div>
                          <div className="flex-center">
                            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#f87171", marginRight: "6px" }} />
                            <span>Opposing: {debateNLPResult.metrics.opposing}</span>
                          </div>
                        </div>
                      </div>

                      {/* Keyword Tag Clouds */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
                        <div style={{ border: "1px solid var(--border-color)", padding: "16px", borderRadius: "14px", backgroundColor: "#ffffff" }}>
                          <label className="section-hdr text-emerald" style={{ marginBottom: "10px" }}>KEY SUPPORTIVE SIGNALS</label>
                          <div className="flex" style={{ flexWrap: "wrap", gap: "8px" }}>
                            {debateNLPResult.words.positive.length === 0 ? (
                              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>None detected</span>
                            ) : (
                              debateNLPResult.words.positive.map((word: string, i: number) => (
                                <span key={i} className="cat-badge" style={{ backgroundColor: "var(--bg-green-light)", color: "var(--accent-green)", fontSize: "0.72rem" }}>
                                  {word}
                                </span>
                              ))
                            )}
                          </div>
                        </div>

                        <div style={{ border: "1px solid var(--border-color)", padding: "16px", borderRadius: "14px", backgroundColor: "#ffffff" }}>
                          <label className="section-hdr text-orange" style={{ marginBottom: "10px" }}>KEY OPPOSING SIGNALS</label>
                          <div className="flex" style={{ flexWrap: "wrap", gap: "8px" }}>
                            {debateNLPResult.words.negative.length === 0 ? (
                              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>None detected</span>
                            ) : (
                              debateNLPResult.words.negative.map((word: string, i: number) => (
                                <span key={i} className="cat-badge" style={{ backgroundColor: "#fef2f2", color: "#ef4444", fontSize: "0.72rem" }}>
                                  {word}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      {/* AI Deployment Advice */}
                      <div className="ai-dna-insights-panel" style={{ backgroundColor: "#faf5ff", borderColor: "#f3e8ff", borderRadius: "14px", padding: "20px" }}>
                        <div className="insights-header" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                          <Sparkles size={16} className="purple-icon" />
                          <h3 style={{ color: "#6b21a8", fontSize: "1rem", fontWeight: 700 }}>Decentralized Consensus Recommendation</h3>
                        </div>
                        <p className="mt-05 font-small" style={{ color: "#581c87", lineHeight: 1.45, fontSize: "0.88rem" }}>
                          {(() => {
                            const rate = debateNLPResult.support_rate;
                            const consensus = debateNLPResult.consensus;
                            if (rate >= 75) {
                              return `Excellent alignment observed! The community shows high consensus (${consensus}) with a support rate of ${rate.toFixed(1)}%. It is highly recommended to proceed directly to an on-chain reputation vote, as this draft has met the required interest threshold.`;
                            } else if (rate >= 50) {
                              return `Moderate consensus (${consensus}) observed. The support rate is ${rate.toFixed(1)}%, which shows general interest but highlights lingering concerns about key parameters (e.g. budget or timeline). Suggest launching a community poll or hosting a Discord AMA to refine the draft before locking the proposal on-chain.`;
                            } else {
                              return `Low consensus (${consensus}) observed. The support rate is only ${rate.toFixed(1)}%. There are significant opposing viewpoints regarding the feasibility of this proposal. It is strongly recommended to table this initiative, or initiate a major rewrite of the problem statement and solution variables in the AI Generator tab.`;
                            }
                          })()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: IMPACT SIMULATOR */}
          {activeTab === "impact-simulator" && (
            <div className="impact-simulator-layout">
              <div className="ai-gen-input-panel">
                <div className="ai-powered-tag">
                  <TrendingUp size={14} className="cyan-icon" />
                  <span>Future Impact Simulator — M-05</span>
                </div>
                <h2>Model governance actions prior to on-chain voting</h2>
                <p className="subtitle">Simulate proposal parameters against ecosystem modeling variables to calculate risk quotients and growth ratios.</p>

                <div className="form-group mt-2">
                  <label>PROPOSAL CATEGORY</label>
                  <select value={simCategory} onChange={(e) => setSimCategory(e.target.value)}>
                    <option value="Treasury Allocation">Treasury Allocation</option>
                    <option value="Protocol Parameter">Protocol Parameter</option>
                    <option value="Ecosystem Grant">Ecosystem Grant</option>
                  </select>
                </div>

                <div className="form-group">
                  <div className="flex-between">
                    <label>BUDGET REQUESTED</label>
                    <span className="bold text-emerald">${simBudget.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" 
                    min="5000" 
                    max="150000" 
                    step="5000"
                    value={simBudget}
                    onChange={(e) => setSimBudget(Number(e.target.value))}
                    className="slider-range-control"
                  />
                </div>

                <div className="form-group">
                  <div className="flex-between">
                    <label>EXECUTION TIMELINE (MONTHS)</label>
                    <span className="bold text-emerald">{simDuration} Months</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="12" 
                    step="1"
                    value={simDuration}
                    onChange={(e) => setSimDuration(Number(e.target.value))}
                    className="slider-range-control"
                  />
                </div>
              </div>

              <div className="ai-gen-output-panel">
                <div className="sim-results-card">
                  <h2>Simulation Modeling Predictions</h2>
                  <p className="subtitle">Simulated against active liquidity pools, contributor engagement indices, and historical governance models.</p>

                  <div className="simulation-kpis-grid mt-2">
                    <div className="sim-kpi-item">
                      <span className="lbl">TREASURY RESERVES IMPACT</span>
                      <span className={`val ${simBudget > 80000 ? "text-orange" : "text-emerald"}`}>{simResult.treasuryImpact}</span>
                    </div>

                    <div className="sim-kpi-item">
                      <span className="lbl">Ecosystem Growth Multiplier</span>
                      <span className="val text-emerald">{simResult.growthProjection}</span>
                    </div>

                    <div className="sim-kpi-item">
                      <span className="lbl">RISK QUOTIENT</span>
                      <span className={`val ${simBudget > 80000 ? "text-orange" : "text-emerald"}`}>{simResult.riskScore}</span>
                    </div>

                    <div className="sim-kpi-item">
                      <span className="lbl">COMMUNITY SUPPORT FORECAST</span>
                      <span className="val text-purple">{simResult.communitySentiment}</span>
                    </div>
                  </div>

                  <div className="visual-indicator-graph mt-2">
                    <div className="flex-between font-small bold">
                      <span>PROJECTED VIABILITY INDEX</span>
                      <span>{simBudget > 100000 ? "Caution (62%)" : "Highly Viable (88%)"}</span>
                    </div>
                    <div className="tracker-bar mt-05">
                      <div 
                        className={`tracker-bar-yes ${simBudget > 100000 ? "bg-orange" : "bg-emerald"}`} 
                        style={{ width: simBudget > 100000 ? "62%" : "88%" }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: REPUTATION */}
          {activeTab === "reputation" && (
            <div className="reputation-dashboard-layout card-full">
              <h2>On-Chain Reputation Mechanics</h2>
              <p className="subtitle">Reputation points (REP) are minted directly through productive community engagement. Zero central token-minting auth.</p>

              <div className="reputation-details-grid mt-2">
                <div className="rep-mechanics-card">
                  <h3>How to earn reputation</h3>
                  <div className="earning-steps mt-1">
                    <div className="step-row flex">
                      <div className="step-num">1</div>
                      <div>
                        <div className="bold">Deploy Clean Code / Complete Audits</div>
                        <div className="desc font-small">Contributions in developer portals earn up to +120 REP per milestone.</div>
                      </div>
                    </div>
                    <div className="step-row flex mt-1">
                      <div className="step-num">2</div>
                      <div>
                        <div className="bold">Submit Approved Proposals</div>
                        <div className="desc font-small">Writing highly-rated governance drafts earns +45 REP on successful vote execution.</div>
                      </div>
                    </div>
                    <div className="step-row flex mt-1">
                      <div className="step-num">3</div>
                      <div>
                        <div className="bold">Participate in Epcoh Voting</div>
                        <div className="desc font-small">Active validation and voting turnouts award stakers and delegates up to +15 REP.</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rep-metrics-panel">
                  <h3>Your Active Multipliers</h3>
                  <div className="multiplier-row mt-1 flex-between">
                    <span>Developer Multiplier</span>
                    <span className="badge-core">1.4x</span>
                  </div>
                  <div className="multiplier-row flex-between">
                    <span>Governance Turnout</span>
                    <span className="badge-usp">1.2x</span>
                  </div>
                  <div className="multiplier-row flex-between">
                    <span>Loyalty Coefficient</span>
                    <span className="badge-core">1.0x</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: SMART CONTRACTS */}
          {activeTab === "smart-contracts" && (
            <div className="smart-contracts-tab-layout">
              <div className="card-wide">
                <h2>Solana Smart Contract (dna_dao) Audit Hub</h2>
                <p className="subtitle">Direct interactions with our deployed Rust program accounts on Devnet/Mainnet.</p>
                
                <div className="code-viewer-container mt-2">
                  <div className="code-header flex-between">
                    <span>lib.rs (Solana Anchor Program)</span>
                    <span className="text-emerald">Validated & Deployed</span>
                  </div>
                  <pre className="rust-code-pre">
{`use anchor_lang::prelude::*;

declare_id!("4VoXoZ9jgTi4YY64FGroeomVcuwD28YZVvK2Ux6XtX5h");

#[program]
pub mod dna_dao {
    use super::*;

    pub fn initialize_dao(ctx: Context<InitializeDao>, name: String) -> Result<()> {
        require!(name.len() <= 64, DaoError::NameTooLong);
        let dao = &mut ctx.accounts.dao;
        dao.authority = ctx.accounts.authority.key();
        dao.name = name;
        dao.bump = ctx.bumps.dao;
        dao.proposal_count = 0;
        Ok(())
    }

    pub fn create_proposal(ctx: Context<CreateProposal>, title: String, description: String) -> Result<()> {
        require!(title.len() <= 100, DaoError::TitleTooLong);
        require!(description.len() <= 500, DaoError::DescriptionTooLong);
        let dao = &mut ctx.accounts.dao;
        let proposal = &mut ctx.accounts.proposal;
        proposal.dao = dao.key();
        proposal.creator = ctx.accounts.creator.key();
        proposal.title = title;
        proposal.description = description;
        proposal.votes_yes = 0;
        proposal.votes_no = 0;
        proposal.executed = false;
        proposal.bump = ctx.bumps.proposal;
        proposal.index = dao.proposal_count;
        dao.proposal_count = dao.proposal_count.checked_add(1).ok_or(DaoError::Overflow)?;
        Ok(())
    }
}`}
                  </pre>
                </div>
              </div>

              <div className="reputation-side-panel">
                <div className="contract-status-card">
                  <h3>Contract Info</h3>
                  <div className="info-row mt-1 flex-between">
                    <span>Program ID</span>
                    <span className="mono-code">4VoXoZ9j...tX5h</span>
                  </div>
                  <div className="info-row flex-between">
                    <span>DAO Name Seed</span>
                    <span className="mono-code">"DNA DAO"</span>
                  </div>
                  <div className="info-row flex-between">
                    <span>Network</span>
                    <span className="text-emerald">Solana Devnet</span>
                  </div>
                </div>

                <div className="pda-mapping-card mt-2">
                  <h3>PDA Account Seeds</h3>
                  <div className="pda-step mt-1">
                    <span className="bold block font-small">DAO Account:</span>
                    <code className="pda-code">["dao", "DNA DAO"]</code>
                  </div>
                  <div className="pda-step mt-1">
                    <span className="bold block font-small">Proposal Account:</span>
                    <code className="pda-code">["proposal", dao_pubkey, proposal_index]</code>
                  </div>
                  <div className="pda-step mt-1">
                    <span className="bold block font-small">Vote Record Account:</span>
                    <code className="pda-code">["vote", proposal_pubkey, voter_pubkey]</code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: TREASURY */}
          {activeTab === "treasury" && (
            <div className="treasury-tab-layout card-full">
              <h2>Ecosystem Treasury Reserves</h2>
              <p className="subtitle">Secure on-chain reserve vault requiring active multi-signature confirmation for any allocation exceeding $50k.</p>

              <div className="treasury-grid mt-2">
                <div className="treasury-status-panel">
                  <h3>Current Balance</h3>
                  <div className="balance-box mt-1">
                    <span className="lbl">TOTAL USD VALUE</span>
                    <span className="val text-emerald">$412,850.00</span>
                  </div>
                  <div className="balance-assets mt-1">
                    <div className="asset-row flex-between">
                      <span>400,000 $DNA</span>
                      <span>$200,000.00</span>
                    </div>
                    <div className="asset-row flex-between">
                      <span>1,200 SOL</span>
                      <span>$192,000.00</span>
                    </div>
                    <div className="asset-row flex-between">
                      <span>20,850 USDC</span>
                      <span>$20,850.00</span>
                    </div>
                  </div>
                </div>

                <div className="treasury-logs-panel">
                  <h3>Recent Reserve Transactions</h3>
                  <div className="treasury-logs mt-1">
                    <div className="log-item flex-between">
                      <div>
                        <div className="bold font-small">Grant: Community Rewards</div>
                        <div className="desc font-small">Passed Proposal #P-044 · Executed</div>
                      </div>
                      <span className="text-orange bold">-50,000 DNA</span>
                    </div>
                    <div className="log-item flex-between mt-1">
                      <div>
                        <div className="bold font-small">Gas Seed Refill</div>
                        <div className="desc font-small">Automated Smart Contract Execution · Executed</div>
                      </div>
                      <span className="text-orange bold">-10 SOL</span>
                    </div>
                    <div className="log-item flex-between mt-1">
                      <div>
                        <div className="bold font-small">Protocol Fee Influx</div>
                        <div className="desc font-small">Fee collector sweep · Executed</div>
                      </div>
                      <span className="text-emerald bold">+4,210 DNA</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Global Footer Banner */}
        <footer className="global-status-footer">
          <div className="flex-center font-small">
            <span className="status-indicator active" />
            <span>{status}</span>
          </div>
          <div className="footer-system-meta font-small">
            <span>Powered by DNADAO Governance System M-01 to M-07</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
