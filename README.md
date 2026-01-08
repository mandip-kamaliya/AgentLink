# AgentLink - Multi-Round AI Consensus Engine

<div align="center">

![AgentLink](https://img.shields.io/badge/AgentLink-AI%20Consensus-00ffff?style=for-the-badge)
![Cronos](https://img.shields.io/badge/Cronos-Testnet-blue?style=for-the-badge)
![HTTP 402](https://img.shields.io/badge/HTTP%20402-Protocol-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**Revolutionary Multi-Round AI Consensus Engine with Autonomous Machine-to-Machine Payments**

Built for **Cronos x402 Paytech Hackathon - Track 3**

[Live Demo](#-demo) • [Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture)

</div>

---

## 🎯 Overview

**AgentLink** is a decentralized AI consensus service that enables autonomous agents and users to purchase crypto market analysis through blockchain-verified payments on Cronos.

### The Problem

- 🔴 Single AI models produce unreliable and biased predictions
- 🔴 Centralized services require subscriptions, accounts, and trust
- 🔴 No true autonomous machine-to-machine economy exists

### The Solution

- ✅ **Multi-Round AI Deliberation**: 2 specialized AI models debate and reach consensus
- ✅ **Dual Access Modes**: CLI agents (x402 protocol) + Web interface (MetaMask)
- ✅ **Trustless Payments**: On-chain verification, no intermediaries
- ✅ **Full Transparency**: See every model's reasoning and confidence evolution

---

## ✨ Features

### 🤖 Multi-Round AI Consensus

**Round 1: Independent Analysis**
- 🧠 **Llama 3.3 70B Strategist** - Long-term strategic perspective
- ⚡ **Llama 3.1 8B Tactician** - Short-term tactical assessment
- Each model analyzes independently to avoid groupthink

**Round 2: Peer Review & Cross-Examination**
- Models critique each other's analysis
- Confidence scores adjust based on debate
- Positions may shift after examining peer reasoning

**Final Consensus**
- Weighted voting by confidence scores
- Agreement percentage calculation
- Evolution tracking (positions changed or consistent)

### 💳 Dual Payment Modes

#### **Mode 1: CLI Agent (True x402 Protocol)**
```bash
node agent.js BTC
```

- ✅ Uses Crypto.com Facilitator SDK
- ✅ EIP-3009 authorization messages
- ✅ Pure machine-to-machine transactions
- ✅ HTTP 402 "Payment Required" standard

#### **Mode 2: Web Dashboard (User-Friendly)**

- ✅ Connect any Web3 wallet (MetaMask)
- ✅ Type token symbol (BTC, ETH, CRO, etc.)
- ✅ Pay 0.01 USDC directly from your wallet
- ✅ Get instant AI consensus with live visualization

### 🔗 Cronos Ecosystem Integration

| Component | Purpose | Status |
|-----------|---------|--------|
| **Crypto.com Exchange API** | Real-time market data | ✅ Integrated |
| **Cronos Testnet** | On-chain payment settlement | ✅ Integrated |
| **Groq AI** | High-performance LLM inference | ✅ Integrated |
| **HTTP 402 Protocol** | Payment negotiation standard | ✅ Implemented |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MetaMask wallet (for web mode)
- Cronos Testnet TCRO & devUSDC

**Get Testnet Funds:**
- Faucet: https://faucet.cronos.org
- You'll need TCRO for gas and devUSDC for payments

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/agentlink.git
cd agentlink

# Install server dependencies
cd seller
npm install

# Install agent dependencies
cd ../buyer
npm install
```

### Environment Setup

Create `.env` file in the `seller` directory:
```env
# Server Configuration
SELLER_WALLET=0xYourSellerWalletAddress
GROQ_API_KEY=gsk_YourGroqAPIKey
```

Create `.env` file in the `buyer` directory:
```env
# Agent Configuration
BUYER_PRIVATE_KEY=0xYourBuyerPrivateKey
```

**Get API Keys:**
- Groq API: https://console.groq.com/keys (Free tier available)
- Cronos Testnet Faucet: https://faucet.cronos.org

### Running Locally

#### 1. Start the Server
```bash
cd seller
node server.js
```

Server runs on `http://localhost:3000`

**Expected Output:**
```
======================================================================
🟢 AGENTLINK PRO - DUAL-MODE CONSENSUS ENGINE
======================================================================
   🌐 Port: 3000
   💰 Price: 0.01 USDC per multi-round analysis
   📬 Seller: 0x706f...abf3
   
   🤖 AI COUNCIL (2 Specialized Agents):
      • Llama 3.3 70B Strategist - Deep Analysis (long-term)
      • Llama 3.1 8B Tactician - Rapid Technical Assessment (short-term)
```

#### 2A. CLI Agent Mode (x402 Protocol)
```bash
cd buyer
node agent.js BTC
```

**What happens:**
1. 🔍 Agent requests Bitcoin analysis
2. 🛑 Receives HTTP 402 "Payment Required"
3. 💳 Uses Facilitator SDK to settle 0.01 USDC on-chain
4. 📜 Presents transaction hash as cryptographic proof
5. 🤖 Receives multi-round AI consensus

#### 2B. Web Dashboard Mode

1. Open `seller/dashboard.html` in your browser
2. Click **"Connect Wallet"**
3. Approve MetaMask connection
4. Type token symbol (e.g., `ETH`)
5. Click **"Analyze Token"**
6. Approve 0.01 USDC transaction in MetaMask
7. Watch AI consensus appear in real-time!

---

## 📊 Demo

### Terminal Output (CLI Agent)
```
🤖 AGENTLINK BUYER AGENT
======================================================================
   Wallet: 0x41c650f5...43eae48
   Target: BTC
   Service: Multi-Round AI Consensus
======================================================================

1️⃣  REQUESTING INTELLIGENCE...
   🛑 402 Payment Required
   💰 Amount: 0.01 USDC
   📬 Pay to: 0x706f6108...53f7abf3

2️⃣  INITIATING PAYMENT SETTLEMENT...
   ⚙️  Submitting to Facilitator...
   ✅ Payment Settled!
   🔗 Tx: 0xc4323812adabafcab080ab802efb171eb5e830d6

3️⃣  REDEEMING SERVICE WITH PROOF...

======================================================================
🎉 MULTI-ROUND CONSENSUS ACQUIRED
======================================================================

📊 MARKET DATA (CoinGecko API):
   Token: BTC
   Price: $92,350
   24h Change: -1.2%
   Volume: $39,037,590,946

🤖 FINAL CONSENSUS:
   Signal: HOLD
   Agreement: 100%
   Confidence: 72%
   Rounds: 2
   Evolution: consistent
   Votes: BUY=0, SELL=0, HOLD=2

💡 ROUND 1 - Independent Analysis:
   • Llama 3.3 70B Strategist (long-term):
     HOLD (70%) - Price consolidating near key support levels with neutral momentum indicators

   • Llama 3.1 8B Tactician (short-term):
     HOLD (75%) - Technical indicators show balanced pressure with no clear directional bias

💡 ROUND 2 - Peer Review & Refinement:
   • Llama 3.3 70B Strategist (long-term):
     HOLD (72%) - After reviewing tactical analysis, maintaining position with slight confidence increase

   • Llama 3.1 8B Tactician (short-term):
     HOLD (73%) - Peer strategic analysis confirms neutral stance in current market conditions

📝 SUMMARY:
   ⏸️ HOLD - After 2 rounds of deliberation, our AI council reached 100% consensus 
   on BTC at $92350.00 (down 1.20%). Final confidence: 72%. 
   Analysis remained consistent across both rounds.
```

### Web Dashboard

**Features:**
- 🎨 Cyberpunk-themed interface
- 📊 Real-time activity log
- 💹 Live market data display
- 🤖 AI model reasoning visualization
- 🎯 Consensus signal with confidence meters
- 👛 Wallet integration with balance display

---

## 🏗️ Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERFACE                          │
│  ┌──────────────────┐          ┌──────────────────┐        │
│  │   CLI Agent      │          │  Web Dashboard   │        │
│  │  (agent.js)      │          │ (dashboard.html) │        │
│  │                  │          │                  │        │
│  │ • Facilitator SDK│          │ • MetaMask       │        │
│  │ • EIP-3009       │          │ • Direct Transfer│        │
│  └─────────┬────────┘          └────────┬─────────┘        │
└────────────┼──────────────────────────┼──────────────────┘
             │                          │
             │    HTTP 402 Protocol     │
             │                          │
             └──────────┬───────────────┘
                        ▼
        ┌───────────────────────────────────────┐
        │         SERVER (server.js)            │
        │                                       │
        │  ┌─────────────────────────────────┐ │
        │  │   x402 Payment Middleware       │ │
        │  │  • Detect payment method        │ │
        │  │  • Verify on-chain transaction  │ │
        │  │  • Support dual modes           │ │
        │  └─────────────────────────────────┘ │
        │                                       │
        │  ┌─────────────────────────────────┐ │
        │  │   Multi-Round AI Engine         │ │
        │  │  • Round 1: Independent Analysis│ │
        │  │  • Round 2: Peer Review         │ │
        │  │  • Weighted Consensus           │ │
        │  └─────────────────────────────────┘ │
        │                                       │
        │  ┌─────────────────────────────────┐ │
        │  │   Data Sources                  │ │
        │  │  • Crypto.com Exchange API      │ │
        │  │  • CoinGecko API (fallback)     │ │
        │  └─────────────────────────────────┘ │
        └───────────────┬───────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────────┐
        │       BLOCKCHAIN LAYER                │
        │                                       │
        │  • Cronos Testnet (Chain ID: 338)    │
        │  • devUSDC ERC-20 Token               │
        │  • Payment Verification               │
        │  • Transaction Receipts               │
        └───────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────────┐
        │         AI INFERENCE                  │
        │                                       │
        │  • Groq Cloud API                     │
        │  • Llama 3.3 70B Versatile            │
        │  • Llama 3.1 8B Instant               │
        └───────────────────────────────────────┘
```

---

## 💡 Innovation Highlights

### 1. Multi-Round Deliberative Consensus

Unlike simple multi-model voting, AgentLink implements **true AI deliberation**:

| Round | Purpose | Innovation |
|-------|---------|------------|
| **Round 1** | Independent Analysis | Models work separately to avoid groupthink and bias |
| **Round 2** | Peer Review | Models critique each other and adjust confidence based on debate |
| **Final** | Weighted Consensus | Voting weighted by confidence, with transparency on evolution |

**Why This Matters:**
- Single AI models hallucinate and have biases
- Simple averaging loses nuance
- Deliberation produces more reliable consensus
- Similar to how expert committees work in finance

### 2. Dual Payment Architecture

**One Service, Two Access Methods:**

| Mode | Use Case | Technology | User Type |
|------|----------|------------|-----------|
| **CLI** | Autonomous agents | Facilitator SDK + EIP-3009 | Machines |
| **Web** | Human users | MetaMask + Direct Transfer | Humans |

Both use the **same backend** and **same AI consensus engine**.

### 3. On-Chain Verification

Every payment is cryptographically verified:
```javascript
// Server verifies ERC-20 Transfer event
Transfer(from: userWallet, to: sellerWallet, amount: 10000)

// Checks:
✓ Transaction succeeded (status === 1)
✓ Correct token (devUSDC)
✓ Correct recipient (seller wallet)
✓ Sufficient amount (>= 0.01 USDC)
```

**No trusted intermediaries. Pure trustless commerce.**

### 4. Complete Transparency

Users see everything:
- ✅ Each model's independent reasoning (Round 1)
- ✅ Each model's peer review analysis (Round 2)
- ✅ Confidence scores for every analysis
- ✅ How positions evolved through debate
- ✅ Final weighted voting breakdown
- ✅ Market data sources

---

## 📁 Project Structure
```
agentlink/
│
├── seller/
│   ├── server.js              # Main server with dual-mode payment
│   ├── dashboard.html         # Web interface (single file)
│   ├── package.json          # Server dependencies
│   └── .env                  # Environment variables (not in git)
│
├── buyer/
│   ├── agent.js              # CLI agent with Facilitator SDK
│   ├── package.json          # Agent dependencies
│   └── .env                  # Buyer private key (not in git)
│
├── README.md                 # This file
├── .gitignore               # Git ignore rules
└── LICENSE                   # MIT License
```

---

## 🔧 API Reference

### Endpoint: `GET /api/analyze/:token`

Analyze a cryptocurrency and get multi-round AI consensus.

#### Parameters

| Parameter | Type | Location | Description |
|-----------|------|----------|-------------|
| `token` | string | URL path | Token symbol (e.g., BTC, ETH, CRO) |
| `x-payment-hash` | string | Header | Transaction hash proving payment |
| `x-user-address` | string | Header | Sender wallet address (web mode only) |

#### Response (402 Payment Required)
```json
{
  "error": "Payment Required",
  "schemes": [{
    "network": "cronos-testnet",
    "currency": "USDC",
    "amount": "10000",
    "to": "0x706f61089d8a9c1aaa3b80e8caa6f38853f7abf3",
    "token": "0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0"
  }],
  "pay_to": "0x706f61089d8a9c1aaa3b80e8caa6f38853f7abf3",
  "currency": "USDC",
  "amount": "10000",
  "token": "0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "token": "BTC",
  "source": "CoinGecko API",
  "market_stats": {
    "price": 92350,
    "volume": 39037590946,
    "change": -1.2
  },
  "ai_consensus": {
    "signal": "HOLD",
    "agreement": "100%",
    "confidence": "72%",
    "votes": { "BUY": 0, "SELL": 0, "HOLD": 2 },
    "rounds": 2,
    "evolution": "consistent",
    "summary": "⏸️ HOLD - After 2 rounds of deliberation..."
  },
  "analyses_by_round": {
    "round_1": [
      {
        "round": 1,
        "model": "Llama 3.3 70B Strategist",
        "perspective": "long-term",
        "signal": "HOLD",
        "confidence": 70,
        "reason": "Price consolidating near key support levels"
      },
      {
        "round": 1,
        "model": "Llama 3.1 8B Tactician",
        "perspective": "short-term",
        "signal": "HOLD",
        "confidence": 75,
        "reason": "Technical indicators show neutral momentum"
      }
    ],
    "round_2": [
      {
        "round": 2,
        "model": "Llama 3.3 70B Strategist",
        "perspective": "long-term",
        "signal": "HOLD",
        "confidence": 72,
        "reason": "After review, maintaining position with adjusted confidence"
      },
      {
        "round": 2,
        "model": "Llama 3.1 8B Tactician",
        "perspective": "short-term",
        "signal": "HOLD",
        "confidence": 73,
        "reason": "Peer analysis confirms neutral stance"
      }
    ]
  },
  "served_by": "AgentLink Pro - Multi-Round Deliberative Consensus",
  "timestamp": "2026-01-08T20:30:45.123Z"
}
```

### Endpoint: `GET /logs`

Get real-time system activity logs.

#### Response
```json
[
  {
    "time": "8:30:45 pm",
    "type": "PAID",
    "agent": "0x41c650f5...43eae48",
    "message": "✅ Verified"
  },
  {
    "time": "8:30:44 pm",
    "type": "VERIFY",
    "agent": "System",
    "message": "Checking 0xc4323812... from 0x41c650f5..."
  }
]
```

---

## 🌐 Deployment

### Backend Deployment (Render)

1. **Push to GitHub:**
```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
```

2. **Deploy on Render:**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name:** `agentlink-server`
     - **Environment:** `Node`
     - **Build Command:** `npm install`
     - **Start Command:** `node server.js`
     - **Instance Type:** `Free`

3. **Set Environment Variables:**
   - `SELLER_WALLET=0xYourAddress`
   - `GROQ_API_KEY=gsk_YourKey`

4. **Deploy!** Your API will be at: `https://agentlink-server.onrender.com`

### Frontend Deployment (Netlify)

1. **Update API URL in `dashboard.html`:**
```javascript
   const API_URL = 'https://agentlink-server.onrender.com';
```

2. **Deploy:**
   - Go to https://app.netlify.com/drop
   - Rename `dashboard.html` to `index.html`
   - Drag and drop the file
   - Done! Get instant URL

**Alternative:** Use Vercel for frontend hosting.

---

## 🧪 Testing

### Test CLI Agent
```bash
# Test different tokens
cd buyer
node agent.js BTC   # Bitcoin
node agent.js ETH   # Ethereum
node agent.js CRO   # Cronos
node agent.js SOL   # Solana
node agent.js PEPE  # Pepe (meme coin)
```

### Test Web Dashboard

1. Ensure MetaMask is connected to Cronos Testnet
2. Have at least 0.05 devUSDC in your wallet
3. Open dashboard in browser
4. Connect wallet
5. Try analyzing multiple tokens

### Supported Tokens

| Token | Name | Market Cap |
|-------|------|------------|
| BTC | Bitcoin | $1.8T |
| ETH | Ethereum | $400B |
| CRO | Cronos | $3B |
| SOL | Solana | $70B |
| BNB | Binance Coin | $90B |
| ADA | Cardano | $30B |
| DOT | Polkadot | $10B |
| PEPE | Pepe | $8B |
| MATIC | Polygon | $7B |

---

## 🔐 Security Notes

### Best Practices

- ✅ Never commit `.env` files to Git
- ✅ Use `.gitignore` to exclude sensitive files
- ✅ Private keys should only be used in CLI mode
- ✅ Always verify smart contract addresses
- ✅ Test thoroughly on testnet before mainnet

### Smart Contract Addresses (Cronos Testnet)

| Contract | Address |
|----------|---------|
| devUSDC | `0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0` |
| RPC URL | `https://evm-t3.cronos.org` |
| Chain ID | `338` |
| Explorer | https://explorer.cronos.org/testnet |

### Rate Limiting

The server implements basic rate limiting:
- Maximum 50 logs stored
- Payment verification retries: 5 attempts
- Retry delay: 2 seconds

---

## 🛣️ Roadmap

### Phase 1: Core Features ✅
- [x] Multi-round AI consensus
- [x] Dual payment modes (CLI + Web)
- [x] Cronos integration
- [x] Real-time market data

### Phase 2: Enhancements (Q1 2026)
- [ ] Add more AI models (GPT-4, Claude, Gemini)
- [ ] Historical consensus tracking
- [ ] Model performance analytics
- [ ] Advanced charting

### Phase 3: Scale (Q2 2026)
- [ ] Mainnet deployment
- [ ] Support more blockchains (Ethereum, Polygon, BSC)
- [ ] Subscription tiers
- [ ] White-label API for enterprises

### Phase 4: Governance (Q3 2026)
- [ ] DAO for model selection
- [ ] Community voting on features
- [ ] Revenue sharing model
- [ ] Mobile app (iOS/Android)

---

## 🤝 Contributing

We welcome contributions! Here's how:

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch:
```bash
   git checkout -b feature/amazing-feature
```
3. **Commit** your changes:
```bash
   git commit -m 'Add amazing feature'
```
4. **Push** to your branch:
```bash
   git push origin feature/amazing-feature
```
5. **Open** a Pull Request

### Areas for Contribution

- 🤖 Additional AI models integration
- 🎨 UI/UX improvements
- 📊 Data source integrations
- 🧪 Testing and documentation
- 🔒 Security audits

---

## 📄 License

This project is licensed under the **MIT License**.
```
MIT License

Copyright (c) 2026 AgentLink

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🏆 Hackathon Submission

### Track Information

**Hackathon:** Cronos x402 Paytech Hackathon  
**Track:** Track 3 - Crypto.com X Cronos Ecosystem Integrations with x402  
**Team:** [Your Team Name]  
**Submission Date:** January 2026

### Links

- 🌐 **Live Demo (Server):** https://your-server.onrender.com
- 🎨 **Live Demo (Dashboard):** https://your-dashboard.netlify.app
- 🎥 **Demo Video:** [YouTube Link]
- 📊 **Presentation:** [Slides Link]

### Integration Checklist

- [x] Crypto.com Exchange API for market data
- [x] Cronos Testnet for blockchain settlement
- [x] HTTP 402 protocol implementation
- [x] Facilitator SDK integration
- [x] Multi-round AI consensus
- [x] Dual access modes (CLI + Web)

---

## 🙏 Acknowledgments

Special thanks to:

- **Crypto.com** - For the Exchange API and Facilitator SDK
- **Cronos** - For the blockchain infrastructure and testnet
- **Groq** - For high-performance AI inference
- **Anthropic** - For AI model development and training
- **The Hackathon Organizers** - For this amazing opportunity

---

## 📞 Contact

### Developers

- **GitHub:** [@yourusername](https://github.com/yourusername)
- **Twitter:** [@yourhandle](https://twitter.com/yourhandle)
- **Email:** your.email@example.com
- **Discord:** YourDiscord#1234

### Support

Found a bug? Have a feature request?

- 🐛 [Open an Issue](https://github.com/yourusername/agentlink/issues)
- 💬 [Start a Discussion](https://github.com/yourusername/agentlink/discussions)
- 📧 Email us at: support@agentlink.dev

---

## 📈 Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/agentlink?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/agentlink?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/agentlink)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/agentlink)

---

<div align="center">

### 🌟 Star this repository if you find it useful! 🌟

**Built with ❤️ for the Cronos x402 Paytech Hackathon**

[⬆ Back to Top](#agentlink---multi-round-ai-consensus-engine)

</div>