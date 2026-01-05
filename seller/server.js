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
const SELLER_WALLET = process.env.SELLER_WALLET;
const PROVIDER_URL = "https://evm-t3.cronos.org";
const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
const DEV_USDC_ADDRESS = "0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0";
const PRICE_UNITS = "10000";

// AI Setup
let groqClient = null;
if (process.env.GROQ_API_KEY) {
  groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  console.log("✅ Multi-AI Consensus Engine initialized");
}

// 🚀 INNOVATION: DIVERSE AI COUNCIL (Optimized for Groq Free Tier)
// AI Council - 3 Verified Working Models (The "Llama Trinity")
// AI Council - Optimized for Rate Limits (Big, Small, Medium)
const AI_COUNCIL = [
  // 1. The Strategist (Heavy 70B)
  { 
    name: "Llama 3.3 70B", 
    model: "llama-3.3-70b-versatile", 
    specialty: "Market Strategy" 
  },
  // 2. The Analyst (Fast 8B)
  { 
    name: "Llama 3.1 8B", 
    model: "llama-3.1-8b-instant", 
    specialty: "Technical Analysis" 
  },
  // 3. The Visionary (New 11B - Different Rate Limit Bucket)
 { 
    name: "Gemma 2 9B", 
    model: "gemma2-9b-it", 
    specialty: "Sentiment Analysis" 
  }
];

const logs = [];
function logEvent(type, agent, message) {
  const time = new Date().toLocaleTimeString();
  logs.unshift({ time, type, agent, message });
  if (logs.length > 50) logs.pop();
  console.log(`[${time}] ${type}: ${message}`);
}

async function verifyTokenPayment(txHash) {
  console.log(`🔎 LOOKING FOR RECEIPT: ${txHash}`);
  for (let i = 0; i < 5; i++) {
    try {
      const receipt = await provider.getTransactionReceipt(txHash);
      if (!receipt) {
        console.log(`   ...attempt ${i+1}/5`);
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }
      console.log(`   ✅ RECEIPT FOUND`);
      const transferTopic = ethers.id("Transfer(address,address,uint256)");
      const sellerTopic = ethers.zeroPadValue(SELLER_WALLET, 32);
      const paymentLog = receipt.logs.find(log => {
        return log.address.toLowerCase() === DEV_USDC_ADDRESS.toLowerCase() &&
               log.topics[0] === transferTopic &&
               log.topics[2].toLowerCase() === sellerTopic.toLowerCase();
      });
      if (paymentLog) {
        const amount = BigInt(paymentLog.data).toString();
        if (BigInt(amount) >= BigInt(PRICE_UNITS)) {
          console.log(`   💰 CONFIRMED: ${ethers.formatUnits(amount, 6)} USDC`);
          return true;
        }
      }
      return false;
    } catch (e) {
      console.error("   ❌ RPC Error:", e.message);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  return false;
}

const x402Protocol = async (req, res, next) => {
  const txHash = req.headers['x-payment-hash'] || req.headers['payment-hash'];
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
  logEvent("VERIFY", "System", `Checking ${txHash.slice(0, 10)}...`);
  const isValid = await verifyTokenPayment(txHash);
  if (isValid) {
    logEvent("PAID", "Agent", "✅ Verified");
    next();
  } else {
    logEvent("ERROR", "Fraud", "Failed");
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

// 🚀 INNOVATION: Multi-AI Consensus System
async function getMultiAIConsensus(token, marketData) {
  console.log(`\n🤖 CONVENING AI COUNCIL (${AI_COUNCIL.length} models)...`);
  console.log(`${"─".repeat(60)}`);
  
  const analyses = [];
  
  // Query each AI model
  for (const ai of AI_COUNCIL) {
    try {
      console.log(`   ⚙️  Consulting ${ai.name} (${ai.specialty})...`);
      
      const prompt = `You are a professional crypto trader analyzing ${token}.

Market Data:
- Current Price: $${marketData.price}
- 24h Change: ${marketData.change}%
- Volume: $${marketData.volume?.toLocaleString() || 'N/A'}
- Source: ${marketData.source}

Task: Provide a trading signal. Respond in this EXACT format:
SIGNAL: [BUY/SELL/HOLD]
CONFIDENCE: [0-100]%
REASON: [One sentence explaining why]

Be concise and direct.`;
      
      const completion = await groqClient.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: ai.model,
        temperature: 0.7,
        max_tokens: 150
      });
      
      const response = completion.choices[0].message.content;
      
      // Parse response
      const signalMatch = response.match(/SIGNAL:\s*(BUY|SELL|HOLD)/i);
      const confidenceMatch = response.match(/CONFIDENCE:\s*(\d+)/);
      const reasonMatch = response.match(/REASON:\s*(.+)/i);
      
      const signal = signalMatch ? signalMatch[1].toUpperCase() : "HOLD";
      const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 50;
      const reason = reasonMatch ? reasonMatch[1].trim() : "Analysis complete";
      
      analyses.push({
        model: ai.name,
        specialty: ai.specialty,
        signal,
        confidence,
        reason
      });
      
      console.log(`      ✓ ${ai.name}: ${signal} (${confidence}% confidence)`);
      
    } catch (e) {
      console.log(`      ✗ ${ai.name}: ERROR - ${e.message.slice(0, 50)}`);
      // Add fallback analysis
      analyses.push({
        model: ai.name,
        specialty: ai.specialty,
        signal: "HOLD",
        confidence: 0,
        reason: "Model unavailable",
        error: true
      });
    }
  }
  
  console.log(`${"─".repeat(60)}`);
  
  // Calculate consensus
  const votes = { BUY: 0, SELL: 0, HOLD: 0 };
  const weightedScores = { BUY: 0, SELL: 0, HOLD: 0 };
  
  analyses.forEach(a => {
    if (!a.error) {
      votes[a.signal]++;
      weightedScores[a.signal] += a.confidence;
    }
  });
  
  // Determine consensus (weighted by confidence)
  const consensus = Object.keys(weightedScores).reduce((a, b) => 
    weightedScores[a] > weightedScores[b] ? a : b
  );
  
  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);
  const agreementRate = totalVotes > 0 ? (votes[consensus] / totalVotes * 100).toFixed(0) : 0;
  
  // Calculate overall confidence
  const validAnalyses = analyses.filter(a => !a.error);
  const avgConfidence = validAnalyses.length > 0 
    ? validAnalyses.reduce((sum, a) => sum + a.confidence, 0) / validAnalyses.length
    : 0;
  
  console.log(`\n📊 CONSENSUS REACHED:`);
  console.log(`   Signal: ${consensus}`);
  console.log(`   Agreement: ${agreementRate}% (${votes[consensus]}/${totalVotes} models)`);
  console.log(`   Avg Confidence: ${avgConfidence.toFixed(0)}%`);
  console.log(`   Votes: BUY=${votes.BUY}, SELL=${votes.SELL}, HOLD=${votes.HOLD}\n`);
  
  // Generate summary
  const reasons = validAnalyses.map(a => a.reason).join(" ");
  const trend = marketData.change >= 0 ? "up" : "down";
  const emoji = consensus === "BUY" ? "🚀" : consensus === "SELL" ? "📉" : "⏸️";
  
  const summary = `${emoji} CONSENSUS: ${consensus} - Our AI council analyzed ${marketData.source} data showing ${token} at $${marketData.price} (${trend} ${Math.abs(marketData.change).toFixed(2)}%). ${validAnalyses.length} models agreed on this signal with reasons including: ${reasons.slice(0, 200)}...`;
  
  return {
    consensus: {
      signal: consensus,
      agreement: `${agreementRate}%`,
      confidence: `${avgConfidence.toFixed(0)}%`,
      votes
    },
    individual_analyses: analyses,
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
      console.log(`\n2️⃣  INITIATING MULTI-AI CONSENSUS ANALYSIS...`);
      aiAnalysis = await getMultiAIConsensus(token, marketData);
      logEvent("AI", "Consensus", `${aiAnalysis.consensus.signal} (${aiAnalysis.consensus.agreement} agreement)`);
    } catch (e) {
      console.error(`   ❌ Consensus Error: ${e.message}`);
      const trend = marketData.change >= 0 ? "up" : "down";
      aiAnalysis = {
        consensus: { signal: "HOLD", agreement: "N/A", confidence: "0%", votes: {} },
        individual_analyses: [],
        summary: `${marketData.source}: ${token} at $${marketData.price}, ${trend} ${Math.abs(marketData.change || 0).toFixed(2)}%`
      };
    }
  } else {
    aiAnalysis = {
      consensus: { signal: "HOLD", agreement: "N/A", confidence: "0%", votes: {} },
      individual_analyses: [],
      summary: `${marketData.source}: ${token} at $${marketData.price}. Configure GROQ_API_KEY for AI consensus.`
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
      change: marketData.change,
      high: marketData.high,
      low: marketData.low
    },
    ai_consensus: {
      signal: aiAnalysis.consensus.signal,
      agreement: aiAnalysis.consensus.agreement,
      confidence: aiAnalysis.consensus.confidence,
      votes: aiAnalysis.consensus.votes,
      summary: aiAnalysis.summary
    },
    individual_analyses: aiAnalysis.individual_analyses,
    served_by: "AgentLink Pro - Multi-AI Consensus Engine",
    timestamp: new Date().toISOString()
  });
});

app.get('/logs', (req, res) => res.json(logs));

app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    ai_models: AI_COUNCIL.length,
    consensus_enabled: !!groqClient,
    data_sources: ['Crypto.com Exchange', 'CoinGecko'],
    uptime: process.uptime()
  });
});

app.listen(PORT, () => {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`🟢 AGENTLINK PRO - MULTI-AI CONSENSUS ENGINE`);
  console.log(`${"=".repeat(70)}`);
  console.log(`   🌐 Port: ${PORT}`);
  console.log(`   💰 Price: 0.01 USDC per consensus analysis`);
  console.log(`   📬 Seller: ${SELLER_WALLET.slice(0,6)}...${SELLER_WALLET.slice(-4)}`);
  console.log(``);
  console.log(`   🤖 AI COUNCIL (${AI_COUNCIL.length} Models):`);
  AI_COUNCIL.forEach(ai => {
    console.log(`      • ${ai.name} - ${ai.specialty}`);
  });
  console.log(``);
  console.log(`   📡 Data Sources:`);
  console.log(`      • Crypto.com Exchange API (Primary)`);
  console.log(`      • CoinGecko API (Fallback)`);
  console.log(``);
  console.log(`   ⚡ Innovation:`);
  console.log(`      ✓ Multi-AI Consensus Voting`);
  console.log(`      ✓ Confidence-Weighted Analysis`);
  console.log(`      ✓ Individual Model Transparency`);
  console.log(`      ✓ HTTP 402 Payment Protocol`);
  console.log(`${"=".repeat(70)}\n`);
});