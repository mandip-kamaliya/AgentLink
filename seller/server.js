require('dotenv').config();
const express=require('express');
const cors = require('cors');
const ethers = require('ethers');
const openai = require('openai');


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

app.listen(PORT,()=>{
    console.log(`🟢 AGENT-LINK PRO SERVER ONLINE (${PORT})`)
});