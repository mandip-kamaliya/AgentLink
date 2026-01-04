const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function checkModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log("Checking available models for your key...");
  console.log(`Your Key: ${process.env.GEMINI_API_KEY.slice(0, 10)}...\n`);
  
  // Updated list of current Gemini models (as of 2024-2025)
  const candidates = [
    "gemini-2.0-flash-exp",        // Latest experimental
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",         // Lightweight version
    "gemini-1.5-pro",              // Pro version
    "gemini-1.5-pro-latest",
    "gemini-pro",                  // Legacy
    "models/gemini-1.5-flash",     // With 'models/' prefix
    "models/gemini-1.5-pro"
  ];

  for (const modelName of candidates) {
    try {
      console.log(`Testing: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent("Say 'OK' if you work");
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ SUCCESS: ${modelName}`);
      console.log(`   Response: ${text.slice(0, 50)}\n`);
      
    } catch (e) {
      if (e.message.includes("404") || e.message.includes("not found")) {
        console.log(`❌ Not Available: ${modelName}`);
      } else if (e.message.includes("API key")) {
        console.log(`🔑 API Key Issue: ${modelName}`);
        console.log(`   Error: ${e.message}\n`);
        break; // Stop if API key is invalid
      } else {
        console.log(`⚠️  Error (${modelName}): ${e.message.slice(0, 80)}\n`);
      }
    }
  }
}

checkModels();