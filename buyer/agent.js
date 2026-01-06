require('dotenv').config();
const axios = require('axios');
const { ethers } = require('ethers');
const { Facilitator, CronosNetwork } = require('@crypto.com/facilitator-client');

const PROVIDER_URL = "https://evm-t3.cronos.org";
const args = process.argv.slice(2);
const TARGET_TOKEN = args[0] ? args[0].toUpperCase() : "BTC";
const ORACLE_URL = `http://127.0.0.1:3000/api/analyze/${TARGET_TOKEN}`;

const facilitator = new Facilitator({ network: CronosNetwork.CronosTestnet });
const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
const signer = new ethers.Wallet(process.env.BUYER_PRIVATE_KEY, provider);

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function runAgent() {
  console.clear();
  console.log(`\n${"=".repeat(70)}`);
  console.log(`🤖 AGENTLINK BUYER AGENT`);
  console.log(`${"=".repeat(70)}`);
  console.log(`   Wallet: ${signer.address.slice(0,10)}...${signer.address.slice(-8)}`);
  console.log(`   Target: ${TARGET_TOKEN}`);
  console.log(`   Service: Multi-Round AI Consensus`);
  console.log(`${"=".repeat(70)}`);
  await sleep(800);

  try {
    console.log(`\n1️⃣  REQUESTING INTELLIGENCE...`);
    await axios.get(ORACLE_URL);
  } catch (error) {
    if (error.response && error.response.status === 402) {
      const invoice = error.response.data;
      console.log(`   🛑 402 Payment Required`);
      console.log(`   💰 Amount: ${ethers.formatUnits(invoice.amount, 6)} USDC`);
      console.log(`   📬 Pay to: ${invoice.pay_to.slice(0,10)}...${invoice.pay_to.slice(-8)}`);
      await sleep(500);

      try {
        console.log(`\n2️⃣  INITIATING PAYMENT SETTLEMENT...`);
        const header = await facilitator.generatePaymentHeader({
          to: invoice.pay_to,
          value: invoice.amount.toString(),
          signer: signer,
          token: invoice.token,
          validBefore: Math.floor(Date.now() / 1000) + 3600
        });

        const requirements = facilitator.generatePaymentRequirements({
          payTo: invoice.pay_to,
          description: `Multi-Round Consensus: ${TARGET_TOKEN}`,
          maxAmountRequired: invoice.amount.toString(),
          token: invoice.token
        });

        const body = facilitator.buildVerifyRequest(header, requirements);
        console.log(`   ⚙️  Submitting to Facilitator...`);
        const settleResponse = await facilitator.settlePayment(body);
        const txHash = settleResponse.txHash || settleResponse.hash;
        console.log(`   ✅ Payment Settled!`);
        console.log(`   🔗 Tx: ${txHash}`);

        console.log(`\n3️⃣  REDEEMING SERVICE WITH PROOF...`);
        const retryResponse = await axios.get(ORACLE_URL, {
          headers: { 'x-payment-hash': txHash },
          timeout: 60000
        });

        const data = retryResponse.data;
        
        console.log(`\n${"=".repeat(70)}`);
        console.log(`🎉 MULTI-ROUND CONSENSUS ACQUIRED`);
        console.log(`${"=".repeat(70)}`);
        
        console.log(`\n📊 MARKET DATA (${data.source}):`);
        console.log(`   Token: ${data.token}`);
        console.log(`   Price: $${data.market_stats.price}`);
        console.log(`   24h Change: ${data.market_stats.change}%`);
        console.log(`   Volume: $${data.market_stats.volume?.toLocaleString() || 'N/A'}`);
        
        console.log(`\n🤖 FINAL CONSENSUS:`);
        console.log(`   Signal: ${data.ai_consensus.signal}`);
        console.log(`   Agreement: ${data.ai_consensus.agreement}`);
        console.log(`   Confidence: ${data.ai_consensus.confidence}`);
        console.log(`   Rounds: ${data.ai_consensus.rounds}`);
        console.log(`   Evolution: ${data.ai_consensus.evolution}`);
        console.log(`   Votes: BUY=${data.ai_consensus.votes.BUY}, SELL=${data.ai_consensus.votes.SELL}, HOLD=${data.ai_consensus.votes.HOLD}`);
        
        if (data.analyses_by_round) {
          console.log(`\n💡 ROUND 1 - Independent Analysis:`);
          data.analyses_by_round.round_1.forEach(a => {
            console.log(`   • ${a.model} (${a.perspective}):`);
            console.log(`     ${a.signal} (${a.confidence}%) - ${a.reason}`);
          });
          
          console.log(`\n💡 ROUND 2 - Peer Review & Refinement:`);
          data.analyses_by_round.round_2.forEach(a => {
            console.log(`   • ${a.model} (${a.perspective}):`);
            console.log(`     ${a.signal} (${a.confidence}%) - ${a.reason}`);
          });
        }
        
        console.log(`\n📝 SUMMARY:`);
        console.log(`   ${data.ai_consensus.summary}`);
        
        console.log(`\n${"=".repeat(70)}\n`);
        
      } catch (err) {
        console.error("\n❌ ERROR:", err.message);
        if (err.response) {
          console.error("   Details:", err.response.data);
        }
      }
    } else {
      console.error("\n❌ ERROR:", error.message);
    }
  }
}

runAgent();