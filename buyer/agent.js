// agent-link-pro/buyer/agent.js
require('dotenv').config();
const axios = require('axios');
const { ethers } = require('ethers');
// 👇 THE OFFICIAL SDK IMPORT
const { Facilitator, CronosNetwork } = require('@crypto.com/facilitator-client');

// CONFIG
const TARGET_TOKEN = "PEPE";
const ORACLE_URL = `http://localhost:3000/api/analyze/${TARGET_TOKEN}`;
const PROVIDER_URL = "https://evm-t3.cronos.org";

// --- SAFETY CHECK ---
if (!process.env.BUYER_PRIVATE_KEY) {
    console.error("❌ CRITICAL ERROR: Missing BUYER_PRIVATE_KEY in .env");
    process.exit(1);
}

// 1. SETUP THE SDK
// The docs say the base URL is fixed internally, so we just pick the network.
const facilitator = new Facilitator({
    network: CronosNetwork.CronosTestnet
});

// Setup Ethers Signer (Required by SDK)
const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
const signer = new ethers.Wallet(process.env.BUYER_PRIVATE_KEY, provider);

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function runOfficialAgent() {
    console.clear();
    console.log(`\n🤖 OFFICIAL AGENT LINKED [${signer.address}]`);
    console.log(`   SDK: @crypto.com/facilitator-client`);
    console.log(`   Net: Cronos Testnet`);
    await sleep(800);

    try {
        console.log(`\n1️⃣  Requesting Intelligence...`);
        // Attempt 1: Hit the API (Expect 402)
        await axios.get(ORACLE_URL);

    } catch (error) {
        if (error.response && error.response.status === 402) {
            console.log(`   🛑 402 Payment Required`);
            
            // 2. PARSE INVOICE FROM SERVER
            // Our manual server sends: { pay_to, amount, currency }
            const invoice = error.response.data;
            const tokenAddress = invoice.token || "0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0";
            console.log(`   🧾 Invoice: ${invoice.amount} ${invoice.currency} -> ${invoice.pay_to}`);
            await sleep(500);

            try {
                console.log(`\n⚡ INITIALIZING SDK SETTLEMENT...`);
                
                // A. Generate the Payment Header (Sign the intent)
                // Note: The SDK treats 'value' as base units. 
                // If using Tokens/USDC, 1000000 = 1 USDC.
                // For this Hackathon demo, we pass the amount requested.
                const header = await facilitator.generatePaymentHeader({
                    to: invoice.pay_to,
                    value: invoice.amount.toString(), // Convert to Wei if needed
                    token:tokenAddress,
                    signer: signer,
                    validBefore: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiry
                });
                console.log(`   > EIP-3009 Header Signed`);

                // B. Generate Requirements object (Required by SDK)
                const requirements = facilitator.generatePaymentRequirements({
                    payTo: invoice.pay_to,
                    description: `AgentLink Service: ${TARGET_TOKEN}`,
                    maxAmountRequired: invoice.amount.toString(),
                    token:tokenAddress
                });

                // C. Build the Request Body
                const body = facilitator.buildVerifyRequest(header, requirements);

                // D. Settle (Execute On-Chain)
                console.log(`   > Submitting to Facilitator API...`);
                const settleResponse = await facilitator.settlePayment(body);

                console.log("\n🕵️ SDK DEBUG: What did the Facilitator return?");
                console.log(JSON.stringify(settleResponse, null, 2)); 
                console.log("-----------------------------------------------\n");
                
                console.log(`   ✅ SETTLED! Tx: ${settleResponse.txHash}`);
                
                // 3. SEND PROOF TO SELLER
                console.log(`\n2️⃣  Redeeming Service with Proof...`);
                const retryResponse = await axios.get(ORACLE_URL, {
                    headers: { 'x-payment-hash': settleResponse.txHash }
                });

                console.log(`\n🎉 INTELLIGENCE ACQUIRED:`);
                console.log("------------------------------------------------");
                console.log(retryResponse.data);
                console.log("------------------------------------------------");

            } catch (sdkErr) {
                console.error("❌ SDK Error:", sdkErr.message);
                if (sdkErr.response) console.error("   API Detail:", sdkErr.response.data);
            }
        } else {
            console.error("❌ Network Error:", error.message);
        }
    }
}

runOfficialAgent();