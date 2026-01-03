// agent-link-pro/buyer/agent.js
// ⚡ FINAL AGENT: Official SDK + Dynamic Input
require('dotenv').config();
const axios = require('axios');
const { ethers } = require('ethers');
const { Facilitator, CronosNetwork } = require('@crypto.com/facilitator-client');

// CONFIG
const PROVIDER_URL = "https://evm-t3.cronos.org";

// 1. DYNAMIC TARGET (CLI Input)
const args = process.argv.slice(2);
const TARGET_TOKEN = args[0] ? args[0].toUpperCase() : "PEPE"; // Default to PEPE
const ORACLE_URL = `http://127.0.0.1:3000/api/analyze/${TARGET_TOKEN}`;

// SETUP
const facilitator = new Facilitator({ network: CronosNetwork.CronosTestnet });
const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
const signer = new ethers.Wallet(process.env.BUYER_PRIVATE_KEY, provider);

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function runOfficialAgent() {
    console.clear();
    console.log(`\n🤖 AGENT LINKED [${signer.address.slice(0,6)}...]`);
    console.log(`   🎯 TARGET: ${TARGET_TOKEN}`);
    console.log(`   📡 SOURCE: Crypto.com Exchange API`);
    await sleep(800);

    try {
        console.log(`\n1️⃣  Requesting Intelligence...`);
        // Attempt 1: Hit the API (Expect 402)
        await axios.get(ORACLE_URL);

    } catch (error) {
        if (error.response && error.response.status === 402) {
            
            // 2. PARSE INVOICE
            const invoice = error.response.data;
            console.log(`   🛑 402 Payment Required`);
            console.log(`   🧾 Invoice: ${invoice.amount} units (USDC) -> Seller`);
            await sleep(500);

            try {
                console.log(`\n⚡ INITIALIZING SDK SETTLEMENT...`);
                
                // A. Generate Header
                const header = await facilitator.generatePaymentHeader({
                    to: invoice.pay_to,
                    value: invoice.amount.toString(),
                    signer: signer,
                    token: invoice.token, 
                    validBefore: Math.floor(Date.now() / 1000) + 3600
                });

                // B. Generate Requirements
                const requirements = facilitator.generatePaymentRequirements({
                    payTo: invoice.pay_to,
                    description: `Data: ${TARGET_TOKEN}`,
                    maxAmountRequired: invoice.amount.toString(),
                    token: invoice.token
                });

                // C. Settle
                const body = facilitator.buildVerifyRequest(header, requirements);
                console.log(`   > Submitting to Facilitator API...`);
                
                const settleResponse = await facilitator.settlePayment(body);
                
                // Find the Hash (Safety check)
                const realTxHash = settleResponse.txHash || settleResponse.hash || settleResponse.transactionHash;

                if (!realTxHash) throw new Error("No Tx Hash returned from SDK");

                console.log(`   ✅ SETTLED! Tx: ${realTxHash}`);
                
                // 3. SEND PROOF
                console.log(`\n2️⃣  Redeeming Service with Proof...`);
                
                const retryResponse = await axios.get(ORACLE_URL, {
                    headers: { 'x-payment-hash': realTxHash },
                    timeout: 60000 // Wait up to 60s for server verification
                });

                console.log(`\n🎉 INTELLIGENCE ACQUIRED:`);
                console.log("------------------------------------------------");
                console.log(`📈 SOURCE: ${retryResponse.data.source}`);
                console.log(`🤖 AI SAYS: "${retryResponse.data.data}"`);
                
                if(retryResponse.data.market_stats) {
                    console.log(`📊 REAL STATS: Price $${retryResponse.data.market_stats.price} | Vol ${retryResponse.data.market_stats.volume}`);
                }
                console.log("------------------------------------------------");

            } catch (sdkErr) {
                console.error("❌ Error:", sdkErr.message);
                if (sdkErr.response) console.error("   Detail:", sdkErr.response.data);
            }
        } else {
            console.error("❌ Error:", error.message);
        }
    }
}

runOfficialAgent();