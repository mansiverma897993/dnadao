require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const dns = require('dns');

// Fix Node.js DNS resolution issues on Windows/VPN/VirtualBox setups by falling back
// to public DNS servers if Node defaults to the 127.0.0.1 loopback and fails to resolve.
try {
  const dnsServers = dns.getServers();
  if (!dnsServers || dnsServers.length === 0 || (dnsServers.length === 1 && dnsServers[0] === '127.0.0.1')) {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  }
} catch (dnsErr) {
  console.warn('Unable to set fallback DNS servers:', dnsErr.message);
}
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const seedDatabase = require('./seed');
const Proposal = require('./models/Proposal');
const Member = require('./models/Member');
const Message = require('./models/Message');
const User = require('./models/User');
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Successfully connected to MongoDB.');
    // Seed database with default data
    await seedDatabase();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// API Routes

// Get all proposals
app.get('/api/proposals', async (req, res) => {
  try {
    const proposals = await Proposal.find().sort({ proposalIndex: -1 });
    res.json(proposals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new proposal
app.post('/api/proposals', async (req, res) => {
  const { title, description, category, creator } = req.body;
  try {
    // Generate sequential index based on current count
    const count = await Proposal.countDocuments();
    const index = count + 43; // Matching template indices starting from P-043
    
    const newProposal = new Proposal({
      id: `P-0${index}`,
      category: category || 'Treasury Allocation',
      title,
      description,
      creator: creator || 'Adit Kumar',
      votesYes: 1,
      votesNo: 0,
      status: 'Active',
      closesIn: '6d 23h 59m',
      reputationEffect: '+20 VP',
      proposalIndex: index
    });
    
    await newProposal.save();
    res.status(201).json(newProposal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vote on proposal
app.post('/api/proposals/:id/vote', async (req, res) => {
  const { id } = req.params;
  const { approve, votingPower } = req.body;
  try {
    const prop = await Proposal.findOne({ id });
    if (!prop) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    
    const vp = Number(votingPower) || 1247;
    if (approve) {
      prop.votesYes += vp;
    } else {
      prop.votesNo += vp;
    }
    
    await prop.save();
    res.json(prop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all community member DNA profiles
app.get('/api/members', async (req, res) => {
  try {
    const members = await Member.find();
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upsert a member DNA profile (e.g. updating sliders/score)
app.post('/api/members', async (req, res) => {
  const memberData = req.body;
  try {
    const member = await Member.findOneAndUpdate(
      { name: memberData.name },
      memberData,
      { new: true, upsert: true }
    );
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get chat history for a proposal
app.get('/api/proposals/:proposalId/messages', async (req, res) => {
  const { proposalId } = req.params;
  try {
    const messages = await Message.find({ proposalId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post a new chat message for a proposal
app.post('/api/proposals/:proposalId/messages', async (req, res) => {
  const { proposalId } = req.params;
  const { sender, content } = req.body;
  try {
    const newMessage = new Message({
      proposalId,
      sender: sender || 'Anonymous',
      content
    });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User Registration
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }
  try {
    const existing = await User.findOne({ username: username.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'Username is already taken.' });
    }
    
    const hashedPassword = hashPassword(password);
    const newUser = new User({
      username: username.toLowerCase(),
      password: hashedPassword
    });
    
    await newUser.save();
    res.status(201).json({ username: newUser.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }
  try {
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }
    
    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }
    
    res.json({ username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
