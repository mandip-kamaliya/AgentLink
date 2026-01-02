// BUYER: agent.js
require('dotenv').config();
const { FacilitatorClient } = require('@crypto.com/facilitator-client');
const { ethers } = require('ethers');

// CONFIG
if (!process.env.BUYER_PRIVATE_KEY) {
    console.error("❌ Missing BUYER_PRIVATE_KEY");
    process.exit(1);
}

const TARGET_TOKEN = "PEPE";
const ORACLE_URL = `http://localhost:3000/api/analyze/${TARGET_TOKEN}`;
const PROVIDER_URL = "https://evm-t3.cronos.org";

async function runOfficialAgent() {
    // 1. Setup Wallet
    const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    const wallet = new ethers.Wallet(process.env.BUYER_PRIVATE_KEY, provider);

    console.log(`\n🤖 OFFICIAL AGENT STARTING...`);
    console.log(`   ID: ${wallet.address}`);

    // 2. Initialize the Official Client
    // This SDK wrapper handles the handshake automatically
    const client = new FacilitatorClient({
        wallet: wallet,
        network: "cronos-testnet", 
        // If SDK asks for 'provider', pass it here:
        provider: provider 
    });

    try {
        console.log(`\n1️⃣  Requesting Intelligence from Oracle...`);
        
        // ✨ MAGIC: The SDK does the GET -> 402 -> Sign -> Pay -> Retry loop
        const response = await client.get(ORACLE_URL);

        console.log(`\n🎉 SUCCESS! ORACLE SAID:`);
        console.log("------------------------------------------------");
        console.log(response.data);
        console.log("------------------------------------------------");

    } catch (error) {
        console.error("❌ Agent Error:", error.message);
        if(error.response) console.error("   Server Detail:", error.response.data);
    }
}

runOfficialAgent();