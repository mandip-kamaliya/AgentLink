require('dotenv').config();
const express = require('express');
const cors = require('cors');
const ethers = require('ethers');
const { GoogleGenerativeAI } = require("@google/generative-ai"); // 🔹 SWITCH TO NATIVE SDK
const axios = require('axios');

// --- 1. SAFETY CHECKS ---
if (!process.env.SELLER_WALLET) {
    console.error("❌ CRITICAL ERROR: SELLER_WALLET is missing in .env file.");
    process.exit(1);
}

// --- 2. CONFIGURATION ---
const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const SELLER_WALLET = process.env.SELLER_WALLET;
const PROVIDER_URL = "https://evm-t3.cronos.org";
const provider = new ethers.JsonRpcProvider(PROVIDER_URL);

// TOKEN SETTINGS
const DEV_USDC_ADDRESS = "0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0";
const PRICE_UNITS = "10000"; 

// --- 🤖 AI SETUP (NATIVE GEMINI) ---
let geminiModel = null;
if (process.env.GEMINI_API_KEY) {
    console.log("🔹 Initializing Native Gemini Client...");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // 🔹 We configure the persona directly in the model initialization
    geminiModel = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: "You are a Sarcastic Crypto Trader. You give short, funny, roasted trading signals."
    });
} else {
    console.warn("⚠️  WARNING: GEMINI_API_KEY missing. AI features will be disabled.");
}

// --- 3. LOGGING SYSTEM ---
const logs = [];
function logEvent(type, agent, message) {
    const time = new Date().toLocaleTimeString();
    logs.unshift({ time, type, agent, message });
    if (logs.length > 50) logs.pop();
    console.log(`[${time}] ${type}: ${message}`);
}

// --- 4. PAYMENT VERIFICATION LOGIC ---
async function verifyTokenPayment(txHash) {
    console.log(`🔎 LOOKING FOR RECEIPT: ${txHash}`);
    for (let i = 0; i < 5; i++) {
        try {
            const receipt = await provider.getTransactionReceipt(txHash);
            if (!receipt) {
                console.log(`   ...attempt ${i+1}/5: Receipt not indexed yet...`);
                await new Promise(r => setTimeout(r, 2000)); 
                continue;
            }

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
                    console.log(`   💰 CONFIRMED: Received ${amount} units`);
                    return true;
                }
            }
        } catch (e) {
            console.error("   ❌ RPC Error:", e.message);
            await new Promise(r => setTimeout(r, 2000));
        }
    }
    return false;
}

// --- 5. x402 MIDDLEWARE ---
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

    logEvent("VERIFY", "System", `Checking Tx: ${txHash.slice(0, 10)}...`);
    const isValid = await verifyTokenPayment(txHash);

    if (isValid) {
        logEvent("PAID", "Agent", `✅ Payment Verified!`);
        next(); 
    } else {
        logEvent("ERROR", "Fraud", "Payment Verification Failed");
        res.status(403).json({ error: "Payment Invalid or Not Found" });
    }
};

// --- 6. THE INTELLIGENT API ROUTE ---
app.get("/api/analyze/:token", x402Protocol, async (req, res) => {
    const rawToken = req.params.token || "CRO";
    const token = rawToken.toUpperCase();
    
    let marketData = null;
    let source = "Simulation"; 
    let analysis = "";

    try {
        logEvent("DATA", "System", `Fetching market data for ${token}...`);

        // Attempt 1: Crypto.com Exchange
        try {
            const pair = `${token}_USDT`;
            const cdcConfig = { headers: { 'User-Agent': 'Mozilla/5.0...' } };
            const cdc = await axios.get(`https://api.crypto.com/v2/public/get-ticker?instrument_name=${pair}`, cdcConfig);
            if (cdc.data.result && cdc.data.result.data) {
                const d = cdc.data.result.data[0];
                marketData = { price: d.a, high: d.h, low: d.l, volume: d.v };
                source = "Crypto.com Exchange API"; 
            }
        } catch (e) { console.log("   ⚠️ CDC API Blocked/Failed"); }

        // Attempt 2: CoinGecko
        if (!marketData) {
            try {
                const ids = { BTC: "bitcoin", ETH: "ethereum", CRO: "crypto-com-chain", PEPE: "pepe", SOL: "solana" };
                const id = ids[token] || token.toLowerCase();
                const cg = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_vol=true`);
                if (cg.data[id]) {
                    marketData = { price: cg.data[id].usd, high: "N/A", low: "N/A", volume: cg.data[id].usd_24h_vol };
                    source = "CoinGecko API"; 
                }
            } catch (e) { console.log("   ⚠️ CoinGecko Failed"); }
        }

        // Attempt 3: Simulation
        if (!marketData) {
            marketData = { price: (Math.random() * 1000).toFixed(2), high: "0.00", volume: "1000000" };
            source = "Simulation Mode"; 
        }

        // --- 🤖 GEMINI ANALYSIS (NATIVE) ---
        if (geminiModel) {
            logEvent("AI", "Gemini", `Analyzing ${source} data...`);
            const prompt = `
                Token: ${token}
                Source: ${source}
                Price: $${marketData.price}
                Task: Give a 1-sentence funny trading signal based on this price.
            `;
            
            try {
                // 🔹 Native Call
                const result = await geminiModel.generateContent(prompt);
                const response = await result.response;
                analysis = response.text();
            } catch (aiError) {
                console.error("Gemini Error:", aiError.message);
                analysis = "AI Brain Freeze (Gemini Error)";
            }
        } else {
            analysis = `${source} reports ${token} at $${marketData.price}. (AI Offline)`;
        }

    } catch (e) {
        console.error("CRITICAL ERROR:", e);
        analysis = "System Reboot Required.";
    }

    res.json({
        success: true,
        source: source,
        token: token,
        data: analysis,
        market_stats: marketData,
        served_by: "AgentLink Pro (Native Gemini)"
    });
});

app.get('/logs', (req, res) => res.json(logs));

app.listen(PORT, () => {
    console.log(`\n🟢 AGENT-LINK PRO SERVER ONLINE (${PORT})`);
    console.log(`   💰 Accepting: 0.01 USDC`);
    console.log(`   📡 AI Powered by: Native Google Gemini`);
});