require('dotenv').config();
const express=require('express');
const cors = require('cors');
const ethers = require('ethers');
const OpenAI = require('openai');

//checking
if(!process.env.SELLER_WALLET){
    console.log("server wallet is missing");
}

const app=express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const SELLER_WALLET = process.env.SELLER_WALLET;
const PRICE = "0.01";
const PROVIDER_URL = "https://evm-t3.cronos.org";
const provider = new ethers.JsonRpcProvider(PROVIDER_URL);

const DEV_USDC_ADDRESS = "0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0";

// OpenAI Setup (Optional)
let openai = null;
if (process.env.OPENAI_API_KEY) openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

//logging
const logs = [];
function logEvent(type, agent, message) {
    logs.unshift({ time: new Date().toLocaleTimeString(), type, agent, message });
    if (logs.length > 50) logs.pop();
}


//middleware
const x402Protocol = async (req,res,next)=>{
    const txHash = req.headers['x-payment-hash'] || req.headers['payment-hash'];

    if(!txHash){
        logEvent("BLOCK", "Anonymous", "Sending 402 Payment Challenge");

        return res.status(402).json({
            error: "Payment Required",
            schemes: [{
                network: "cronos-testnet",
                currency: "USDC",
                amount: "100000",
                to: SELLER_WALLET,
                token: DEV_USDC_ADDRESS
            }],
            // Fallback for simple clients
            pay_to: SELLER_WALLET,
            currency: "USDC",
            amount: "100000",
            token: DEV_USDC_ADDRESS
        });

        // VERIFY USING NEW FUNCTION
    logEvent("VERIFY", "System", `Checking Tx: ${txHash.slice(0, 10)}...`);
    
    // 👇 THIS IS THE FIX
    const isValid = await verifyTokenPayment(txHash);

    if (isValid) {
        logEvent("PAID", "Agent", `✅ USDC Payment Confirmed!`);
        next();
    } else {
        logEvent("ERROR", "Fraud", "Payment Verification Failed");
        res.status(403).json({ error: "Payment Invalid or Not Found" });
    }
    }

    // Verify Payment
    async function verifyTokenPayment(txHash) {
    try {
        // 1. Get the Receipt (contains logs)
        const receipt = await provider.getTransactionReceipt(txHash);
        if (!receipt) return false;

        // 2. Look for "Transfer" Event (Standard ERC-20 Log)
        // Topic 0: The "Transfer" signature
        // Topic 2: The "To" address (You)
        const transferTopic = ethers.id("Transfer(address,address,uint256)");
        const sellerTopic = ethers.zeroPadValue(SELLER_WALLET, 32);

        const paymentLog = receipt.logs.find(log => {
            return log.address.toLowerCase() === DEV_USDC_ADDRESS.toLowerCase() && // Came from USDC Contract
                   log.topics[0] === transferTopic && // Was a Transfer
                   log.topics[2].toLowerCase() === sellerTopic.toLowerCase(); // Was sent to YOU
        });

        if (paymentLog) {
            // Optional: Check if amount is enough
            const amountPaid = BigInt(paymentLog.data);
            if (amountPaid >= BigInt(PRICE_UNITS)) return true;
        }
        return false;

    } catch (e) {
        console.error("Verification Error:", e);
        return false;
    }
}
};


//Api
app.get("/api/analyze/:token",x402Protocol,async (req,res)=>{
        const token = req.params.token || "CRO" ;
        let analysis = `Simulation: ${token} is looking bullish based on volume.`;

        if (openai) {
        try {
            logEvent("AI", "GPT-3.5", `Thinking about ${token}...`);
            const completion = await openai.chat.completions.create({
                messages: [{ role: "user", content: `Give a 1-sentence funny crypto trading advice for ${token}.` }],
                model: "gpt-3.5-turbo",
            });
            analysis = completion.choices[0].message.content;
        } catch (e) { console.error("AI Error"); }
    }
    res.json({
        success: true,
        data: analysis,
        served_by: "AgentLink Pro"
    });
})

app.get('/logs', (req, res) => res.json(logs));

app.listen(PORT,()=>{
    console.log(`🟢 AGENT-LINK PRO SERVER ONLINE (${PORT})`)
});