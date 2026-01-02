require('dotenv').config();
const express=require('express');
const cors = require('cors');
const ethers = require('ethers');
const openai = require('openai');

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
                currency: "TCRO",
                amount: PRICE,
                to: SELLER_WALLET
            }],
            // Fallback for simple clients
            pay_to: SELLER_WALLET,
            amount: PRICE
        });
    }
}

//Api
app.get("/api/analyze/:token",middleware,async (req,res)=>{
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