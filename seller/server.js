require('dotenv').config();
const express = require('express');
const cors = require('cors');
const ethers = require('ethers');
const axios = require('axios');
const Groq = require('groq-sdk');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const SELLER_WALLET = process.env.SELLER_WALLET.toLowerCase(); // Lowercase for comparison
const PROVIDER_URL = "https://evm-t3.cronos.org";
const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
const DEV_USDC_ADDRESS = "0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0";
const PRICE_UNITS = "10000";

// AI Setup
let groqClient = null;
if (process.env.GROQ_API_KEY) {
  groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  console.log("✅ Multi-Round AI Consensus Engine initialized");
}

// AI Council
const AI_COUNCIL = [
  { name: "Llama 3.3 70B Strategist", model: "llama-3.3-70b-versatile", specialty: "Deep Analysis", perspective: "long-term" },
  { name: "Llama 3.1 8B Tactician", model: "llama-3.1-8b-instant", specialty: "Rapid Technical Assessment", perspective: "short-term" }
];

const logs = [];
function logEvent(type, agent, message) {
  const time = new Date().toLocaleTimeString();
  logs.unshift({ time, type, agent, message });
  if (logs.length > 50) logs.pop();
  console.log(`[${time}] ${type}: ${message}`);
}

// UPDATED: Verify Direct ERC-20 Transfer with better debugging
async function verifyDirectTransfer(txHash, userAddress) {
  console.log(`🔎 LOOKING FOR RECEIPT: ${txHash}`);
  console.log(`   User Address: ${userAddress}`);
  console.log(`   Seller Address: ${SELLER_WALLET}`);
  
  for (let i = 0; i < 5; i++) {
    try {
      const receipt = await provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        console.log(`   ...attempt ${i+1}/5`);
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }

      console.log(`   ✅ RECEIPT FOUND with ${receipt.logs.length} logs`);
      
      // Verify transaction was successful
      if (receipt.status !== 1) {
        console.log(`   ❌ Transaction failed (status: ${receipt.status})`);
        return false;
      }

      // ERC-20 Transfer event signature
      const transferTopic = ethers.id("Transfer(address,address,uint256)");
      
      console.log(`   🔍 Searching for Transfer events...`);
      
      // Log all events for debugging
      receipt.logs.forEach((log, index) => {
        console.log(`   Log ${index}:`);
        console.log(`      Address: ${log.address}`);
        console.log(`      Topic[0]: ${log.topics[0]}`);
        if (log.topics.length > 1) console.log(`      Topic[1] (from): ${log.topics[1]}`);
        if (log.topics.length > 2) console.log(`      Topic[2] (to): ${log.topics[2]}`);
      });

      // Find the Transfer event from the USDC contract
      const transferLog = receipt.logs.find(log => {
        const isUSDC = log.address.toLowerCase() === DEV_USDC_ADDRESS.toLowerCase();
        const isTransfer = log.topics[0] === transferTopic;
        const hasTopics = log.topics.length === 3;
        
        if (isUSDC && isTransfer && hasTopics) {
          // Extract addresses from topics (they are padded to 32 bytes)
          const fromAddress = '0x' + log.topics[1].slice(26); // Remove padding
          const toAddress = '0x' + log.topics[2].slice(26);   // Remove padding
          
          console.log(`   📋 Found Transfer event:`);
          console.log(`      From: ${fromAddress}`);
          console.log(`      To: ${toAddress}`);
          console.log(`      Expected From: ${userAddress.toLowerCase()}`);
          console.log(`      Expected To: ${SELLER_WALLET.toLowerCase()}`);
          
          const fromMatches = fromAddress.toLowerCase() === userAddress.toLowerCase();
          const toMatches = toAddress.toLowerCase() === SELLER_WALLET.toLowerCase();
          
          console.log(`      From matches: ${fromMatches}`);
          console.log(`      To matches: ${toMatches}`);
          
          return fromMatches && toMatches;
        }
        
        return false;
      });

      if (transferLog) {
        const amount = BigInt(transferLog.data).toString();
        const amountFormatted = ethers.formatUnits(amount, 6);
        console.log(`   💰 Amount: ${amountFormatted} USDC (${amount} units)`);
        console.log(`   📊 Required: ${ethers.formatUnits(PRICE_UNITS, 6)} USDC (${PRICE_UNITS} units)`);
        
        if (BigInt(amount) >= BigInt(PRICE_UNITS)) {
          console.log(`   ✅ CONFIRMED: Payment verified`);
          return true;
        } else {
          console.log(`   ❌ Amount too low: ${amount} < ${PRICE_UNITS}`);
          return false;
        }
      }
      
      console.log(`   ❌ No matching Transfer event found`);
      console.log(`   💡 This might mean:`);
      console.log(`      - Wrong token was transferred`);
      console.log(`      - Transfer wasn't to the seller address`);
      console.log(`      - Transaction was to a different contract`);
      return false;

    } catch (e) {
      console.error("   ❌ RPC Error:", e.message);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  
  console.log(`   ❌ TIMEOUT: Could not verify payment after 5 attempts`);
  return false;
}
// UPDATED: x402 Middleware for Direct Transfers
const x402Protocol = async (req, res, next) => {
  const txHash = req.headers['x-payment-hash'] || req.headers['payment-hash'];
  const userAddress = req.headers['x-user-address'] || req.headers['user-address'];

  if (!txHash) {
    logEvent("BLOCK", "Anonymous", "Sending 402 Invoice");
    return res.status(402).json({
      error: "Payment Required",
      schemes: [{
        network: "cronos-testnet",
        currency: "USDC",
        amount: PRICE_UNITS,
        to: SELLER_WALLET,
        token: DEV_USDC_ADDRESS
      }],
      pay_to: SELLER_WALLET,
      currency: "USDC",
      amount: PRICE_UNITS,
      token: DEV_USDC_ADDRESS
    });
  }

  if (!userAddress) {
    logEvent("ERROR", "System", "Missing user address");
    return res.status(400).json({ error: "User address required" });
  }

  logEvent("VERIFY", "System", `Checking ${txHash.slice(0, 10)}... from ${userAddress.slice(0, 10)}...`);
  const isValid = await verifyDirectTransfer(txHash, userAddress);

  if (isValid) {
    logEvent("PAID", "Agent", "✅ Verified");
    next();
  } else {
    logEvent("ERROR", "Fraud", "Payment verification failed");
    res.status(403).json({ error: "Invalid Payment" });
  }
};

async function fetchCryptoComPrice(token) {
  try {
    logEvent("DATA", "Crypto.com", `Fetching ${token}...`);
    const pair = `${token}_USDT`;
    const response = await axios.get(
      `https://api.crypto.com/v2/public/get-ticker`,
      {
        params: { instrument_name: pair },
        headers: { 'User-Agent': 'AgentLink/1.0' },
        timeout: 5000
      }
    );
    if (response.data?.result?.data?.[0]) {
      const data = response.data.result.data[0];
      logEvent("DATA", "Success", `${token} = $${data.a}`);
      return {
        source: "Crypto.com Exchange API",
        price: parseFloat(data.a),
        high: parseFloat(data.h),
        low: parseFloat(data.l),
        volume: parseFloat(data.v),
        change: parseFloat(data.c || 0)
      };
    }
  } catch (e) {
    console.log(`   ⚠️ Crypto.com error: ${e.message}`);
  }
  return null;
}

async function fetchCoinGeckoPrice(token) {
  try {
    const coinIds = {
      BTC: "bitcoin", ETH: "ethereum", CRO: "crypto-com-chain",
      PEPE: "pepe", SOL: "solana", BNB: "binancecoin",
      ADA: "cardano", DOT: "polkadot", MATIC: "matic-network"
    };
    const coinId = coinIds[token] || token.toLowerCase();
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price`,
      {
        params: {
          ids: coinId,
          vs_currencies: 'usd',
          include_24hr_vol: true,
          include_24hr_change: true
        },
        timeout: 5000
      }
    );
    if (response.data[coinId]) {
      const d = response.data[coinId];
      return {
        source: "CoinGecko API",
        price: d.usd,
        volume: d.usd_24h_vol || 0,
        change: d.usd_24h_change || 0
      };
    }
  } catch (e) {
    console.log(`   ⚠️ CoinGecko error: ${e.message}`);
  }
  return null;
}

// Multi-Round Consensus
async function getMultiRoundConsensus(token, marketData) {
  console.log(`\n🤖 CONVENING AI COUNCIL (${AI_COUNCIL.length} models)...`);
  console.log(`${"─".repeat(60)}`);
  
  const allAnalyses = [];
  
  // Round 1: Independent Analysis
  console.log(`\n📍 ROUND 1: Independent Analysis`);
  console.log(`${"─".repeat(60)}`);
  
  for (const ai of AI_COUNCIL) {
    try {
      console.log(`   ⚙️  ${ai.name} analyzing...`);
      
      const prompt = `You are a ${ai.perspective} crypto trader (${ai.specialty}).

Market Data for ${token}:
- Price: $${marketData.price}
- 24h Change: ${marketData.change}%
- Volume: $${marketData.volume?.toLocaleString() || 'N/A'}

Provide analysis in EXACT format:
SIGNAL: [BUY/SELL/HOLD]
CONFIDENCE: [0-100]%
REASON: [One detailed sentence]`;
      
      const completion = await groqClient.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: ai.model,
        temperature: 0.7,
        max_tokens: 150
      });
      
      const response = completion.choices[0].message.content;
      const signalMatch = response.match(/SIGNAL:\s*(BUY|SELL|HOLD)/i);
      const confidenceMatch = response.match(/CONFIDENCE:\s*(\d+)/);
      const reasonMatch = response.match(/REASON:\s*(.+)/i);
      
      const analysis = {
        round: 1,
        model: ai.name,
        perspective: ai.perspective,
        signal: signalMatch ? signalMatch[1].toUpperCase() : "HOLD",
        confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 50,
        reason: reasonMatch ? reasonMatch[1].trim() : "Analysis complete"
      };
      
      allAnalyses.push(analysis);
      console.log(`      ✓ ${analysis.signal} (${analysis.confidence}%): ${analysis.reason.slice(0, 60)}...`);
      
    } catch (e) {
      console.log(`      ✗ ERROR: ${e.message.slice(0, 50)}`);
    }
  }
  
  // Round 2: Cross-Examination
  console.log(`\n📍 ROUND 2: Cross-Examination & Refinement`);
  console.log(`${"─".repeat(60)}`);
  
  const round1Results = allAnalyses.map(a => `${a.model}: ${a.signal} (${a.confidence}%) - ${a.reason}`).join("\n");
  
  for (const ai of AI_COUNCIL) {
    try {
      console.log(`   ⚙️  ${ai.name} reviewing peer analysis...`);
      
      const prompt = `You are a ${ai.perspective} crypto trader.

Your colleague's analysis:
${round1Results}

Current ${token} price: $${marketData.price}, change: ${marketData.change}%

Review the analysis above. Do you:
- AGREE with the signals?
- Want to CHANGE your position?
- Adjust your CONFIDENCE?

Respond in EXACT format:
SIGNAL: [BUY/SELL/HOLD]
CONFIDENCE: [0-100]%
REASON: [Why you agree/disagree with peer analysis]`;
      
      const completion = await groqClient.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: ai.model,
        temperature: 0.8,
        max_tokens: 150
      });
      
      const response = completion.choices[0].message.content;
      const signalMatch = response.match(/SIGNAL:\s*(BUY|SELL|HOLD)/i);
      const confidenceMatch = response.match(/CONFIDENCE:\s*(\d+)/);
      const reasonMatch = response.match(/REASON:\s*(.+)/i);
      
      const analysis = {
        round: 2,
        model: ai.name,
        perspective: ai.perspective,
        signal: signalMatch ? signalMatch[1].toUpperCase() : "HOLD",
        confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 50,
        reason: reasonMatch ? reasonMatch[1].trim() : "Analysis refined"
      };
      
      allAnalyses.push(analysis);
      console.log(`      ✓ ${analysis.signal} (${analysis.confidence}%): ${analysis.reason.slice(0, 60)}...`);
      
    } catch (e) {
      console.log(`      ✗ ERROR: ${e.message.slice(0, 50)}`);
    }
  }
  
  console.log(`${"─".repeat(60)}`);
  
  // Calculate consensus
  const votes = { BUY: 0, SELL: 0, HOLD: 0 };
  const weightedScores = { BUY: 0, SELL: 0, HOLD: 0 };
  
  const round2Analyses = allAnalyses.filter(a => a.round === 2);
  
  round2Analyses.forEach(a => {
    votes[a.signal]++;
    weightedScores[a.signal] += a.confidence;
  });
  
  const consensus = Object.keys(weightedScores).reduce((a, b) => 
    weightedScores[a] > weightedScores[b] ? a : b
  );
  
  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);
  const agreementRate = totalVotes > 0 ? (votes[consensus] / totalVotes * 100).toFixed(0) : 0;
  
  const validAnalyses = round2Analyses;
  const avgConfidence = validAnalyses.length > 0 
    ? validAnalyses.reduce((sum, a) => sum + a.confidence, 0) / validAnalyses.length
    : 0;
  
  console.log(`\n📊 CONSENSUS REACHED:`);
  console.log(`   Signal: ${consensus}`);
  console.log(`   Agreement: ${agreementRate}% (${votes[consensus]}/${totalVotes} models)`);
  console.log(`   Avg Confidence: ${avgConfidence.toFixed(0)}%`);
  console.log(`   Votes: BUY=${votes.BUY}, SELL=${votes.SELL}, HOLD=${votes.HOLD}\n`);
  
  const reasons = validAnalyses.map(a => a.reason).join(" ");
  const trend = marketData.change >= 0 ? "up" : "down";
  const emoji = consensus === "BUY" ? "🚀" : consensus === "SELL" ? "📉" : "⏸️";
  
  const round1Signals = allAnalyses.filter(a => a.round === 1).map(a => a.signal);
  const round2Signals = allAnalyses.filter(a => a.round === 2).map(a => a.signal);
  const signalsChanged = round1Signals.some((s, i) => s !== round2Signals[i]);
  
  const summary = `${emoji} ${consensus} - After 2 rounds of deliberation, our AI council reached ${agreementRate}% consensus on ${token} at $${marketData.price} (${trend} ${Math.abs(marketData.change).toFixed(2)}%). Final confidence: ${avgConfidence.toFixed(0)}%. ${signalsChanged ? 'Positions were refined through peer review.' : 'Analysis remained consistent.'}`;
  
  return {
    consensus: {
      signal: consensus,
      agreement: `${agreementRate}%`,
      confidence: `${avgConfidence.toFixed(0)}%`,
      votes,
      rounds: 2,
      evolution: signalsChanged ? "adjusted" : "consistent"
    },
    analyses_by_round: {
      round_1: allAnalyses.filter(a => a.round === 1),
      round_2: allAnalyses.filter(a => a.round === 2)
    },
    summary
  };
}

app.get("/api/analyze/:token", x402Protocol, async (req, res) => {
  const token = (req.params.token || "CRO").toUpperCase();
  let marketData = null;
  let aiAnalysis = null;

  console.log(`\n1️⃣  FETCHING MARKET DATA FOR ${token}...`);
  marketData = await fetchCryptoComPrice(token);
  if (!marketData) marketData = await fetchCoinGeckoPrice(token);
  if (!marketData) {
    marketData = {
      source: "Simulation",
      price: (Math.random() * 50000 + 10000).toFixed(2),
      volume: Math.floor(Math.random() * 10000000),
      change: (Math.random() * 20 - 10).toFixed(2)
    };
  }
  console.log(`   ✅ Data acquired: $${marketData.price} (${marketData.source})`);

  if (groqClient) {
    try {
      console.log(`\n2️⃣  INITIATING MULTI-ROUND CONSENSUS...`);
      aiAnalysis = await getMultiRoundConsensus(token, marketData);
      logEvent("AI", "Consensus", `${aiAnalysis.consensus.signal} (${aiAnalysis.consensus.agreement} agreement, ${aiAnalysis.consensus.rounds} rounds)`);
    } catch (e) {
      console.error(`   ❌ Consensus Error: ${e.message}`);
      const trend = marketData.change >= 0 ? "up" : "down";
      aiAnalysis = {
        consensus: { signal: "HOLD", agreement: "N/A", confidence: "0%", votes: {}, rounds: 0 },
        analyses_by_round: { round_1: [], round_2: [] },
        summary: `${marketData.source}: ${token} at $${marketData.price}, ${trend} ${Math.abs(marketData.change || 0).toFixed(2)}%`
      };
    }
  } else {
    aiAnalysis = {
      consensus: { signal: "HOLD", agreement: "N/A", confidence: "0%", votes: {}, rounds: 0 },
      analyses_by_round: { round_1: [], round_2: [] },
      summary: `${marketData.source}: ${token} at $${marketData.price}. Configure GROQ_API_KEY.`
    };
  }

  console.log(`\n3️⃣  SERVING RESPONSE TO CLIENT\n`);
  
  res.json({
    success: true,
    token: token,
    source: marketData.source,
    market_stats: {
      price: marketData.price,
      volume: marketData.volume,
      change: marketData.change
    },
    ai_consensus: {
      signal: aiAnalysis.consensus.signal,
      agreement: aiAnalysis.consensus.agreement,
      confidence: aiAnalysis.consensus.confidence,
      votes: aiAnalysis.consensus.votes,
      rounds: aiAnalysis.consensus.rounds,
      evolution: aiAnalysis.consensus.evolution,
      summary: aiAnalysis.summary
    },
    analyses_by_round: aiAnalysis.analyses_by_round,
    served_by: "AgentLink Pro - Multi-Round Deliberative Consensus",
    timestamp: new Date().toISOString()
  });
});

app.get('/logs', (req, res) => res.json(logs));

app.listen(PORT, () => {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`🟢 AGENTLINK PRO - MULTI-ROUND CONSENSUS ENGINE`);
  console.log(`${"=".repeat(70)}`);
  console.log(`   🌐 Port: ${PORT}`);
  console.log(`   💰 Price: 0.01 USDC per multi-round analysis`);
  console.log(`   📬 Seller: ${SELLER_WALLET.slice(0,6)}...${SELLER_WALLET.slice(-4)}`);
  console.log(``);
  console.log(`   🤖 AI COUNCIL (${AI_COUNCIL.length} Specialized Agents):`);
  AI_COUNCIL.forEach(ai => {
    console.log(`      • ${ai.name} - ${ai.specialty} (${ai.perspective})`);
  });
  console.log(``);
  console.log(`   ⚡ Innovation:`);
  console.log(`      ✓ Multi-Round Deliberative Consensus (2 rounds)`);
  console.log(`      ✓ Peer Review & Cross-Examination`);
  console.log(`      ✓ Confidence Evolution Tracking`);
  console.log(`      ✓ Direct ERC-20 Transfer Support`);
  console.log(`      ✓ HTTP 402 Payment Protocol`);
  console.log(`${"=".repeat(70)}\n`);
});