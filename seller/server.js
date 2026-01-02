require('dotenv').config();
const express=require('express');
const cors = require('cors');
const ethers = require('ethers');
const openai = require('openai');

const app=express();
const PORT = 3000;

app.listen(PORT,()=>{
    console.log(`🟢 AGENT-LINK PRO SERVER ONLINE (${PORT})`)
});